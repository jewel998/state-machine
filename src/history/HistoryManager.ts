/**
 * Manages state machine history and events
 */

import {
  ContextConstraint,
  EventIdentifier,
  StateChangeEvent,
  StateIdentifier,
} from '@/interfaces';

export class HistoryManager<
  TState extends StateIdentifier,
  TEvent extends EventIdentifier,
  TContext extends ContextConstraint,
> {
  private readonly history: StateChangeEvent<TState, TEvent, TContext>[] = [];
  private readonly maxHistorySize: number;

  constructor(maxHistorySize = 1000) {
    this.maxHistorySize = maxHistorySize;
  }

  public addEvent(event: StateChangeEvent<TState, TEvent, TContext>): void {
    this.history.push(event);

    // Maintain history size limit
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  public getHistory(): readonly StateChangeEvent<TState, TEvent, TContext>[] {
    return [...this.history];
  }

  public getRecentHistory(
    count: number
  ): readonly StateChangeEvent<TState, TEvent, TContext>[] {
    return this.history.slice(-count);
  }

  public clear(): void {
    this.history.length = 0;
  }

  public getHistorySize(): number {
    return this.history.length;
  }

  public findEventsByState(
    state: TState
  ): readonly StateChangeEvent<TState, TEvent, TContext>[] {
    return this.history.filter(
      (event) => event.fromState === state || event.toState === state
    );
  }

  public findEventsByEvent(
    eventType: TEvent
  ): readonly StateChangeEvent<TState, TEvent, TContext>[] {
    return this.history.filter((event) => event.event === eventType);
  }

  public getLastEvent():
    | StateChangeEvent<TState, TEvent, TContext>
    | undefined {
    return this.history[this.history.length - 1];
  }
}
