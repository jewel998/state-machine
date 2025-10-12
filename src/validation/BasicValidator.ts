/**
 * Basic configuration validation strategy
 */

import {
  ContextConstraint,
  EventIdentifier,
  StateIdentifier,
  StateMachineConfig,
} from '@/interfaces';
import {
  IValidationStrategy,
  ValidationResult,
  ValidationResultImpl,
} from '@/patterns/Strategy';

export class BasicConfigurationValidator<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
  TEvent extends EventIdentifier,
> implements IValidationStrategy<StateMachineConfig<TContext, TState, TEvent>>
{
  public validate(
    config: StateMachineConfig<TContext, TState, TEvent>
  ): ValidationResult {
    const errors: string[] = [];

    // Validate initial state
    if (!config.initialState) {
      errors.push('Initial state is required');
    }

    // Validate states array
    if (!config.states || config.states.length === 0) {
      errors.push('At least one state is required');
    }

    // Validate initial state is in states array
    if (
      config.initialState &&
      config.states &&
      !config.states.includes(config.initialState)
    ) {
      errors.push(
        `Initial state '${String(config.initialState)}' must be included in states array`
      );
    }

    // Validate transitions array
    if (!config.transitions) {
      errors.push('Transitions array is required');
    }

    return errors.length > 0
      ? ValidationResultImpl.failure(errors)
      : ValidationResultImpl.success();
  }
}
