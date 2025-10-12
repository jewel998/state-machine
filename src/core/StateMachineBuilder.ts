/**
 * Modular StateMachineBuilder implementation
 */

import { StateMachineConfigurationError } from '@/errors';
import {
  ActionFunction,
  ContextConstraint,
  EventIdentifier,
  GuardFunction,
  IStateMachine,
  IStateMachineBuilder,
  NonEmptyArray,
  StateAction,
  StateIdentifier,
  StateMachineConfig,
  StateMachineOptions,
  Transition,
} from '@/interfaces';
import { logger } from '@/logger';
import { StateMachine } from './StateMachine';

export class StateMachineBuilder<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
  TEvent extends EventIdentifier,
> implements IStateMachineBuilder<TContext, TState, TEvent>
{
  private _initialState: TState | undefined = undefined;
  private readonly _states: Set<TState> = new Set();
  private readonly _transitions: Array<Transition<TContext, TState, TEvent>> =
    [];
  private readonly _entryActions: Array<StateAction<TContext, TState>> = [];
  private readonly _exitActions: Array<StateAction<TContext, TState>> = [];
  private _lastTransition: Transition<TContext, TState, TEvent> | undefined =
    undefined;
  private _options: StateMachineOptions = {};

  public initialState(state: TState): this {
    logger.debug('Setting initial state', { state: String(state) });
    this._initialState = state;
    this._states.add(state);
    return this;
  }

  public state(state: TState): this {
    logger.debug('Adding state', { state: String(state) });
    this._states.add(state);
    return this;
  }

  public transition(from: TState, to: TState, event: TEvent): this {
    logger.debug('Adding transition', {
      from: String(from),
      to: String(to),
      event: String(event),
    });

    this._states.add(from);
    this._states.add(to);

    const transition: Transition<TContext, TState, TEvent> = {
      from,
      to,
      event,
    };

    this._transitions.push(transition);
    this._lastTransition = transition;
    return this;
  }

  public guard(condition: GuardFunction<TContext>): this {
    if (!this._lastTransition) {
      throw new StateMachineConfigurationError(
        'Cannot add guard without a transition. Call transition() first.'
      );
    }

    logger.debug('Adding guard to last transition', {
      transition: `${String(this._lastTransition.from)} -> ${String(this._lastTransition.to)}`,
    });

    const updatedTransition: Transition<TContext, TState, TEvent> = {
      ...this._lastTransition,
      guard: condition,
    };

    const lastIndex = this._transitions.length - 1;
    this._transitions[lastIndex] = updatedTransition;
    this._lastTransition = updatedTransition;

    return this;
  }

  public action(callback: ActionFunction<TContext>): this {
    if (!this._lastTransition) {
      throw new StateMachineConfigurationError(
        'Cannot add action without a transition. Call transition() first.'
      );
    }

    logger.debug('Adding action to last transition', {
      transition: `${String(this._lastTransition.from)} -> ${String(this._lastTransition.to)}`,
    });

    const updatedTransition: Transition<TContext, TState, TEvent> = {
      ...this._lastTransition,
      action: callback,
    };

    const lastIndex = this._transitions.length - 1;
    this._transitions[lastIndex] = updatedTransition;
    this._lastTransition = updatedTransition;

    return this;
  }

  public onStateEntry(state: TState, callback: ActionFunction<TContext>): this {
    logger.debug('Adding entry action', { state: String(state) });

    this._states.add(state);
    this._entryActions.push({
      state,
      action: callback,
    });
    return this;
  }

  public onStateExit(state: TState, callback: ActionFunction<TContext>): this {
    logger.debug('Adding exit action', { state: String(state) });

    this._states.add(state);
    this._exitActions.push({
      state,
      action: callback,
    });
    return this;
  }

  public withOptions(options: StateMachineOptions): this {
    logger.debug('Setting options', { options });
    this._options = { ...this._options, ...options };
    return this;
  }

  public build(): IStateMachine<TContext, TState, TEvent> {
    logger.debug('Building state machine');

    this.validateBuilder();

    const states = Array.from(this._states) as NonEmptyArray<TState>;
    const config: StateMachineConfig<TContext, TState, TEvent> = {
      initialState: this._initialState!,
      states,
      transitions: [...this._transitions],
      ...(this._entryActions.length > 0 && {
        entryActions: [...this._entryActions],
      }),
      ...(this._exitActions.length > 0 && {
        exitActions: [...this._exitActions],
      }),
    };

    const stateMachine = new StateMachine(config, this._options);

    logger.info('State machine built successfully', {
      stateCount: states.length,
      transitionCount: this._transitions.length,
      entryActionCount: this._entryActions.length,
      exitActionCount: this._exitActions.length,
    });

    return stateMachine;
  }

  private validateBuilder(): void {
    const errors: string[] = [];

    if (!this._initialState) {
      errors.push(
        'Initial state is required. Call initialState() before build().'
      );
    }

    if (this._states.size === 0) {
      errors.push('At least one state is required.');
    }

    if (this._initialState && !this._states.has(this._initialState)) {
      errors.push('Initial state must be defined as a state.');
    }

    // Validate transitions reference valid states
    this._transitions.forEach((transition, index) => {
      if (!this._states.has(transition.from)) {
        errors.push(
          `Transition ${index}: 'from' state '${String(transition.from)}' is not defined in states`
        );
      }
      if (!this._states.has(transition.to)) {
        errors.push(
          `Transition ${index}: 'to' state '${String(transition.to)}' is not defined in states`
        );
      }
    });

    // Check for duplicate transitions
    const transitionKeys = new Set<string>();
    this._transitions.forEach((transition, index) => {
      const key = `${String(transition.from)}-${String(transition.event)}`;
      if (transitionKeys.has(key)) {
        errors.push(
          `Duplicate transition at index ${index}: ${String(transition.from)} -> ${String(transition.to)} on event '${String(transition.event)}'`
        );
      } else {
        transitionKeys.add(key);
      }
    });

    if (errors.length > 0) {
      const errorMessage = `Builder validation failed: ${errors.join('; ')}`;
      logger.error(errorMessage);
      throw new StateMachineConfigurationError(errorMessage);
    }
  }
}
