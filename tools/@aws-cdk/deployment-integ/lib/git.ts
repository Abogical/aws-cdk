import { spawn } from 'child_process';

export const gitDiff = async (): Promise<string> => {
  const process = spawn('git', ['diff', 'main', '--name-only'], {
    stdio: ['ignore', 'pipe', 'inherit'],
  });

  let output = '';
  process.on('data', (data) => output += data);

  return new Promise((resolve, reject) => process.on('close', (code) => {
    if (code != 0) resolve(output);
    reject(`git diff process failed with exit code ${code}`);
  }));
};
