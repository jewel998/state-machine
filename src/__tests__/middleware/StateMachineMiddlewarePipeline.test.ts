/**
 * State machine middleware pipeline tests
 */

import { StateMachine } from '../../core/StateMachine';
import { BaseMiddleware } from '../../middleware/BaseMiddleware';
// Example middleware factories have been moved to examples/ directory
import { MiddlewareResult, NextFunction } from '../../middleware/types';

interface TestContext {
  count: number;
  userId?: string;
  processed: boolean;
  errors: string[];
}

type TestState = 'A' | 'B' | 'C';
type TestEvent = 'next' | 'process' | 'complete';

// Custom test middleware
class TestMiddleware extends BaseMiddleware<TestContext, TestState> {
  public executionLog: string[] = [];

  constructor(name: string, priority: number = 0) {
    super(name, { priority });
  }

  async onGuard(
    context: StateMachineMiddlewareContext<TestContext>,
    next: () => Promise<boolean>,
    _originalGuard?: (context: TestContext) => boolean | Promise<boolean>
  ): Promise<boolean> {
    this.executionLog.push(`${this.name}-guard-start`);
    const result = await next();
    this.executionLog.push(`${this.name}-guard-end:${result}`);
    return result;
  }

  async onAction(
    context: StateMachineMiddlewareContext<TestContext>,
    next: NextFunction<TestContext>,
    _originalAction?: (context: TestContext) => void | Promise<void>
  ): Promise<MiddlewareResult<TestContext>> {
    this.executionLog.push(`${this.name}-action-start`);

    // Modify context before next
    context.currentContext.count += 1;

    const result = await next();

    this.executionLog.push(`${this.name}-action-end`);

    return this.createResult(
      result.context,
      result.shouldContinue,
      this.mergeMetadata(result.metadata || {}, { [this.name]: true })
    );
  }

  async onStateEntry(
    context: StateMachineMiddlewareContext<TestContext>,
    next: NextFunction<TestContext>,
    state: TestState,
    _originalAction?: (context: TestContext) => void | Promise<void>
  ): Promise<MiddlewareResult<TestContext>> {
    this.executionLog.push(`${this.name}-entry-${state}-start`);
    const result = await next();
    this.executionLog.push(`${this.name}-entry-${state}-end`);
    return result;
  }

  async onStateExit(
    context: StateMachineMiddlewareContext<TestContext>,
    next: NextFunction<TestContext>,
    state: TestState,
    _originalAction?: (context: TestContext) => void | Promise<void>
  ): Promise<MiddlewareResult<TestContext>> {
    this.executionLog.push(`${this.name}-exit-${state}-start`);
    const result = await next();
    this.executionLog.push(`${this.name}-exit-${state}-end`);
    return result;
  }
}

describe('State Machine Middleware Pipeline', () => {
  let definition: ReturnType<
    ReturnType<
      typeof StateMachine.definitionBuilder<TestContext, TestState, TestEvent>
    >['buildDefinition']
  >;
  let context: TestContext;

  beforeEach(() => {
    context = {
      count: 0,
      processed: false,
      errors: [],
    };

    definition = StateMachine.definitionBuilder<
      TestContext,
      TestState,
      TestEvent
    >()
      .initialState('A')
      .state('A')
      .state('B')
      .state('C')
      .transition('A', 'B', 'next')
      .guard((ctx) => ctx.count >= 0)
      .action((ctx) => {
        ctx.processed = true;
      })
      .transition('B', 'C', 'complete')
      .buildDefinition();
  });

  describe('Basic Chain Execution', () => {
    it('should execute middleware in priority order', async () => {
      const middleware1 = new TestMiddleware('first', 100);
      const middleware2 = new TestMiddleware('second', 50);
      const middleware3 = new TestMiddleware('third', 200);

      definition.addMiddleware(middleware1);
      definition.addMiddleware(middleware2);
      definition.addMiddleware(middleware3);

      const result = await definition.processEventAsync('A', 'next', context);

      expect(result.success).toBe(true);
      expect(result.newState).toBe('B');

      // Check execution order (priority: 50, 100, 200)
      const guardOrder = [
        'second-guard-start',
        'first-guard-start',
        'third-guard-start',
        'third-guard-end:true',
        'first-guard-end:true',
        'second-guard-end:true',
      ];

      expect(
        middleware2.executionLog.filter((log) => log.includes('guard'))
      ).toEqual(guardOrder.filter((log) => log.includes('second')));
      expect(
        middleware1.executionLog.filter((log) => log.includes('guard'))
      ).toEqual(guardOrder.filter((log) => log.includes('first')));
      expect(
        middleware3.executionLog.filter((log) => log.includes('guard'))
      ).toEqual(guardOrder.filter((log) => log.includes('third')));
    });

    it('should pass context modifications through the chain', async () => {
      const middleware1 = new TestMiddleware('first', 1);
      const middleware2 = new TestMiddleware('second', 2);

      definition.addMiddleware(middleware1);
      definition.addMiddleware(middleware2);

      const chainResult = await definition.processEventAsync(
        'A',
        'next',
        context
      );

      expect(chainResult.success).toBe(true);
      expect(chainResult.context?.count).toBe(2); // Each middleware increments by 1
      expect(chainResult.context?.processed).toBe(true); // Original action executed
    });

    it('should stop pipeline execution when middleware returns shouldContinue: false', async () => {
      class StoppingMiddleware extends BaseMiddleware<TestContext, TestState> {
        constructor() {
          super('stopper', { priority: 1 });
        }

        async onAction(
          context: StateMachineMiddlewareContext<TestContext>,
          _next: NextFunction<TestContext>
        ): Promise<MiddlewareResult<TestContext>> {
          return this.createResult(context.currentContext, false, {
            stopped: true,
          });
        }
      }

      const stoppingMiddleware = new StoppingMiddleware();
      const normalMiddleware = new TestMiddleware('normal', 2);

      definition.addMiddleware(stoppingMiddleware);
      definition.addMiddleware(normalMiddleware);

      const stopResult = await definition.processEventAsync(
        'A',
        'next',
        context
      );

      expect(stopResult.success).toBe(true);
      expect(stopResult.context?.processed).toBe(false); // Original action not executed
      // Note: Other middleware still execute for guard, entry, and exit actions
      expect(
        normalMiddleware.executionLog.filter((log) => log.includes('action'))
      ).toHaveLength(0);
    });
  });

  // Built-in Middleware Integration tests have been moved to examples/ directory
  // since the example middleware classes are now in examples/ as JavaScript files

  describe('Error Handling', () => {
    it('should handle middleware errors properly', async () => {
      class ErrorMiddleware extends BaseMiddleware<TestContext, TestState> {
        constructor() {
          super('error', { priority: 1 });
        }

        async onAction(): Promise<MiddlewareResult<TestContext>> {
          throw new Error('Middleware error');
        }
      }

      const errorMiddleware = new ErrorMiddleware();
      definition.addMiddleware(errorMiddleware);

      const errorResult = await definition.processEventAsync(
        'A',
        'next',
        context
      );
      expect(errorResult.success).toBe(false);
      expect(errorResult.error).toBeInstanceOf(Error);
      expect(errorResult.error?.message).toBe('Middleware error');
    });

    it('should call onError hook when middleware fails', async () => {
      let errorHandled = false;

      class ErrorHandlingMiddleware extends BaseMiddleware<
        TestContext,
        TestState
      > {
        constructor() {
          super('error-handler', { priority: 1 });
        }

        async onAction(): Promise<MiddlewareResult<TestContext>> {
          throw new Error('Test error');
        }

        async onError(error: Error): Promise<void> {
          errorHandled = true;
          throw error; // Re-throw to maintain error behavior
        }
      }

      const middleware = new ErrorHandlingMiddleware();
      definition.addMiddleware(middleware);

      const errorHandlingResult = await definition.processEventAsync(
        'A',
        'next',
        context
      );
      expect(errorHandlingResult.success).toBe(false);
      expect(errorHandlingResult.error).toBeInstanceOf(Error);
      expect(errorHandlingResult.error?.message).toBe('Test error');

      expect(errorHandled).toBe(true);
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should call onBeforeChain and onAfterChain hooks', async () => {
      let beforeChainCalled = false;
      let afterChainCalled = false;

      class LifecycleMiddleware extends BaseMiddleware<TestContext, TestState> {
        constructor() {
          super('lifecycle', { priority: 1 });
        }

        async onBeforeChain(): Promise<void> {
          beforeChainCalled = true;
        }

        async onAfterChain(): Promise<void> {
          afterChainCalled = true;
        }

        async onAction(
          context: StateMachineMiddlewareContext<TestContext>,
          next: NextFunction<TestContext>
        ): Promise<MiddlewareResult<TestContext>> {
          return await next();
        }
      }

      const middleware = new LifecycleMiddleware();
      definition.addMiddleware(middleware);

      const lifecycleResult = await definition.processEventAsync(
        'A',
        'next',
        context
      );

      expect(lifecycleResult.success).toBe(true);
      expect(beforeChainCalled).toBe(true);
      expect(afterChainCalled).toBe(true);
    });
  });

  describe('Chain Management', () => {
    it('should return correct chain order', async () => {
      const middleware1 = new TestMiddleware('first', 100);
      const middleware2 = new TestMiddleware('second', 50);
      const middleware3 = new TestMiddleware('third', 200);

      definition.addMiddleware(middleware1);
      definition.addMiddleware(middleware2);
      definition.addMiddleware(middleware3);

      const pipelineOrder = definition.getPipelineOrder?.() || [];
      expect(pipelineOrder).toEqual(['second', 'first', 'third']);
    });

    it('should clear all middleware', async () => {
      const middleware1 = new TestMiddleware('first', 1);
      const middleware2 = new TestMiddleware('second', 2);

      definition.addMiddleware(middleware1);
      definition.addMiddleware(middleware2);

      expect(definition.hasMiddleware('first')).toBe(true);
      expect(definition.hasMiddleware('second')).toBe(true);

      definition.clearPipeline?.();

      expect(definition.hasMiddleware('first')).toBe(false);
      expect(definition.hasMiddleware('second')).toBe(false);
    });
  });

  describe('Backward Compatibility', () => {
    it('should work with legacy middleware configuration', async () => {
      let guardExecuted = false;
      let actionExecuted = false;

      const legacyMiddleware = {
        name: 'legacy',
        priority: 1,
        guardMiddleware: async (_context: any) => {
          guardExecuted = true;
          return true;
        },
        actionMiddleware: async (_context: any) => {
          actionExecuted = true;
          return {
            context: _context.currentContext,
            shouldContinue: true,
            metadata: { legacy: true },
          };
        },
      };

      definition.addMiddleware(legacyMiddleware);

      const legacyResult = await definition.processEventAsync(
        'A',
        'next',
        context
      );

      expect(legacyResult.success).toBe(true);
      expect(guardExecuted).toBe(true);
      expect(actionExecuted).toBe(true);
    });
  });
});
