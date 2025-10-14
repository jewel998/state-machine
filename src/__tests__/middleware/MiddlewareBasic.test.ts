/**
 * Basic middleware functionality tests
 */

import { StateMachine } from '../../core/StateMachine';
import { MiddlewareConfig } from '../../middleware/types';

interface TestContext {
  count: number;
}

type TestState = 'A' | 'B';
type TestEvent = 'go';

describe('Basic Middleware', () => {
  it('should create a state machine with middleware manager', () => {
    const definition = StateMachine.definitionBuilder<
      TestContext,
      TestState,
      TestEvent
    >()
      .initialState('A')
      .state('A')
      .state('B')
      .transition('A', 'B', 'go')
      .buildDefinition();

    expect(definition).toBeDefined();
    expect(definition.getInitialState()).toBe('A');
  });

  it('should add and manage middleware', () => {
    const definition = StateMachine.definitionBuilder<
      TestContext,
      TestState,
      TestEvent
    >()
      .initialState('A')
      .state('A')
      .state('B')
      .transition('A', 'B', 'go')
      .buildDefinition();

    const testMiddleware: MiddlewareConfig<TestContext, TestState> = {
      name: 'test',
      enabled: true,
    };

    definition.addMiddleware(testMiddleware);

    expect(definition.hasMiddleware('test')).toBe(true);
    expect(definition.getMiddleware('test')).toEqual(testMiddleware);

    definition.removeMiddleware('test');
    expect(definition.hasMiddleware('test')).toBe(false);
  });

  it('should process events without middleware', async () => {
    const definition = StateMachine.definitionBuilder<
      TestContext,
      TestState,
      TestEvent
    >()
      .initialState('A')
      .state('A')
      .state('B')
      .transition('A', 'B', 'go')
      .buildDefinition();

    const context: TestContext = { count: 0 };
    const result = await definition.processEventAsync('A', 'go', context);

    expect(result.success).toBe(true);
    expect(result.newState).toBe('B');
  });

  it('should execute simple action middleware', async () => {
    let middlewareExecuted = false;

    const actionMiddleware: MiddlewareConfig<TestContext, TestState> = {
      name: 'action-test',
      actionMiddleware: async (context, originalAction) => {
        middlewareExecuted = true;

        if (originalAction) {
          // Call originalAction - it should be an ActionFunction<TContext>
          await (originalAction as any)(context.currentContext);
        }

        return {
          context: context.currentContext,
          shouldContinue: true,
        };
      },
    };

    const definition = StateMachine.definitionBuilder<
      TestContext,
      TestState,
      TestEvent
    >()
      .initialState('A')
      .state('A')
      .state('B')
      .transition('A', 'B', 'go')
      .action((context) => {
        context.count += 1;
      })
      .addMiddleware(actionMiddleware)
      .buildDefinition();

    const context: TestContext = { count: 0 };
    const result = await definition.processEventAsync('A', 'go', context);

    expect(result.success).toBe(true);
    expect(middlewareExecuted).toBe(true);
  });
});
