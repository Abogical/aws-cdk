import { AtmosphereAllocation } from './atmosphere';
import { gitDiff } from './git';
import { runInteg } from './integ-run';

export const getChangedSnapshots = async (): Promise<string[]> => [...new Set(
  (await gitDiff()).split('\n').map(
    val => val.match(/^.*integ\.[^/]*\.js/)?.[0] || null,
  ).filter(val => val !== null))];

export const main = async ({ endpoint, pool }: {endpoint: string; pool: string}) => {
  const allocation = await AtmosphereAllocation.acquire({ endpoint, pool });
  let outcome = 'failure';

  try {
    await runInteg(await getChangedSnapshots(), allocation.allocation);
    outcome = 'success';
  } catch {} finally {
    await allocation.release(outcome);
  }

  if (outcome == 'failure') {
    throw Error('Deployment integration test did not pass');
  }
};

