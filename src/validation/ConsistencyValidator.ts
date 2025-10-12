/**
 * Transition consistency validation strategy
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

export class TransitionConsistencyValidator<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
  TEvent extends EventIdentifier,
> implements IValidationStrategy<StateMachineConfig<TContext, TState, TEvent>>
{
  public validate(
    config: StateMachineConfig<TContext, TState, TEvent>
  ): ValidationResult {
    if (!config.states || !config.transitions) {
      return ValidationResultImpl.success();
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const transitionKeys = new Set<string>();

    config.transitions.forEach((transition, index) => {
      // Validate from state exists
      if (!config.states.includes(transition.from)) {
        errors.push(
          `Transition ${index}: 'from' state '${String(transition.from)}' is not defined in states`
        );
      }

      // Validate to state exists
      if (!config.states.includes(transition.to)) {
        errors.push(
          `Transition ${index}: 'to' state '${String(transition.to)}' is not defined in states`
        );
      }

      // Check for duplicate transitions
      const key = `${String(transition.from)}-${String(transition.event)}`;
      if (transitionKeys.has(key)) {
        errors.push(
          `Duplicate transition found: ${String(transition.from)} -> ${String(transition.to)} on event '${String(transition.event)}'`
        );
      } else {
        transitionKeys.add(key);
      }

      // Check for self-transitions
      if (transition.from === transition.to) {
        warnings.push(
          `Self-transition detected: state '${String(transition.from)}' on event '${String(transition.event)}'`
        );
      }
    });

    // Validate state actions reference valid states
    this.validateStateActions(config, errors);

    return errors.length > 0
      ? ValidationResultImpl.failure(errors, warnings)
      : ValidationResultImpl.success(warnings);
  }

  private validateStateActions(
    config: StateMachineConfig<TContext, TState, TEvent>,
    errors: string[]
  ): void {
    config.entryActions?.forEach((action, index) => {
      if (!config.states.includes(action.state)) {
        errors.push(
          `Entry action ${index}: state '${String(action.state)}' is not defined in states`
        );
      }
    });

    config.exitActions?.forEach((action, index) => {
      if (!config.states.includes(action.state)) {
        errors.push(
          `Exit action ${index}: state '${String(action.state)}' is not defined in states`
        );
      }
    });
  }
}
