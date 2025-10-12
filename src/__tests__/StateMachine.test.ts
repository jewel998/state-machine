/**
 * StateMachine tests - Updated for server-scale testing
 */

import { StateMachine } from '../core/StateMachine';
import {
  ActionExecutionError,
  GuardConditionError,
  InvalidTransitionError,
  StateMachineConfigurationError,
} from '../errors';

interface TestContext {
  counter: number;
  logs: string[];
  shouldFail?: boolean;
}

describe('StateMachine', () => {
  describe('Basic Functionality', () => {
    it('should create a state machine with builder pattern', () => {
      const machine = StateMachine.builder()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .build();

      expect(machine).toBeInstanceOf(StateMachine);
      expect(machine.getCurrentState()).toBe('IDLE');
    });

    it('should transition between states', () => {
      const machine = StateMachine.builder<
        TestContext,
        'IDLE' | 'RUNNING',
        'start'
      >()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .build();

      machine.start();
      expect(machine.getCurrentState()).toBe('IDLE');

      const context: TestContext = { counter: 0, logs: [] };
      const success = machine.sendEvent('start', context);
      expect(success).toBe(true);
      expect(machine.getCurrentState()).toBe('RUNNING');
    });

    it('should return false for invalid transitions', () => {
      const machine = StateMachine.builder<
        TestContext,
        'IDLE' | 'RUNNING',
        'start'
      >()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .build();

      machine.start();
      const context: TestContext = { counter: 0, logs: [] };
      const success = machine.sendEvent('invalid' as any, context);
      expect(success).toBe(false);
      expect(machine.getCurrentState()).toBe('IDLE');
    });

    it('should get available events from current state', () => {
      const machine = StateMachine.builder()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .state('STOPPED')
        .transition('IDLE', 'RUNNING', 'start')
        .transition('IDLE', 'STOPPED', 'stop')
        .build();

      machine.start();
      const events = machine.getAvailableEvents();
      expect(events).toContain('start');
      expect(events).toContain('stop');
      expect(events).toHaveLength(2);
    });

    it('should check if transition is possible', () => {
      const machine = StateMachine.builder<
        TestContext,
        'IDLE' | 'RUNNING',
        'start'
      >()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .build();

      machine.start();
      const context: TestContext = { counter: 0, logs: [] };
      expect(machine.canTransition('start', context)).toBe(true);
      expect(machine.canTransition('invalid' as any, context)).toBe(false);
    });

    it('should reset to initial state', () => {
      const machine = StateMachine.builder<
        TestContext,
        'IDLE' | 'RUNNING',
        'start'
      >()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .build();

      machine.start();
      const context: TestContext = { counter: 0, logs: [] };
      machine.sendEvent('start', context);
      expect(machine.getCurrentState()).toBe('RUNNING');

      machine.reset();
      expect(machine.getCurrentState()).toBe('IDLE');
    });
  });

  describe('Guards and Actions', () => {
    it('should respect guard conditions', () => {
      const machine = StateMachine.builder<TestContext>()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .guard((context) => context.counter > 5)
        .build();

      machine.start();

      // Should fail guard condition
      let success = machine.sendEvent('start', { counter: 3, logs: [] });
      expect(success).toBe(false);
      expect(machine.getCurrentState()).toBe('IDLE');

      // Should pass guard condition
      success = machine.sendEvent('start', { counter: 10, logs: [] });
      expect(success).toBe(true);
      expect(machine.getCurrentState()).toBe('RUNNING');
    });

    it('should execute transition actions', () => {
      const context: TestContext = { counter: 0, logs: [] };

      const machine = StateMachine.builder<TestContext>()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .action((ctx) => {
          ctx.counter++;
          ctx.logs.push('transition executed');
        })
        .build();

      machine.start();
      machine.sendEvent('start', context);

      expect(context.counter).toBe(1);
      expect(context.logs).toContain('transition executed');
      expect(machine.getCurrentState()).toBe('RUNNING');
    });

    it('should execute entry and exit actions', () => {
      const context: TestContext = { counter: 0, logs: [] };

      const machine = StateMachine.builder<TestContext>()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .onStateEntry('RUNNING', (ctx) => ctx.logs.push('entered RUNNING'))
        .onStateExit('IDLE', (ctx) => ctx.logs.push('exited IDLE'))
        .build();

      machine.start();
      machine.sendEvent('start', context);

      expect(context.logs).toContain('exited IDLE');
      expect(context.logs).toContain('entered RUNNING');
      expect(machine.getCurrentState()).toBe('RUNNING');
    });
  });

  describe('Error Handling', () => {
    it('should throw InvalidTransitionError with sendEventStrict', () => {
      const machine = StateMachine.builder<
        TestContext,
        'IDLE' | 'RUNNING',
        'start'
      >()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .build();

      machine.start();
      const context: TestContext = { counter: 0, logs: [] };

      expect(() => {
        machine.sendEventStrict('invalid' as any, context);
      }).toThrow(InvalidTransitionError);

      expect(() => {
        machine.sendEventStrict('invalid' as any, context);
      }).toThrow(/Invalid transition from 'IDLE' with event 'invalid'/);
    });

    it('should throw GuardConditionError when guard fails with sendEventStrict', () => {
      const machine = StateMachine.builder<TestContext>()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .guard((context) => context.counter > 5)
        .build();

      machine.start();

      expect(() => {
        machine.sendEventStrict('start', { counter: 3, logs: [] });
      }).toThrow(GuardConditionError);
    });

    it('should throw ActionExecutionError when action fails', () => {
      const machine = StateMachine.builder<TestContext>()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .action((context) => {
          if (context.shouldFail) {
            throw new Error('Action failed');
          }
        })
        .build();

      machine.start();

      expect(() => {
        machine.sendEventStrict('start', {
          counter: 0,
          logs: [],
          shouldFail: true,
        });
      }).toThrow(ActionExecutionError);

      // State should not have changed due to rollback
      expect(machine.getCurrentState()).toBe('IDLE');
    });

    it('should throw ActionExecutionError when entry action fails', () => {
      const machine = StateMachine.builder<TestContext>()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .onStateEntry('RUNNING', (context) => {
          if (context.shouldFail) {
            throw new Error('Entry action failed');
          }
        })
        .build();

      machine.start();

      expect(() => {
        machine.sendEventStrict('start', {
          counter: 0,
          logs: [],
          shouldFail: true,
        });
      }).toThrow(ActionExecutionError);

      // State should not have changed due to rollback
      expect(machine.getCurrentState()).toBe('IDLE');
    });

    it('should throw GuardConditionError when guard throws', () => {
      const machine = StateMachine.builder<TestContext>()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .guard((context) => {
          if (context.shouldFail) {
            throw new Error('Guard failed');
          }
          return true;
        })
        .build();

      machine.start();

      expect(() => {
        machine.sendEventStrict('start', {
          counter: 0,
          logs: [],
          shouldFail: true,
        });
      }).toThrow(GuardConditionError);
    });
  });

  describe('Configuration Validation', () => {
    it('should throw error for missing initial state', () => {
      expect(() => {
        StateMachine.builder().state('IDLE').build();
      }).toThrow(StateMachineConfigurationError);
    });

    it('should work with minimal configuration', () => {
      expect(() => {
        StateMachine.builder().initialState('IDLE').build();
      }).not.toThrow();
    });

    it('should handle single state machine', () => {
      const machine = StateMachine.builder().initialState('SINGLE').build();

      expect(machine.getCurrentState()).toBe('SINGLE');
      expect(machine.getAvailableEvents()).toEqual([]);
    });

    it('should throw error for duplicate transitions', () => {
      expect(() => {
        StateMachine.builder()
          .initialState('IDLE')
          .state('IDLE')
          .state('RUNNING')
          .transition('IDLE', 'RUNNING', 'start')
          .transition('IDLE', 'RUNNING', 'start') // Duplicate
          .build();
      }).toThrow(StateMachineConfigurationError);
    });

    it('should throw error when adding guard without transition', () => {
      expect(() => {
        StateMachine.builder()
          .initialState('IDLE')
          .state('IDLE')
          .guard(() => true);
      }).toThrow(StateMachineConfigurationError);
    });

    it('should throw error when adding action without transition', () => {
      expect(() => {
        StateMachine.builder()
          .initialState('IDLE')
          .state('IDLE')
          .action(() => {});
      }).toThrow(StateMachineConfigurationError);
    });

    it('should warn about unreachable states', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      StateMachine.builder()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .state('UNREACHABLE') // This state has no transitions leading to it
        .transition('IDLE', 'RUNNING', 'start')
        .build();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "State 'UNREACHABLE' is unreachable from initial state"
        )
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle complex workflow with multiple states and transitions', () => {
      const context: TestContext = { counter: 0, logs: [] };

      const machine = StateMachine.builder<
        TestContext,
        'DRAFT' | 'REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED',
        'submit' | 'approve' | 'reject' | 'publish' | 'revise'
      >()
        .initialState('DRAFT')
        .state('DRAFT')
        .state('REVIEW')
        .state('APPROVED')
        .state('REJECTED')
        .state('PUBLISHED')
        .transition('DRAFT', 'REVIEW', 'submit')
        .action((ctx) => ctx.logs.push('submitted for review'))
        .transition('REVIEW', 'APPROVED', 'approve')
        .guard((ctx) => ctx.counter >= 2)
        .transition('REVIEW', 'REJECTED', 'reject')
        .transition('APPROVED', 'PUBLISHED', 'publish')
        .transition('REJECTED', 'DRAFT', 'revise')
        .onStateEntry('PUBLISHED', (ctx) => ctx.logs.push('content published'))
        .build();

      machine.start();
      expect(machine.getCurrentState()).toBe('DRAFT');

      // Submit for review
      machine.sendEvent('submit', context);
      expect(machine.getCurrentState()).toBe('REVIEW');
      expect(context.logs).toContain('submitted for review');

      // Try to approve (should fail guard)
      context.counter = 1;
      let success = machine.sendEvent('approve', context);
      expect(success).toBe(false);
      expect(machine.getCurrentState()).toBe('REVIEW');

      // Approve (should pass guard)
      context.counter = 3;
      success = machine.sendEvent('approve', context);
      expect(success).toBe(true);
      expect(machine.getCurrentState()).toBe('APPROVED');

      // Publish
      machine.sendEvent('publish', context);
      expect(machine.getCurrentState()).toBe('PUBLISHED');
      expect(context.logs).toContain('content published');
    });
  });
});
