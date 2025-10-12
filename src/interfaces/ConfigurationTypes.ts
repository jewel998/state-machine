/**
 * Configuration-related type definitions
 */

import {
  ActionFunction,
  ContextConstraint,
  EventIdentifier,
  GuardFunction,
  NonEmptyArray,
  ReadonlyRecord,
  RollbackFunction,
  StateIdentifier,
  TransactionFunction,
} from './BaseTypes';

// Configuration interfaces with strict typing
export interface StateMachineConfig<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
  TEvent extends EventIdentifier,
> {
  readonly initialState: TState;
  readonly states: NonEmptyArray<TState>;
  readonly transitions: readonly Transition<TContext, TState, TEvent>[];
  readonly entryActions?: readonly StateAction<TContext, TState>[];
  readonly exitActions?: readonly StateAction<TContext, TState>[];
  readonly metadata?: ReadonlyRecord<string, string | number | boolean>;
}

export interface Transition<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
  TEvent extends EventIdentifier,
> {
  readonly from: TState;
  readonly to: TState;
  readonly event: TEvent;
  readonly guard?: GuardFunction<TContext>;
  readonly action?: ActionFunction<TContext>;
  readonly transaction?: TransactionFunction<TContext>;
  readonly rollback?: RollbackFunction<TContext>;
  readonly metadata?: ReadonlyRecord<string, string | number | boolean>;
}

export interface StateAction<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
> {
  readonly state: TState;
  readonly action: ActionFunction<TContext>;
  readonly metadata?: ReadonlyRecord<string, string | number | boolean>;
}

// State machine options for configuration
export interface StateMachineOptions {
  readonly enableLogging?: boolean;
  readonly enableObservers?: boolean;
  readonly enableHistory?: boolean;
  readonly maxHistorySize?: number;
  readonly strictMode?: boolean;
}
