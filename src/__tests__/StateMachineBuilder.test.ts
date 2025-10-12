/**
 * StateMachineBuilder tests
 */

import { StateMachineBuilder } from '../core/StateMachineBuilder';
import { StateMachineConfigurationError } from '../errors';

describe('StateMachineBuilder', () => {
  describe('Builder Pattern', () => {
    it('should create a builder instance', () => {
      const builder = new StateMachineBuilder();
      expect(builder).toBeInstanceOf(StateMachineBuilder);
    });

    it('should chain method calls fluently', () => {
      const builder = new StateMachineBuilder()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .guard(() => true)
        .action(() => {})
        .onStateEntry('RUNNING', () => {})
        .onStateExit('IDLE', () => {});

      expect(builder).toBeInstanceOf(StateMachineBuilder);
    });

    it('should build a working state machine', () => {
      const machine = new StateMachineBuilder()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .build();

      expect(machine.getCurrentState()).toBe('IDLE');
    });
  });

  describe('State Management', () => {
    it('should automatically add states from transitions', () => {
      const machine = new StateMachineBuilder()
        .initialState('IDLE')
        .transition('IDLE', 'RUNNING', 'start')
        .transition('RUNNING', 'STOPPED', 'stop')
        .build();

      expect(machine.getCurrentState()).toBe('IDLE');
      machine.sendEvent('start');
      expect(machine.getCurrentState()).toBe('RUNNING');
      machine.sendEvent('stop');
      expect(machine.getCurrentState()).toBe('STOPPED');
    });

    it('should handle explicit state definitions', () => {
      const machine = new StateMachineBuilder()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .state('STOPPED')
        .transition('IDLE', 'RUNNING', 'start')
        .build();

      expect(machine.getAvailableEvents()).toEqual(['start']);
    });
  });

  describe('Transition Configuration', () => {
    it('should add guards to the last transition', () => {
      let guardCalled = false;
      const machine = new StateMachineBuilder<{ allowed: boolean }>()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .guard((context) => {
          guardCalled = true;
          return context.allowed;
        })
        .build();

      machine.start();
      const success = machine.sendEvent('start', { allowed: false });
      expect(success).toBe(false);
      expect(guardCalled).toBe(true);
    });

    it('should add actions to the last transition', () => {
      let actionCalled = false;
      const machine = new StateMachineBuilder<{}>()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .action(() => {
          actionCalled = true;
        })
        .build();

      machine.start();
      machine.sendEvent('start', {});
      expect(actionCalled).toBe(true);
    });

    it('should support multiple guards and actions on different transitions', () => {
      const logs: string[] = [];
      const machine = new StateMachineBuilder<{ logs: string[] }>()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .state('STOPPED')
        .transition('IDLE', 'RUNNING', 'start')
        .guard((context) => {
          context.logs.push('guard1');
          return true;
        })
        .action((context) => context.logs.push('action1'))
        .transition('RUNNING', 'STOPPED', 'stop')
        .guard((context) => {
          context.logs.push('guard2');
          return true;
        })
        .action((context) => context.logs.push('action2'))
        .build();

      const context = { logs };
      machine.start();
      machine.sendEvent('start', context);
      machine.sendEvent('stop', context);

      expect(logs).toEqual(['guard1', 'action1', 'guard2', 'action2']);
    });
  });

  describe('State Actions', () => {
    it('should add entry actions for states', () => {
      let entryCalled = false;
      const machine = new StateMachineBuilder<{}>()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .onStateEntry('RUNNING', () => {
          entryCalled = true;
        })
        .build();

      machine.start();
      machine.sendEvent('start', {});
      expect(entryCalled).toBe(true);
    });

    it('should add exit actions for states', () => {
      let exitCalled = false;
      const machine = new StateMachineBuilder<{}>()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .transition('IDLE', 'RUNNING', 'start')
        .onStateExit('IDLE', () => {
          exitCalled = true;
        })
        .build();

      machine.start();
      machine.sendEvent('start', {});
      expect(exitCalled).toBe(true);
    });

    it('should automatically add states from entry/exit actions', () => {
      const machine = new StateMachineBuilder()
        .initialState('IDLE')
        .onStateEntry('RUNNING', () => {})
        .onStateExit('STOPPED', () => {})
        .transition('IDLE', 'RUNNING', 'start')
        .transition('RUNNING', 'STOPPED', 'stop')
        .build();

      expect(machine.getCurrentState()).toBe('IDLE');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when adding guard without transition', () => {
      expect(() => {
        new StateMachineBuilder()
          .initialState('IDLE')
          .state('IDLE')
          .guard(() => true);
      }).toThrow(StateMachineConfigurationError);

      expect(() => {
        new StateMachineBuilder()
          .initialState('IDLE')
          .state('IDLE')
          .guard(() => true);
      }).toThrow(/Cannot add guard without a transition/);
    });

    it('should throw error when adding action without transition', () => {
      expect(() => {
        new StateMachineBuilder()
          .initialState('IDLE')
          .state('IDLE')
          .action(() => {});
      }).toThrow(StateMachineConfigurationError);

      expect(() => {
        new StateMachineBuilder()
          .initialState('IDLE')
          .state('IDLE')
          .action(() => {});
      }).toThrow(/Cannot add action without a transition/);
    });

    it('should throw error when building without initial state', () => {
      expect(() => {
        new StateMachineBuilder().state('IDLE').build();
      }).toThrow(StateMachineConfigurationError);

      expect(() => {
        new StateMachineBuilder().state('IDLE').build();
      }).toThrow(/Initial state is required/);
    });

    it('should automatically add initial state to states', () => {
      // This test verifies that initialState() automatically adds the state
      const machine = new StateMachineBuilder().initialState('IDLE').build();

      expect(machine.getCurrentState()).toBe('IDLE');
    });

    it('should work with minimal configuration', () => {
      // The builder should work with just an initial state
      expect(() => {
        new StateMachineBuilder().initialState('IDLE').build();
      }).not.toThrow();
    });
  });

  describe('Validation and Warnings', () => {
    it('should warn about unreachable states', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      new StateMachineBuilder()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .state('UNREACHABLE')
        .transition('IDLE', 'RUNNING', 'start')
        .build();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "State 'UNREACHABLE' is unreachable from initial state"
        )
      );

      consoleSpy.mockRestore();
    });

    it('should not warn when all states are reachable', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      new StateMachineBuilder()
        .initialState('IDLE')
        .state('IDLE')
        .state('RUNNING')
        .state('STOPPED')
        .transition('IDLE', 'RUNNING', 'start')
        .transition('RUNNING', 'STOPPED', 'stop')
        .transition('STOPPED', 'IDLE', 'reset')
        .build();

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle circular dependencies correctly', () => {
      const machine = new StateMachineBuilder()
        .initialState('A')
        .state('A')
        .state('B')
        .state('C')
        .transition('A', 'B', 'next')
        .transition('B', 'C', 'next')
        .transition('C', 'A', 'next')
        .build();

      expect(machine.getCurrentState()).toBe('A');
      machine.sendEvent('next');
      expect(machine.getCurrentState()).toBe('B');
      machine.sendEvent('next');
      expect(machine.getCurrentState()).toBe('C');
      machine.sendEvent('next');
      expect(machine.getCurrentState()).toBe('A');
    });
  });
});
