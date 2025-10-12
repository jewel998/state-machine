/**
 * Core state machine functionality
 */

import {
  ContextConstraint,
  EventIdentifier,
  StateAction,
  StateIdentifier,
  StateMachineConfig,
  Transition,
} from '@/interfaces';
import { logger } from '@/logger';

export class StateMachineCore<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
  TEvent extends EventIdentifier,
> {
  private currentState: TState;
  private readonly config: StateMachineConfig<TContext, TState, TEvent>;
  private readonly transitions: ReadonlyMap<
    string,
    Transition<TContext, TState, TEvent>
  >;
  private readonly entryActions: ReadonlyMap<
    TState,
    readonly StateAction<TContext, TState>[]
  >;
  private readonly exitActions: ReadonlyMap<
    TState,
    readonly StateAction<TContext, TState>[]
  >;

  constructor(config: StateMachineConfig<TContext, TState, TEvent>) {
    this.config = config;
    this.currentState = config.initialState;
    this.transitions = this.buildTransitionsMap(config.transitions);
    this.entryActions = this.buildActionsMap(config.entryActions);
    this.exitActions = this.buildActionsMap(config.exitActions);
  }

  public getCurrentState(): TState {
    return this.currentState;
  }

  public getConfiguration(): StateMachineConfig<TContext, TState, TEvent> {
    return { ...this.config };
  }

  public getTransition(
    from: TState,
    event: TEvent
  ): Transition<TContext, TState, TEvent> | undefined {
    const key = `${String(from)}-${String(event)}`;
    return this.transitions.get(key);
  }

  public getAvailableEvents(): readonly TEvent[] {
    const events: TEvent[] = [];
    this.transitions.forEach((transition) => {
      if (transition.from === this.currentState) {
        events.push(transition.event);
      }
    });
    return events;
  }

  public canTransition(event: TEvent, context: TContext): boolean {
    const transition = this.getTransition(this.currentState, event);
    if (!transition) {
      return false;
    }

    if (!transition.guard) {
      return true;
    }

    try {
      return transition.guard(context);
    } catch {
      return false;
    }
  }

  public setState(newState: TState): void {
    logger.debug('State changed', {
      from: String(this.currentState),
      to: String(newState),
    });
    this.currentState = newState;
  }

  public getEntryActions(
    state: TState
  ): readonly StateAction<TContext, TState>[] {
    return this.entryActions.get(state) || [];
  }

  public getExitActions(
    state: TState
  ): readonly StateAction<TContext, TState>[] {
    return this.exitActions.get(state) || [];
  }

  private buildTransitionsMap(
    transitions: readonly Transition<TContext, TState, TEvent>[]
  ): ReadonlyMap<string, Transition<TContext, TState, TEvent>> {
    const map = new Map<string, Transition<TContext, TState, TEvent>>();

    transitions.forEach((transition) => {
      const key = `${String(transition.from)}-${String(transition.event)}`;
      map.set(key, transition);
    });

    return map;
  }

  private buildActionsMap(
    actions: readonly StateAction<TContext, TState>[] = []
  ): ReadonlyMap<TState, readonly StateAction<TContext, TState>[]> {
    const map = new Map<TState, StateAction<TContext, TState>[]>();

    actions.forEach((action) => {
      const existing = map.get(action.state) || [];
      map.set(action.state, [...existing, action]);
    });

    return map;
  }
}
