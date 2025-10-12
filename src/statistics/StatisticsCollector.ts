/**
 * Collects and manages state machine statistics
 */

import {
  EventIdentifier,
  StateIdentifier,
  StateMachineStatistics,
} from '@/interfaces';

export class StatisticsCollector<
  TState extends StateIdentifier,
  TEvent extends EventIdentifier,
> {
  private readonly statistics: {
    totalTransitions: number;
    successfulTransitions: number;
    failedTransitions: number;
    stateVisitCounts: Map<TState, number>;
    eventCounts: Map<TEvent, number>;
    transitionTimes: number[];
    createdAt: Date;
    lastTransitionAt: Date | undefined;
  };

  constructor() {
    this.statistics = {
      totalTransitions: 0,
      successfulTransitions: 0,
      failedTransitions: 0,
      stateVisitCounts: new Map(),
      eventCounts: new Map(),
      transitionTimes: [],
      createdAt: new Date(),
      lastTransitionAt: undefined,
    };
  }

  public recordSuccessfulTransition(
    event: TEvent,
    toState: TState,
    duration: number
  ): void {
    this.statistics.totalTransitions++;
    this.statistics.successfulTransitions++;
    this.statistics.lastTransitionAt = new Date();

    this.updateEventCount(event);
    this.updateStateVisitCount(toState);
    this.recordTransitionTime(duration);
  }

  public recordFailedTransition(): void {
    this.statistics.totalTransitions++;
    this.statistics.failedTransitions++;
  }

  public getStatistics(): StateMachineStatistics {
    const averageTransitionTime =
      this.statistics.transitionTimes.length > 0
        ? this.statistics.transitionTimes.reduce((sum, time) => sum + time, 0) /
          this.statistics.transitionTimes.length
        : 0;

    return {
      totalTransitions: this.statistics.totalTransitions,
      successfulTransitions: this.statistics.successfulTransitions,
      failedTransitions: this.statistics.failedTransitions,
      stateVisitCounts: Object.fromEntries(
        Array.from(this.statistics.stateVisitCounts.entries()).map(([k, v]) => [
          String(k),
          v,
        ])
      ),
      eventCounts: Object.fromEntries(
        Array.from(this.statistics.eventCounts.entries()).map(([k, v]) => [
          String(k),
          v,
        ])
      ),
      averageTransitionTime,
      createdAt: this.statistics.createdAt,
      lastTransitionAt: this.statistics.lastTransitionAt,
    } as StateMachineStatistics;
  }

  public reset(): void {
    this.statistics.totalTransitions = 0;
    this.statistics.successfulTransitions = 0;
    this.statistics.failedTransitions = 0;
    this.statistics.stateVisitCounts.clear();
    this.statistics.eventCounts.clear();
    this.statistics.transitionTimes.length = 0;
    this.statistics.lastTransitionAt = undefined;
  }

  private updateEventCount(event: TEvent): void {
    const current = this.statistics.eventCounts.get(event) || 0;
    this.statistics.eventCounts.set(event, current + 1);
  }

  private updateStateVisitCount(state: TState): void {
    const current = this.statistics.stateVisitCounts.get(state) || 0;
    this.statistics.stateVisitCounts.set(state, current + 1);
  }

  private recordTransitionTime(duration: number): void {
    this.statistics.transitionTimes.push(duration);

    // Keep only recent transition times for average calculation
    if (this.statistics.transitionTimes.length > 100) {
      this.statistics.transitionTimes.shift();
    }
  }
}
