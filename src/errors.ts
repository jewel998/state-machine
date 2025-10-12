/**
 * Custom error classes for the state machine library
 */

export class StateMachineError extends Error {
  constructor(
    message: string,
    public readonly code?: string // eslint-disable-line no-unused-vars
  ) {
    super(message);
    this.name = 'StateMachineError';
    Object.setPrototypeOf(this, StateMachineError.prototype);
  }
}

export class InvalidStateError extends StateMachineError {
  constructor(state: string, validStates?: string[]) {
    const message = validStates
      ? `Invalid state '${state}'. Valid states are: ${validStates.join(', ')}`
      : `Invalid state '${state}'`;
    super(message, 'INVALID_STATE');
    this.name = 'InvalidStateError';
    Object.setPrototypeOf(this, InvalidStateError.prototype);
  }
}

export class InvalidTransitionError extends StateMachineError {
  constructor(
    public readonly fromState: string,
    public readonly event: string,
    public readonly availableEvents?: string[]
  ) {
    const message = availableEvents
      ? `Invalid transition from '${fromState}' with event '${event}'. Available events: ${availableEvents.join(', ')}`
      : `Invalid transition from '${fromState}' with event '${event}'`;
    super(message, 'INVALID_TRANSITION');
    this.name = 'InvalidTransitionError';
    Object.setPrototypeOf(this, InvalidTransitionError.prototype);
  }
}

export class GuardConditionError extends StateMachineError {
  constructor(
    public readonly fromState: string,
    public readonly toState: string,
    public readonly event: string
  ) {
    super(
      `Guard condition failed for transition from '${fromState}' to '${toState}' with event '${event}'`,
      'GUARD_CONDITION_FAILED'
    );
    this.name = 'GuardConditionError';
    Object.setPrototypeOf(this, GuardConditionError.prototype);
  }
}

export class StateMachineConfigurationError extends StateMachineError {
  constructor(message: string) {
    super(`Configuration error: ${message}`, 'CONFIGURATION_ERROR');
    this.name = 'StateMachineConfigurationError';
    Object.setPrototypeOf(this, StateMachineConfigurationError.prototype);
  }
}

export class ActionExecutionError extends StateMachineError {
  public readonly cause: Error;

  constructor(
    public readonly actionType: 'entry' | 'exit' | 'transition',
    public readonly state: string,
    public readonly originalError: Error
  ) {
    super(
      `Error executing ${actionType} action for state '${state}': ${originalError.message}`,
      'ACTION_EXECUTION_ERROR'
    );
    this.name = 'ActionExecutionError';
    this.cause = originalError;
    Object.setPrototypeOf(this, ActionExecutionError.prototype);
  }
}
