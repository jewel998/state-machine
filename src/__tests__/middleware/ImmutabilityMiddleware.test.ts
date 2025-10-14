/**
 * Tests for immutability middleware functionality
 */

import { StateMachine } from '../../core/StateMachine';
import {
  createImmerMiddleware,
  createNativeImmutabilityMiddleware,
  ImmutabilityMiddleware,
} from '../../middleware';

interface TestContext {
  count: number;
  data: {
    items: string[];
    metadata: Record<string, unknown>;
  };
}

type TestState = 'IDLE' | 'PROCESSING' | 'COMPLETE';
type TestEvent = 'start' | 'finish' | 'reset';

describe('ImmutabilityMiddleware', () => {
  describe('Native Provider', () => {
    it('should create immutable context copies', async () => {
      const middleware = createNativeImmutabilityMiddleware<
        TestContext,
        TestState
      >();

      const definition = StateMachine.definitionBuilder<
        TestContext,
        TestState,
        TestEvent
      >()
        .initialState('IDLE')
        .state('IDLE')
        .state('PROCESSING')
        .state('COMPLETE')
        .transition('IDLE', 'PROCESSING', 'start')
        .action((context: TestContext) => {
          context.count += 1;
          context.data.items.push('new item');
        })
        .transition('PROCESSING', 'COMPLETE', 'finish')
        .addMiddleware(middleware)
        .buildDefinition();

      const initialContext: TestContext = {
        count: 0,
        data: {
          items: ['item1'],
          metadata: { version: 1 },
        },
      };

      const result = await definition.processEventAsync(
        'IDLE',
        'start',
        initialContext
      );

      expect(result.success).toBe(true);
      expect(result.newState).toBe('PROCESSING');
      expect(result.context).toBeDefined();

      // Original context should be unchanged
      expect(initialContext.count).toBe(0);
      expect(initialContext.data.items).toEqual(['item1']);

      // Result context should have changes
      expect(result.context!.count).toBe(1);
      expect(result.context!.data.items).toEqual(['item1', 'new item']);

      // Result context should be frozen (immutable)
      expect(Object.isFrozen(result.context)).toBe(true);
    });

    it('should work without middleware in sync mode', () => {
      const definition = StateMachine.definitionBuilder<
        TestContext,
        TestState,
        TestEvent
      >()
        .initialState('IDLE')
        .state('IDLE')
        .state('PROCESSING')
        .transition('IDLE', 'PROCESSING', 'start')
        .action((context: TestContext) => {
          context.count += 1;
        })
        .buildDefinition();

      const context: TestContext = {
        count: 0,
        data: { items: [], metadata: {} },
      };

      const result = definition.processEvent('IDLE', 'start', context);

      expect(result.success).toBe(true);
      expect(result.newState).toBe('PROCESSING');
      // In sync mode without middleware, original context is modified
      expect(context.count).toBe(1);
    });
  });

  describe('Immer Provider', () => {
    it('should handle Immer provider when available', async () => {
      // Mock Immer availability
      const mockImmer = {
        produce: jest.fn((base, recipe) => {
          const draft = JSON.parse(JSON.stringify(base));
          recipe(draft);
          return draft;
        }),
        freeze: jest.fn((obj) => Object.freeze(obj)),
        isDraft: jest.fn(() => false),
        current: jest.fn((obj) => obj),
        original: jest.fn(() => undefined),
        enablePatches: jest.fn(),
        applyPatches: jest.fn(),
        produceWithPatches: jest.fn(),
      };

      try {
        const middleware = createImmerMiddleware<TestContext, TestState>({
          enablePatches: true,
          immerInstance: mockImmer,
        });

        const definition = StateMachine.definitionBuilder<
          TestContext,
          TestState,
          TestEvent
        >()
          .initialState('IDLE')
          .state('IDLE')
          .state('PROCESSING')
          .transition('IDLE', 'PROCESSING', 'start')
          .action((context: TestContext) => {
            context.count += 1;
          })
          .addMiddleware(middleware)
          .buildDefinition();

        const initialContext: TestContext = {
          count: 0,
          data: { items: [], metadata: {} },
        };

        const result = await definition.processEventAsync(
          'IDLE',
          'start',
          initialContext
        );

        expect(result.success).toBe(true);
        expect(mockImmer.produce).toHaveBeenCalled();
      } finally {
        // No cleanup needed
      }
    });

    it('should fallback gracefully when Immer is not available', () => {
      // Mock require to throw for Immer
      const originalRequire = require;
      (global as Record<string, unknown>).require = jest.fn((module) => {
        if (module === 'immer') {
          throw new Error('Module not found');
        }
        return originalRequire(module);
      });

      try {
        expect(() => {
          createImmerMiddleware<TestContext, TestState>();
        }).not.toThrow();
      } finally {
        // Restore original require
        (global as Record<string, unknown>).require = originalRequire;
      }
    });
  });

  describe('Custom Provider', () => {
    it('should work with custom immutability provider', async () => {
      const customProvider = {
        name: 'custom',
        clone: jest.fn((context) => JSON.parse(JSON.stringify(context))),
        freeze: jest.fn((context) => Object.freeze(context)),
        isImmutable: jest.fn(() => true),
      };

      const middleware = new ImmutabilityMiddleware<TestContext, TestState>({
        provider: customProvider,
        autoFreeze: true,
      });

      const definition = StateMachine.definitionBuilder<
        TestContext,
        TestState,
        TestEvent
      >()
        .initialState('IDLE')
        .state('IDLE')
        .state('PROCESSING')
        .transition('IDLE', 'PROCESSING', 'start')
        .action((context: TestContext) => {
          context.count += 1;
        })
        .addMiddleware(middleware.getMiddlewareConfig())
        .buildDefinition();

      const initialContext: TestContext = {
        count: 0,
        data: { items: [], metadata: {} },
      };

      const result = await definition.processEventAsync(
        'IDLE',
        'start',
        initialContext
      );

      expect(result.success).toBe(true);
      expect(customProvider.clone).toHaveBeenCalled();
      expect(customProvider.freeze).toHaveBeenCalled();
    });
  });

  describe('Strict Mode', () => {
    it('should throw errors in strict mode when immutability fails', async () => {
      const faultyProvider = {
        name: 'faulty',
        clone: jest.fn(() => {
          throw new Error('Clone failed');
        }),
        freeze: jest.fn(() => {
          throw new Error('Freeze failed');
        }),
        isImmutable: jest.fn(() => false),
      };

      const middleware = new ImmutabilityMiddleware<TestContext, TestState>({
        provider: faultyProvider,
        strictMode: true,
      });

      const definition = StateMachine.definitionBuilder<
        TestContext,
        TestState,
        TestEvent
      >()
        .initialState('IDLE')
        .state('IDLE')
        .state('PROCESSING')
        .transition('IDLE', 'PROCESSING', 'start')
        .addMiddleware(middleware.getMiddlewareConfig())
        .buildDefinition();

      const context: TestContext = {
        count: 0,
        data: { items: [], metadata: {} },
      };

      const result = await definition.processEventAsync(
        'IDLE',
        'start',
        context
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error!.message).toBe('Freeze failed');
    });

    it('should handle errors gracefully in non-strict mode', async () => {
      const faultyProvider = {
        name: 'faulty',
        clone: jest.fn(() => {
          throw new Error('Clone failed');
        }),
        freeze: jest.fn((context) => context),
        isImmutable: jest.fn(() => false),
      };

      const middleware = new ImmutabilityMiddleware<TestContext, TestState>({
        provider: faultyProvider,
        strictMode: false,
      });

      const definition = StateMachine.definitionBuilder<
        TestContext,
        TestState,
        TestEvent
      >()
        .initialState('IDLE')
        .state('IDLE')
        .state('PROCESSING')
        .transition('IDLE', 'PROCESSING', 'start')
        .addMiddleware(middleware.getMiddlewareConfig())
        .buildDefinition();

      const context: TestContext = {
        count: 0,
        data: { items: [], metadata: {} },
      };

      const result = await definition.processEventAsync(
        'IDLE',
        'start',
        context
      );

      expect(result.success).toBe(true);
      // Should return original context on error in non-strict mode
      expect(result.context).toBe(context);
    });
  });

  describe('State Entry/Exit Actions', () => {
    it('should apply immutability to state entry and exit actions', async () => {
      const middleware = createNativeImmutabilityMiddleware<
        TestContext,
        TestState
      >();

      const definition = StateMachine.definitionBuilder<
        TestContext,
        TestState,
        TestEvent
      >()
        .initialState('IDLE')
        .state('IDLE')
        .state('PROCESSING')
        .state('COMPLETE')
        .transition('IDLE', 'PROCESSING', 'start')
        .transition('PROCESSING', 'COMPLETE', 'finish')
        .onStateEntry('PROCESSING', (context: TestContext) => {
          context.data.metadata.entryTime = Date.now();
        })
        .onStateExit('PROCESSING', (context: TestContext) => {
          context.data.metadata.exitTime = Date.now();
        })
        .addMiddleware(middleware)
        .buildDefinition();

      const initialContext: TestContext = {
        count: 0,
        data: {
          items: [],
          metadata: {},
        },
      };

      const result1 = await definition.processEventAsync(
        'IDLE',
        'start',
        initialContext
      );
      expect(result1.success).toBe(true);
      expect(result1.context!.data.metadata.entryTime).toBeDefined();
      expect(Object.isFrozen(result1.context)).toBe(true);

      const result2 = await definition.processEventAsync(
        'PROCESSING',
        'finish',
        result1.context!
      );
      expect(result2.success).toBe(true);
      expect(result2.context!.data.metadata.exitTime).toBeDefined();
      expect(Object.isFrozen(result2.context)).toBe(true);
    });
  });
});
