/**
 * Tests for the new stateless StateMachineDefinition pattern
 */

import { StateMachine } from '@/core/StateMachine';
import {
  ActionExecutionError,
  GuardConditionError,
  InvalidTransitionError,
} from '@/errors';

describe('StateMachineDefinition (Stateless Pattern)', () => {
  describe('Basic Functionality', () => {
    it('should create a stateless definition', () => {
      const definition = StateMachine.definitionBuilder()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .buildDefinition();

      expect(definition.getInitialState()).toBe('IDLE');
      expect(definition.getAllStates()).toEqual(['IDLE', 'RUNNING']);
    });

    it('should process events without maintaining state', () => {
      const definition = StateMachine.definitionBuilder()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .buildDefinition();

      const context = { id: 'test' };

      // Process event from IDLE
      const result1 = definition.processEvent('IDLE', 'start', context);
      expect(result1.success).toBe(true);
      expect(result1.newState).toBe('RUNNING');

      // Definition doesn't maintain state - can process same transition again
      const result2 = definition.processEvent('IDLE', 'start', context);
      expect(result2.success).toBe(true);
      expect(result2.newState).toBe('RUNNING');
    });

    it('should handle invalid transitions', () => {
      const definition = StateMachine.definitionBuilder()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .buildDefinition();

      const context = { id: 'test' };
      const result = definition.processEvent('IDLE', 'invalid', context);

      expect(result.success).toBe(false);
      expect(result.newState).toBe('IDLE');
      expect(result.error).toBeInstanceOf(InvalidTransitionError);
    });

    it('should check transition availability', () => {
      const definition = StateMachine.definitionBuilder()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .buildDefinition();

      const context = { id: 'test' };

      expect(definition.canTransition('IDLE', 'start', context)).toBe(true);
      expect(definition.canTransition('IDLE', 'invalid', context)).toBe(false);
      expect(definition.canTransition('RUNNING', 'start', context)).toBe(false);
    });

    it('should get available events for a state', () => {
      const definition = StateMachine.definitionBuilder()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .state('COMPLETED')
        .transition('IDLE', 'RUNNING', 'start')
        .transition('RUNNING', 'COMPLETED', 'finish')
        .transition('RUNNING', 'IDLE', 'reset')
        .buildDefinition();

      expect(definition.getAvailableEvents('IDLE')).toEqual(['start']);
      expect(definition.getAvailableEvents('RUNNING')).toEqual([
        'finish',
        'reset',
      ]);
      expect(definition.getAvailableEvents('COMPLETED')).toEqual([]);
    });
  });

  describe('Guards and Actions', () => {
    it('should respect guard conditions', () => {
      const definition = StateMachine.definitionBuilder()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .guard((context) => context.allowed)
        .buildDefinition();

      const allowedContext = { allowed: true };
      const deniedContext = { allowed: false };

      expect(definition.canTransition('IDLE', 'start', allowedContext)).toBe(
        true
      );
      expect(definition.canTransition('IDLE', 'start', deniedContext)).toBe(
        false
      );

      const result1 = definition.processEvent('IDLE', 'start', allowedContext);
      expect(result1.success).toBe(true);

      const result2 = definition.processEvent('IDLE', 'start', deniedContext);
      expect(result2.success).toBe(false);
      expect(result2.error).toBeInstanceOf(GuardConditionError);
    });

    it('should execute actions', () => {
      const actionSpy = jest.fn();
      const definition = StateMachine.definitionBuilder()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .action(actionSpy)
        .buildDefinition();

      const context = { id: 'test' };
      const result = definition.processEvent('IDLE', 'start', context);

      expect(result.success).toBe(true);
      expect(actionSpy).toHaveBeenCalledWith(context);
    });

    it('should handle action failures', () => {
      const definition = StateMachine.definitionBuilder()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .action(() => {
          throw new Error('Action failed');
        })
        .buildDefinition();

      const context = { id: 'test' };
      const result = definition.processEvent('IDLE', 'start', context);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(ActionExecutionError);
    });
  });

  describe('Async Operations', () => {
    it('should handle async guards', async () => {
      const definition = StateMachine.definitionBuilder()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .guard(async (context) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return context.allowed;
        })
        .buildDefinition();

      const allowedContext = { allowed: true };
      const deniedContext = { allowed: false };

      expect(
        await definition.canTransitionAsync('IDLE', 'start', allowedContext)
      ).toBe(true);
      expect(
        await definition.canTransitionAsync('IDLE', 'start', deniedContext)
      ).toBe(false);
    });

    it('should handle async actions', async () => {
      const actionSpy = jest.fn();
      const definition = StateMachine.definitionBuilder()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .action(async (context) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          actionSpy(context);
        })
        .buildDefinition();

      const context = { id: 'test' };
      const result = await definition.processEventAsync(
        'IDLE',
        'start',
        context
      );

      expect(result.success).toBe(true);
      expect(actionSpy).toHaveBeenCalledWith(context);
    });

    it('should handle async transactions with rollback', async () => {
      const transactionSpy = jest.fn();
      const rollbackSpy = jest.fn();

      const definition = StateMachine.definitionBuilder()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .transaction(
          async (context) => {
            transactionSpy(context);
            if (context.shouldFail) {
              throw new Error('Transaction failed');
            }
          },
          async (context, error) => {
            rollbackSpy(context, error);
          }
        )
        .buildDefinition();

      // Successful transaction
      const successContext = { shouldFail: false };
      const result1 = await definition.processEventAsync(
        'IDLE',
        'start',
        successContext
      );

      expect(result1.success).toBe(true);
      expect(transactionSpy).toHaveBeenCalledWith(successContext);
      expect(rollbackSpy).not.toHaveBeenCalled();

      // Failed transaction with rollback
      const failContext = { shouldFail: true };
      const result2 = await definition.processEventAsync(
        'IDLE',
        'start',
        failContext
      );

      expect(result2.success).toBe(false);
      expect(result2.rollbackExecuted).toBe(true);
      expect(transactionSpy).toHaveBeenCalledWith(failContext);
      expect(rollbackSpy).toHaveBeenCalledWith(failContext, expect.any(Error));
    });

    it('should reject async guards in sync processing', () => {
      const definition = StateMachine.definitionBuilder()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .guard(async () => true)
        .buildDefinition();

      const context = { id: 'test' };

      // Async guards should return false in sync context
      expect(definition.canTransition('IDLE', 'start', context)).toBe(false);

      const result = definition.processEvent('IDLE', 'start', context);
      expect(result.success).toBe(false);
    });

    it('should reject async actions in sync processing', () => {
      const definition = StateMachine.definitionBuilder()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .action(async () => {
          // This should cause an error in sync processing
        })
        .buildDefinition();

      const context = { id: 'test' };
      const result = definition.processEvent('IDLE', 'start', context);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain(
        'Async actions not supported in sync processing'
      );
    });
  });

  describe('Performance and Memory Efficiency', () => {
    it('should handle many objects with single definition', () => {
      const definition = StateMachine.definitionBuilder()
        .initialState('PENDING')
        .state('PENDING')
        .state('APPROVED')
        .transition('PENDING', 'APPROVED', 'approve')
        .buildDefinition();

      // Simulate many objects sharing the same definition
      const objects = Array.from({ length: 1000 }, (_, i) => ({
        id: `OBJ-${i}`,
        state: 'PENDING',
      }));

      // Process events for all objects
      objects.forEach((obj) => {
        const result = definition.processEvent(obj.state, 'approve', obj);
        if (result.success) {
          obj.state = result.newState;
        }
      });

      // All objects should be approved
      expect(objects.every((obj) => obj.state === 'APPROVED')).toBe(true);
    });

    it('should be stateless - no interference between calls', () => {
      const definition = StateMachine.definitionBuilder()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .buildDefinition();

      const context1 = { id: 'obj1' };
      const context2 = { id: 'obj2' };

      // Process events for different objects
      const result1 = definition.processEvent('IDLE', 'start', context1);
      const result2 = definition.processEvent('IDLE', 'start', context2);

      // Both should succeed independently
      expect(result1.success).toBe(true);
      expect(result1.newState).toBe('RUNNING');
      expect(result2.success).toBe(true);
      expect(result2.newState).toBe('RUNNING');

      // Definition should not maintain any state
      expect(definition.getInitialState()).toBe('IDLE');
    });
  });

  describe('Integration with StateMachine Factory', () => {
    it('should work with StateMachine.createDefinition factory', () => {
      const config = {
        initialState: 'IDLE' as const,
        states: ['IDLE', 'RUNNING'] as const,
        transitions: [
          {
            from: 'IDLE' as const,
            to: 'RUNNING' as const,
            event: 'start' as const,
          },
        ],
      };

      const definition = StateMachine.createDefinition(config);

      expect(definition.getInitialState()).toBe('IDLE');
      expect(definition.getAllStates()).toEqual(['IDLE', 'RUNNING']);

      const context = { id: 'test' };
      const result = definition.processEvent('IDLE', 'start', context);
      expect(result.success).toBe(true);
      expect(result.newState).toBe('RUNNING');
    });
  });
});
