/**
 * Manages observers for state machine events
 */

import {
  ContextConstraint,
  EventIdentifier,
  StateChangeEvent,
  StateChangeObserver,
  StateIdentifier,
  TransitionAttemptEvent,
} from '@/interfaces';
import { Observable } from '@/patterns/Observer';

export class ObserverManager<
  TState extends StateIdentifier,
  TEvent extends EventIdentifier,
  TContext extends ContextConstraint,
> {
  private readonly stateChangeObservable: Observable<
    StateChangeEvent<TState, TEvent, TContext>
  >;
  private readonly transitionAttemptObservable: Observable<
    TransitionAttemptEvent<TState, TEvent, TContext>
  >;
  private readonly enabled: boolean;

  constructor(enabled = true) {
    this.enabled = enabled;
    this.stateChangeObservable = new Observable<
      StateChangeEvent<TState, TEvent, TContext>
    >();
    this.transitionAttemptObservable = new Observable<
      TransitionAttemptEvent<TState, TEvent, TContext>
    >();
  }

  public subscribe(
    observer: StateChangeObserver<TState, TEvent, TContext>
  ): void {
    if (!this.enabled) return;

    this.stateChangeObservable.subscribe({
      update: (event: StateChangeEvent<TState, TEvent, TContext>) =>
        observer.onStateChange(event),
    });

    if (observer.onTransitionAttempt) {
      this.transitionAttemptObservable.subscribe({
        update: (event: TransitionAttemptEvent<TState, TEvent, TContext>) =>
          observer.onTransitionAttempt!(event),
      });
    }
  }

  public unsubscribe(
    observer: StateChangeObserver<TState, TEvent, TContext>
  ): void {
    if (!this.enabled) return;

    this.stateChangeObservable.unsubscribe({
      update: (event: StateChangeEvent<TState, TEvent, TContext>) =>
        observer.onStateChange(event),
    });

    if (observer.onTransitionAttempt) {
      this.transitionAttemptObservable.unsubscribe({
        update: (event: TransitionAttemptEvent<TState, TEvent, TContext>) =>
          observer.onTransitionAttempt!(event),
      });
    }
  }

  public notifyStateChange(
    event: StateChangeEvent<TState, TEvent, TContext>
  ): void {
    if (this.enabled) {
      this.stateChangeObservable.notify(event);
    }
  }

  public notifyTransitionAttempt(
    event: TransitionAttemptEvent<TState, TEvent, TContext>
  ): void {
    if (this.enabled) {
      this.transitionAttemptObservable.notify(event);
    }
  }

  public getObserverCount(): number {
    return (
      this.stateChangeObservable.getObserverCount() +
      this.transitionAttemptObservable.getObserverCount()
    );
  }

  public clear(): void {
    this.stateChangeObservable.clear();
    this.transitionAttemptObservable.clear();
  }
}
