import * as cdk from '../../core';
import * as stepfunctions from '../lib';

describe('Parallel State', () => {
  test('State Machine With Parallel State', () => {
    // GIVEN
    const stack = new cdk.Stack();

    // WHEN
    const parallel = new stepfunctions.Parallel(stack, 'Parallel State');
    parallel.branch(new stepfunctions.Pass(stack, 'Branch 1', { stateName: 'first-pass-state' }));
    parallel.branch(new stepfunctions.Pass(stack, 'Branch 2'));

    // THEN
    expect(render(parallel)).toStrictEqual({
      StartAt: 'Parallel State',
      States: {
        'Parallel State': {
          Type: 'Parallel',
          End: true,
          Branches: [
            { StartAt: 'first-pass-state', States: { 'first-pass-state': { Type: 'Pass', End: true } } },
            { StartAt: 'Branch 2', States: { 'Branch 2': { Type: 'Pass', End: true } } },
          ],
        },
      },
    });
  });

  test('State Machine With Parallel State and ResultSelector', () => {
    // GIVEN
    const stack = new cdk.Stack();

    // WHEN
    const parallel = new stepfunctions.Parallel(stack, 'Parallel State', {
      resultSelector: {
        buz: 'buz',
        baz: stepfunctions.JsonPath.stringAt('$.baz'),
      },
    });
    parallel.branch(new stepfunctions.Pass(stack, 'Branch 1'));

    // THEN
    expect(render(parallel)).toStrictEqual({
      StartAt: 'Parallel State',
      States: {
        'Parallel State': {
          Type: 'Parallel',
          End: true,
          Branches: [
            { StartAt: 'Branch 1', States: { 'Branch 1': { Type: 'Pass', End: true } } },
          ],
          ResultSelector: {
            'buz': 'buz',
            'baz.$': '$.baz',
          },
        },
      },
    });
  });

  test('State Machine With Parallel State With Parameters', () => {
    // GIVEN
    const stack = new cdk.Stack();

    // WHEN
    const parallel = new stepfunctions.Parallel(stack, 'Parallel State', {
      parameters: {
        staticString: 'Static Value',
        staticNumber: 123,
        dynamicValue: stepfunctions.JsonPath.stringAt('$.inputField'),
        executionName: stepfunctions.JsonPath.executionName,
      },
    });
    parallel.branch(new stepfunctions.Pass(stack, 'Branch 1'));

    // THEN
    expect(render(parallel)).toStrictEqual({
      StartAt: 'Parallel State',
      States: {
        'Parallel State': {
          Type: 'Parallel',
          End: true,
          Branches: [
            { StartAt: 'Branch 1', States: { 'Branch 1': { Type: 'Pass', End: true } } },
          ],
          Parameters: {
            'staticString': 'Static Value',
            'staticNumber': 123,
            'dynamicValue.$': '$.inputField',
            'executionName.$': '$$.Execution.Name',
          },
        },
      },
    });
  });

  test('State Machine With Parallel State using JSONata', () => {
    // GIVEN
    const stack = new cdk.Stack();

    // WHEN
    const parallel = stepfunctions.Parallel.jsonata(stack, 'Parallel State', {
      outputs: {
        foo: '{% $state.input.result[0] %}',
      },
    });
    parallel.branch(stepfunctions.Pass.jsonPath(stack, 'Branch 1', { stateName: 'first-pass-state' }));
    parallel.branch(stepfunctions.Pass.jsonPath(stack, 'Branch 2'));

    // THEN
    expect(render(parallel)).toStrictEqual({
      StartAt: 'Parallel State',
      States: {
        'Parallel State': {
          Type: 'Parallel',
          QueryLanguage: 'JSONata',
          End: true,
          Branches: [
            { StartAt: 'first-pass-state', States: { 'first-pass-state': { Type: 'Pass', End: true } } },
            { StartAt: 'Branch 2', States: { 'Branch 2': { Type: 'Pass', End: true } } },
          ],
          Output: {
            foo: '{% $state.input.result[0] %}',
          },
        },
      },
    });
  });
});

function render(sm: stepfunctions.IChainable) {
  return new cdk.Stack().resolve(new stepfunctions.StateGraph(sm.startState, 'Test Graph').toGraphJson());
}
