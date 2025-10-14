/**
 * Stateless state machine definition interfaces
 */

import { IMiddleware, MiddlewareConfig } from '../middleware/types';
import {
  ContextConstraint,
  EventIdentifier,
  StateIdentifier,
} from './BaseTypes';
import { StateMachineConfig } from './ConfigurationTypes';

// Result types for stateless operations
export interface TransitionResult<
  TState extends StateIdentifier,
  TContext extends ContextConstraint = ContextConstraint,
> {
  success: boolean;
  newState: TState;
  context?: TContext;
  error?: Error;
  rollbackExecuted?: boolean;
}

export interface AsyncTransitionResult<
  TState extends StateIdentifier,
  TContext extends ContextConstraint = ContextConstraint,
> {
  success: boolean;
  newState: TState;
  context?: TContext;
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
  ): TransitionResult<TState, TContext>;

  processEventAsync(
    currentState: TState,
    event: TEvent,
    context: TContext
  ): Promise<AsyncTransitionResult<TState, TContext>>;

  // State queries
  getAvailableEvents(
    currentState: TState,
    context?: TContext
  ): readonly TEvent[];

  getInitialState(): TState;
  getAllStates(): readonly TState[];

  // Configuration access
  getConfiguration(): StateMachineConfig<TContext, TState, TEvent>;

  // Middleware management
  addMiddleware(
    middleware:
      | MiddlewareConfig<TContext, TState>
      | IMiddleware<TContext, TState>
  ): void;
  removeMiddleware(name: string): void;
  hasMiddleware(name: string): boolean;
  getMiddleware(
    name: string
  ):
    | MiddlewareConfig<TContext, TState>
    | IMiddleware<TContext, TState>
    | undefined;
  getPipelineOrder?(): string[];
  clearPipeline?(): void;
  // Legacy methods for backward compatibility
  getChainOrder?(): string[];
  clearChain?(): void;
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
