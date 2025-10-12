/**
 * Event-related type definitions for observer pattern
 */

import {
  ContextConstraint,
  EventIdentifier,
  StateIdentifier,
} from './BaseTypes';

// Event types for observer pattern
export interface StateChangeEvent<
  TState extends StateIdentifier,
  TEvent extends EventIdentifier,
  TContext extends ContextConstraint,
> {
  readonly fromState: TState;
  readonly toState: TState;
  readonly event: TEvent;
  readonly context: TContext;
  readonly timestamp: Date;
  readonly transitionId: string;
}

export interface TransitionAttemptEvent<
  TState extends StateIdentifier,
  TEvent extends EventIdentifier,
  TContext extends ContextConstraint,
> {
  readonly currentState: TState;
  readonly event: TEvent;
  readonly context: TContext;
  readonly timestamp: Date;
  readonly success: boolean;
  readonly error?: Error;
}

// Observer interface
export interface StateChangeObserver<
  TState extends StateIdentifier,
  TEvent extends EventIdentifier,
  TContext extends ContextConstraint,
> {
  onStateChange(event: StateChangeEvent<TState, TEvent, TContext>): void;
  onTransitionAttempt?(
    event: TransitionAttemptEvent<TState, TEvent, TContext>
  ): void;
}
