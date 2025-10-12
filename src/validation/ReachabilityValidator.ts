/**
 * State reachability validation strategy
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

export class StateReachabilityValidator<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
  TEvent extends EventIdentifier,
> implements IValidationStrategy<StateMachineConfig<TContext, TState, TEvent>>
{
  public validate(
    config: StateMachineConfig<TContext, TState, TEvent>
  ): ValidationResult {
    if (!config.states || !config.initialState || !config.transitions) {
      return ValidationResultImpl.success();
    }

    const reachableStates = this.findReachableStates(config);
    const unreachableStates = config.states.filter(
      (state) => !reachableStates.has(state)
    );

    const warnings = unreachableStates.map(
      (state) => `State '${String(state)}' is unreachable from initial state`
    );

    return ValidationResultImpl.success(warnings);
  }

  private findReachableStates(
    config: StateMachineConfig<TContext, TState, TEvent>
  ): Set<TState> {
    const reachable = new Set<TState>([config.initialState]);
    const queue = [config.initialState];

    while (queue.length > 0) {
      const currentState = queue.shift()!;

      config.transitions
        .filter((transition) => transition.from === currentState)
        .forEach((transition) => {
          if (!reachable.has(transition.to)) {
            reachable.add(transition.to);
            queue.push(transition.to);
          }
        });
    }

    return reachable;
  }
}
