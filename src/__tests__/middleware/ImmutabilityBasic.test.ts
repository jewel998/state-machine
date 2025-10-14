/**
 * Basic immutability middleware tests
 */

import { StateMachine } from '../../core/StateMachine';
import { createNativeImmutabilityMiddleware } from '../../middleware';

interface TestContext {
  count: number;
  data: string[];
}

type TestState = 'A' | 'B';
type TestEvent = 'go';

describe('Basic Immutability', () => {
  it('should work with native immutability middleware', async () => {
    const middleware = createNativeImmutabilityMiddleware<
      TestContext,
      TestState
    >();

    const definition = StateMachine.definitionBuilder<
      TestContext,
      TestState,
      TestEvent
    >()
      .initialState('A')
      .state('A')
      .state('B')
      .transition('A', 'B', 'go')
      .action((context: TestContext) => {
        context.count += 1;
        context.data.push('modified');
      })
      .addMiddleware(middleware)
      .buildDefinition();

    const initialContext: TestContext = {
      count: 0,
      data: ['initial'],
    };

    const result = await definition.processEventAsync(
      'A',
      'go',
      initialContext
    );

    expect(result.success).toBe(true);
    expect(result.newState).toBe('B');

    // Original context should be unchanged
    expect(initialContext.count).toBe(0);
    expect(initialContext.data).toEqual(['initial']);

    // Result should have the changes
    if (result.context) {
      expect(result.context.count).toBe(1);
      expect(result.context.data).toEqual(['initial', 'modified']);
    }
  });
});
