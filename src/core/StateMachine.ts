/**
 * Main StateMachine class - orchestrates all components
 */

import {
  InvalidTransitionError,
  StateMachineConfigurationError,
} from '@/errors';
import { HistoryManager } from '@/history/HistoryManager';
import {
  ContextConstraint,
  EventIdentifier,
  IStateMachine,
  StateChangeEvent,
  StateChangeObserver,
  StateIdentifier,
  StateMachineConfig,
  StateMachineOptions,
  StateMachineStatistics,
  TransitionAttemptEvent,
} from '@/interfaces';
import { logger } from '@/logger';
import { ObserverManager } from '@/observers/ObserverManager';
import { StatisticsCollector } from '@/statistics/StatisticsCollector';
import { IdGenerator } from '@/utils/IdGenerator';
import { PerformanceMonitor } from '@/utils/PerformanceMonitor';
import { ConfigurationValidator } from '@/validation/ConfigurationValidator';
import { StateMachineCore } from './StateMachineCore';
import { TransitionExecutor } from './TransitionExecutor';

export class StateMachine<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
  TEvent extends EventIdentifier,
> implements IStateMachine<TContext, TState, TEvent>
{
  private readonly core: StateMachineCore<TContext, TState, TEvent>;
  private readonly executor: TransitionExecutor<TContext, TState, TEvent>;
  private readonly statistics: StatisticsCollector<TState, TEvent>;
  private readonly history: HistoryManager<TState, TEvent, TContext>;
  private readonly observers: ObserverManager<TState, TEvent, TContext>;
  private readonly options: Required<StateMachineOptions>;

  constructor(
    config: StateMachineConfig<TContext, TState, TEvent>,
    options: StateMachineOptions = {}
  ) {
    this.options = {
      enableLogging: options.enableLogging ?? true,
      enableObservers: options.enableObservers ?? true,
      enableHistory: options.enableHistory ?? true,
      maxHistorySize: options.maxHistorySize ?? 1000,
      strictMode: options.strictMode ?? false,
    };

    // Validate configuration
    this.validateConfiguration(config);

    // Initialize components
    this.core = new StateMachineCore(config);
    this.executor = new TransitionExecutor(this.core);
    this.statistics = new StatisticsCollector();
    this.history = new HistoryManager(this.options.maxHistorySize);
    this.observers = new ObserverManager(this.options.enableObservers);

    logger.info('StateMachine initialized', {
      initialState: String(config.initialState),
      stateCount: config.states.length,
      transitionCount: config.transitions.length,
    });
  }

  public start(): void {
    logger.debug('Starting state machine', {
      initialState: String(this.core.getCurrentState()),
    });

    // Execute entry actions for initial state if context is available
    // Note: This is a simplified start - in practice, you might want to pass initial context
  }

  public sendEvent(event: TEvent, context: TContext): boolean {
    const { result, metrics } = PerformanceMonitor.measureSync(() => {
      return this.executeTransition(event, context, false);
    });

    if (result.success) {
      this.statistics.recordSuccessfulTransition(
        event,
        this.core.getCurrentState(),
        metrics.executionTime
      );
    } else {
      this.statistics.recordFailedTransition();
    }

    return result.success;
  }

  public sendEventStrict(event: TEvent, context: TContext): void {
    const transition = this.core.getTransition(
      this.core.getCurrentState(),
      event
    );

    if (!transition) {
      const availableEvents = this.core.getAvailableEvents();
      throw new InvalidTransitionError(
        String(this.core.getCurrentState()),
        String(event),
        availableEvents.map(String)
      );
    }

    const { result } = PerformanceMonitor.measureSync(() => {
      return this.executeTransition(event, context, true);
    });

    if (!result.success) {
      if (result.error) {
        throw result.error;
      }
      throw new Error('Transition failed despite valid transition existing');
    }
  }

  public getCurrentState(): TState {
    return this.core.getCurrentState();
  }

  public canTransition(event: TEvent, context: TContext): boolean {
    return this.core.canTransition(event, context);
  }

  public getAvailableEvents(): readonly TEvent[] {
    return this.core.getAvailableEvents();
  }

  public reset(): void {
    logger.debug('Resetting state machine');

    const config = this.core.getConfiguration();
    this.core.setState(config.initialState);

    if (this.options.enableHistory) {
      this.history.clear();
    }

    logger.info('State machine reset', {
      currentState: String(this.core.getCurrentState()),
    });
  }

  // Observer methods
  public subscribe(
    observer: StateChangeObserver<TState, TEvent, TContext>
  ): void {
    this.observers.subscribe(observer);
  }

  public unsubscribe(
    observer: StateChangeObserver<TState, TEvent, TContext>
  ): void {
    this.observers.unsubscribe(observer);
  }

  // History methods
  public getHistory(): readonly StateChangeEvent<TState, TEvent, TContext>[] {
    return this.history.getHistory();
  }

  public clearHistory(): void {
    this.history.clear();
  }

  // Configuration and statistics
  public getConfiguration(): StateMachineConfig<TContext, TState, TEvent> {
    return this.core.getConfiguration();
  }

  public getStatistics(): StateMachineStatistics {
    return this.statistics.getStatistics();
  }

  private executeTransition(
    event: TEvent,
    context: TContext,
    strict: boolean
  ): { success: boolean; error?: Error } {
    const transitionId = IdGenerator.generateTransitionId();
    const currentState = this.core.getCurrentState();

    logger.debug('Attempting transition', {
      currentState: String(currentState),
      event: String(event),
      transitionId,
    });

    const transition = this.core.getTransition(currentState, event);

    // Notify observers of transition attempt
    const attemptEvent: TransitionAttemptEvent<TState, TEvent, TContext> = {
      currentState,
      event,
      context,
      timestamp: new Date(),
      success: false,
    };
    this.observers.notifyTransitionAttempt(attemptEvent);

    if (!transition) {
      logger.debug('No transition found', {
        key: `${String(currentState)}-${String(event)}`,
      });
      return { success: false };
    }

    try {
      this.executor.executeTransition(transition, context, transitionId);

      // Create and store history event
      if (this.options.enableHistory) {
        const stateChangeEvent: StateChangeEvent<TState, TEvent, TContext> = {
          fromState: currentState,
          toState: transition.to,
          event,
          context,
          timestamp: new Date(),
          transitionId,
        };

        this.history.addEvent(stateChangeEvent);
        this.observers.notifyStateChange(stateChangeEvent);
      }

      logger.info('Transition successful', {
        from: String(currentState),
        to: String(transition.to),
        event: String(event),
        transitionId,
      });

      return { success: true };
    } catch (error) {
      logger.error('Transition failed', {
        error,
        transitionId,
        currentState: String(currentState),
      });

      // In strict mode, re-throw the original error
      if (strict) {
        throw error;
      }

      return { success: false, error: error as Error };
    }
  }

  private validateConfiguration(
    config: StateMachineConfig<TContext, TState, TEvent>
  ): void {
    const validator = new ConfigurationValidator<TContext, TState, TEvent>();
    const validationResult = validator.validate(config);

    if (!validationResult.isValid) {
      const errorMessage = `Configuration validation failed: ${validationResult.errors.join(', ')}`;
      logger.error(errorMessage);
      throw new StateMachineConfigurationError(errorMessage);
    }

    if (validationResult.warnings.length > 0) {
      validationResult.warnings.forEach((warning: string) =>
        logger.warn(warning)
      );
    }
  }

  public static builder<
    TContext extends ContextConstraint,
    TState extends StateIdentifier,
    TEvent extends EventIdentifier,
  >(): import('./StateMachineBuilder').StateMachineBuilder<
    TContext,
    TState,
    TEvent
  > {
    // Dynamic import to avoid circular dependency
    const { StateMachineBuilder } = require('./StateMachineBuilder');
    return new StateMachineBuilder();
  }
}
