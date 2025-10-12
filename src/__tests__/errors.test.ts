/**
 * Error classes tests
 */

import {
  ActionExecutionError,
  GuardConditionError,
  InvalidStateError,
  InvalidTransitionError,
  StateMachineConfigurationError,
  StateMachineError,
} from '../errors';

describe('Error Classes', () => {
  describe('StateMachineError', () => {
    it('should create a basic error', () => {
      const error = new StateMachineError('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(StateMachineError);
      expect(error.name).toBe('StateMachineError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBeUndefined();
    });

    it('should create an error with code', () => {
      const error = new StateMachineError('Test error', 'TEST_CODE');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
    });
  });

  describe('InvalidStateError', () => {
    it('should create error without valid states', () => {
      const error = new InvalidStateError('INVALID');
      expect(error).toBeInstanceOf(StateMachineError);
      expect(error.name).toBe('InvalidStateError');
      expect(error.message).toBe("Invalid state 'INVALID'");
      expect(error.code).toBe('INVALID_STATE');
    });

    it('should create error with valid states', () => {
      const error = new InvalidStateError('INVALID', ['IDLE', 'RUNNING']);
      expect(error.message).toBe(
        "Invalid state 'INVALID'. Valid states are: IDLE, RUNNING"
      );
    });
  });

  describe('InvalidTransitionError', () => {
    it('should create error without available events', () => {
      const error = new InvalidTransitionError('IDLE', 'invalid');
      expect(error).toBeInstanceOf(StateMachineError);
      expect(error.name).toBe('InvalidTransitionError');
      expect(error.message).toBe(
        "Invalid transition from 'IDLE' with event 'invalid'"
      );
      expect(error.code).toBe('INVALID_TRANSITION');
      expect(error.fromState).toBe('IDLE');
      expect(error.event).toBe('invalid');
    });

    it('should create error with available events', () => {
      const error = new InvalidTransitionError('IDLE', 'invalid', [
        'start',
        'stop',
      ]);
      expect(error.message).toBe(
        "Invalid transition from 'IDLE' with event 'invalid'. Available events: start, stop"
      );
      expect(error.availableEvents).toEqual(['start', 'stop']);
    });
  });

  describe('GuardConditionError', () => {
    it('should create guard condition error', () => {
      const error = new GuardConditionError('IDLE', 'RUNNING', 'start');
      expect(error).toBeInstanceOf(StateMachineError);
      expect(error.name).toBe('GuardConditionError');
      expect(error.message).toBe(
        "Guard condition failed for transition from 'IDLE' to 'RUNNING' with event 'start'"
      );
      expect(error.code).toBe('GUARD_CONDITION_FAILED');
      expect(error.fromState).toBe('IDLE');
      expect(error.toState).toBe('RUNNING');
      expect(error.event).toBe('start');
    });
  });

  describe('StateMachineConfigurationError', () => {
    it('should create configuration error', () => {
      const error = new StateMachineConfigurationError('Invalid configuration');
      expect(error).toBeInstanceOf(StateMachineError);
      expect(error.name).toBe('StateMachineConfigurationError');
      expect(error.message).toBe('Configuration error: Invalid configuration');
      expect(error.code).toBe('CONFIGURATION_ERROR');
    });
  });

  describe('ActionExecutionError', () => {
    it('should create action execution error', () => {
      const originalError = new Error('Original error');
      const error = new ActionExecutionError('entry', 'RUNNING', originalError);

      expect(error).toBeInstanceOf(StateMachineError);
      expect(error.name).toBe('ActionExecutionError');
      expect(error.message).toBe(
        "Error executing entry action for state 'RUNNING': Original error"
      );
      expect(error.code).toBe('ACTION_EXECUTION_ERROR');
      expect(error.actionType).toBe('entry');
      expect(error.state).toBe('RUNNING');
      expect(error.originalError).toBe(originalError);
      expect(error.cause).toBe(originalError);
    });

    it('should handle different action types', () => {
      const originalError = new Error('Test error');

      const entryError = new ActionExecutionError(
        'entry',
        'STATE',
        originalError
      );
      expect(entryError.message).toContain('entry action');

      const exitError = new ActionExecutionError(
        'exit',
        'STATE',
        originalError
      );
      expect(exitError.message).toContain('exit action');

      const transitionError = new ActionExecutionError(
        'transition',
        'STATE',
        originalError
      );
      expect(transitionError.message).toContain('transition action');
    });
  });

  describe('Error Inheritance', () => {
    it('should maintain proper prototype chain', () => {
      const errors = [
        new StateMachineError('test'),
        new InvalidStateError('test'),
        new InvalidTransitionError('from', 'event'),
        new GuardConditionError('from', 'to', 'event'),
        new StateMachineConfigurationError('test'),
        new ActionExecutionError('entry', 'state', new Error('test')),
      ];

      errors.forEach((error) => {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(StateMachineError);
        expect(error.name).toBeTruthy();
        expect(error.message).toBeTruthy();
      });
    });

    it('should be catchable as StateMachineError', () => {
      const errors = [
        new InvalidStateError('test'),
        new InvalidTransitionError('from', 'event'),
        new GuardConditionError('from', 'to', 'event'),
        new StateMachineConfigurationError('test'),
        new ActionExecutionError('entry', 'state', new Error('test')),
      ];

      errors.forEach((error) => {
        try {
          throw error;
        } catch (caught) {
          expect(caught).toBeInstanceOf(StateMachineError);
        }
      });
    });
  });
});
