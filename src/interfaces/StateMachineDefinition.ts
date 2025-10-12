/**
 * Stateless state machine definition interfaces
 */

import {
  ContextConstraint,
  EventIdentifier,
  StateIdentifier,
} from './BaseTypes';
import { StateMachineConfig } from './ConfigurationTypes';

// Result types for stateless operations
export interface TransitionResult<TState extends StateIdentifier> {
  success: boolean;
  newState: TState;
  error?: Error;
  rollbackExecuted?: boolean;
}

export interface AsyncTransitionResult<TState extends StateIdentifier> {
  success: boolean;
  newState: TState;
  error?: Error;
  rollbackExecuted?: boolean;
  transactionId?: string;
}

// Stateless definition interface
export interface IStateMachineDefinition<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
  TEvent extends EventIdentifier,
> {
  // Core stateless operations
  canTransition(
    currentState: TState,
    event: TEvent,
    context: TContext
  ): boolean;

  canTransitionAsync(
    currentState: TState,
    event: TEvent,
    context: TContext
  ): Promise<boolean>;

  processEvent(
    currentState: TState,
    event: TEvent,
    context: TContext
  ): TransitionResult<TState>;

  processEventAsync(
    currentState: TState,
    event: TEvent,
    context: TContext
  ): Promise<AsyncTransitionResult<TState>>;

  // State queries
  getAvailableEvents(
    currentState: TState,
    context?: TContext
  ): readonly TEvent[];

  getInitialState(): TState;
  getAllStates(): readonly TState[];

  // Configuration access
  getConfiguration(): StateMachineConfig<TContext, TState, TEvent>;
}

// Builder for stateless definitions
export interface IStateMachineDefinitionBuilder<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
  TEvent extends EventIdentifier,
> {
  initialState(state: TState): this;
  state(state: TState): this;
  transition(from: TState, to: TState, event: TEvent): this;
  guard(condition: (context: TContext) => boolean | Promise<boolean>): this;
  action(callback: (context: TContext) => void | Promise<void>): this;
  transaction(
    callback: (context: TContext) => Promise<void>,
    rollback?: (context: TContext, error: Error) => Promise<void>
  ): this;
  onStateEntry(
    state: TState,
    callback: (context: TContext) => void | Promise<void>
  ): this;
  onStateExit(
    state: TState,
    callback: (context: TContext) => void | Promise<void>
  ): this;
  buildDefinition(): IStateMachineDefinition<TContext, TState, TEvent>;
}
