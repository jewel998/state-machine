/**
 * Main state machine interface definitions
 */

import {
  ContextConstraint,
  EventIdentifier,
  StateIdentifier,
} from './BaseTypes';
import { StateMachineConfig, StateMachineOptions } from './ConfigurationTypes';
import { StateChangeEvent, StateChangeObserver } from './EventTypes';
import { StateMachineStatistics } from './StatisticsTypes';

// Builder pattern interfaces
export interface IStateMachineBuilder<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
  TEvent extends EventIdentifier,
> {
  initialState(state: TState): this;
  state(state: TState): this;
  transition(from: TState, to: TState, event: TEvent): this;
  guard(condition: (context: TContext) => boolean): this;
  action(callback: (context: TContext) => void): this;
  onStateEntry(state: TState, callback: (context: TContext) => void): this;
  onStateExit(state: TState, callback: (context: TContext) => void): this;
  withOptions(options: StateMachineOptions): this;
  build(): IStateMachine<TContext, TState, TEvent>;
}

// Main state machine interface
export interface IStateMachine<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
  TEvent extends EventIdentifier,
> {
  // Core functionality
  start(): void;
  sendEvent(event: TEvent, context: TContext): boolean;
  sendEventStrict(event: TEvent, context: TContext): void;
  getCurrentState(): TState;
  canTransition(event: TEvent, context: TContext): boolean;
  getAvailableEvents(): readonly TEvent[];
  reset(): void;

  // Observer pattern
  subscribe(observer: StateChangeObserver<TState, TEvent, TContext>): void;
  unsubscribe(observer: StateChangeObserver<TState, TEvent, TContext>): void;

  // History and debugging
  getHistory(): readonly StateChangeEvent<TState, TEvent, TContext>[];
  clearHistory(): void;

  // Metadata
  getConfiguration(): StateMachineConfig<TContext, TState, TEvent>;
  getStatistics(): StateMachineStatistics;
}
