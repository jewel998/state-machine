/**
 * Stateless StateMachineDefinition - shared behavior, no instance state
 */

import {
  ActionExecutionError,
  GuardConditionError,
  InvalidTransitionError,
} from '@/errors';
import {
  ActionFunction,
  AsyncTransitionResult,
  ContextConstraint,
  EventIdentifier,
  IStateMachineDefinition,
  StateAction,
  StateIdentifier,
  StateMachineConfig,
  Transition,
  TransitionResult,
} from '@/interfaces';
import { logger } from '@/logger';
import { MiddlewareManager } from '@/middleware/MiddlewareManager';
import { IMiddlewareManager, MiddlewareConfig } from '@/middleware/types';
import { IdGenerator } from '@/utils/IdGenerator';
import { PerformanceMonitor } from '@/utils/PerformanceMonitor';

export class StateMachineDefinition<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
  TEvent extends EventIdentifier,
> implements IStateMachineDefinition<TContext, TState, TEvent>
{
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
  private readonly middlewareManager: IMiddlewareManager<TContext, TState>;

  constructor(
    config: StateMachineConfig<TContext, TState, TEvent>,
    middlewareManager?: IMiddlewareManager<TContext, TState>
  ) {
    this.config = { ...config };
    this.transitions = this.buildTransitionsMap(config.transitions);
    this.entryActions = this.buildActionsMap(config.entryActions);
    this.exitActions = this.buildActionsMap(config.exitActions);
    this.middlewareManager =
      middlewareManager || new MiddlewareManager<TContext, TState>();
  }

  public canTransition(
    currentState: TState,
    event: TEvent,
    context: TContext
  ): boolean {
    const transition = this.getTransition(currentState, event);
    if (!transition) {
      return false;
    }

    if (!transition.guard) {
      return true;
    }

    try {
      const result = transition.guard(context);
      // Handle both sync and async guards
      if (result instanceof Promise) {
        return false; // Async guards not supported in sync method
      }
      return result;
    } catch {
      return false;
    }
  }

  public async canTransitionAsync(
    currentState: TState,
    event: TEvent,
    context: TContext
  ): Promise<boolean> {
    const transition = this.getTransition(currentState, event);
    if (!transition) {
      return false;
    }

    if (!transition.guard) {
      return true;
    }

    try {
      const result = await transition.guard(context);
      return result;
    } catch {
      return false;
    }
  }

  public processEvent(
    currentState: TState,
    event: TEvent,
    context: TContext
  ): TransitionResult<TState, TContext> {
    const { result } = PerformanceMonitor.measureSync(() => {
      return this.executeTransitionSync(currentState, event, context);
    });

    return result;
  }

  public async processEventAsync(
    currentState: TState,
    event: TEvent,
    context: TContext
  ): Promise<AsyncTransitionResult<TState, TContext>> {
    const transactionId = IdGenerator.generateTransitionId();

    const { result } = await PerformanceMonitor.measureAsync(async () => {
      return await this.executeTransitionAsync(
        currentState,
        event,
        context,
        transactionId
      );
    });

    return { ...result, transactionId };
  }

  public getAvailableEvents(
    currentState: TState,
    context?: TContext
  ): readonly TEvent[] {
    const events: TEvent[] = [];

    this.transitions.forEach((transition) => {
      if (transition.from === currentState) {
        // If context provided, check guard conditions
        if (context && transition.guard) {
          try {
            const guardResult = transition.guard(context);
            // Only include sync-evaluable guards for this method
            if (guardResult instanceof Promise) {
              // Skip async guards in sync method
              return;
            }
            if (guardResult) {
              events.push(transition.event);
            }
          } catch {
            // Guard failed, skip this event
          }
        } else {
          events.push(transition.event);
        }
      }
    });

    return events;
  }

  public getInitialState(): TState {
    return this.config.initialState;
  }

  public getAllStates(): readonly TState[] {
    return [...this.config.states];
  }

  public getConfiguration(): StateMachineConfig<TContext, TState, TEvent> {
    return { ...this.config };
  }

  public addMiddleware(middleware: MiddlewareConfig<TContext, TState>): void {
    this.middlewareManager.addMiddleware(middleware);
  }

  public removeMiddleware(name: string): void {
    this.middlewareManager.removeMiddleware(name);
  }

  public hasMiddleware(name: string): boolean {
    return this.middlewareManager.hasMiddleware(name);
  }

  public getMiddleware(
    name: string
  ): MiddlewareConfig<TContext, TState> | undefined {
    return this.middlewareManager.getMiddleware(name);
  }

  public getPipelineOrder(): string[] {
    return this.middlewareManager.getPipelineOrder();
  }

  public clearPipeline(): void {
    this.middlewareManager.clearPipeline();
  }

  // Legacy methods for backward compatibility
  public getChainOrder(): string[] {
    return this.middlewareManager.getChainOrder();
  }

  public clearChain(): void {
    this.middlewareManager.clearChain();
  }

  private executeTransitionSync(
    currentState: TState,
    event: TEvent,
    context: TContext
  ): TransitionResult<TState, TContext> {
    const transition = this.getTransition(currentState, event);

    if (!transition) {
      return {
        success: false,
        newState: currentState,
        error: new InvalidTransitionError(
          String(currentState),
          String(event),
          this.getAvailableEvents(currentState, context).map(String)
        ),
      };
    }

    try {
      // Check guard (sync only - middleware not supported in sync mode)
      if (transition.guard) {
        try {
          const guardResult = transition.guard(context);
          if (guardResult instanceof Promise) {
            throw new Error(
              'Async guards not supported in sync processing. Use processEventAsync instead.'
            );
          }
          if (!guardResult) {
            throw new GuardConditionError(
              String(currentState),
              String(transition.to),
              String(event)
            );
          }
        } catch (error) {
          if (error instanceof GuardConditionError) {
            throw error;
          }
          // Wrap other errors in GuardConditionError for backward compatibility
          throw new GuardConditionError(
            String(currentState),
            String(transition.to),
            String(event)
          );
        }
      }

      // Execute exit actions (sync only)
      this.executeExitActionsSync(currentState, context);

      // Execute transition action (sync only)
      if (transition.action) {
        try {
          const actionResult = transition.action(context);
          if (actionResult instanceof Promise) {
            throw new Error(
              'Async actions not supported in sync processing. Use processEventAsync instead.'
            );
          }
        } catch (error) {
          throw new ActionExecutionError(
            'transition',
            String(currentState),
            error as Error
          );
        }
      }

      // Execute entry actions (sync only)
      this.executeEntryActionsSync(transition.to, context);

      return {
        success: true,
        newState: transition.to,
      };
    } catch (error) {
      return {
        success: false,
        newState: currentState,
        error: error as Error,
      };
    }
  }

  private async executeTransitionAsync(
    currentState: TState,
    event: TEvent,
    context: TContext,
    transactionId: string
  ): Promise<AsyncTransitionResult<TState, TContext>> {
    const transition = this.getTransition(currentState, event);

    if (!transition) {
      return {
        success: false,
        newState: currentState,
        error: new InvalidTransitionError(
          String(currentState),
          String(event),
          this.getAvailableEvents(currentState, context).map(String)
        ),
      };
    }

    let rollbackExecuted = false;

    try {
      // Check guard with middleware pipeline (async supported)
      const guardResult = await this.middlewareManager.executeGuardPipeline(
        context,
        transition.guard
      );
      if (!guardResult) {
        throw new GuardConditionError(
          String(currentState),
          String(transition.to),
          String(event)
        );
      }

      // Execute exit actions with middleware pipeline
      const exitResult = await this.middlewareManager.executeExitPipeline(
        context,
        currentState,
        this.getStateExitAction(currentState)
      );
      let currentContext = exitResult.context;

      // Execute transaction or action with middleware pipeline
      if (transition.transaction) {
        await transition.transaction(currentContext);
      } else if (transition.action) {
        const actionResult = await this.middlewareManager.executeActionPipeline(
          currentContext,
          transition.action
        );
        currentContext = actionResult.context;
      }

      // Execute entry actions with middleware pipeline
      const entryResult = await this.middlewareManager.executeEntryPipeline(
        currentContext,
        transition.to,
        this.getStateEntryAction(transition.to)
      );
      currentContext = entryResult.context;

      logger.info('Async transition completed', {
        from: String(currentState),
        to: String(transition.to),
        event: String(event),
        transactionId,
      });

      return {
        success: true,
        newState: transition.to,
        context: currentContext,
      };
    } catch (error) {
      logger.error('Async transition failed', {
        error,
        transactionId,
        from: String(currentState),
        to: String(transition.to),
      });

      // Execute rollback if available
      if (transition.rollback) {
        try {
          await transition.rollback(context, error as Error);
          rollbackExecuted = true;
          logger.info('Rollback executed successfully', { transactionId });
        } catch (rollbackError) {
          logger.error('Rollback failed', {
            rollbackError,
            originalError: error,
            transactionId,
          });
        }
      }

      return {
        success: false,
        newState: currentState,
        error: error as Error,
        rollbackExecuted,
      };
    }
  }

  private executeEntryActionsSync(state: TState, context: TContext): void {
    const actions = this.entryActions.get(state) || [];
    actions.forEach((stateAction) => {
      try {
        const result = stateAction.action(context);
        if (result instanceof Promise) {
          throw new Error(
            'Async entry actions not supported in sync processing'
          );
        }
      } catch (error) {
        throw new ActionExecutionError('entry', String(state), error as Error);
      }
    });
  }

  private executeExitActionsSync(state: TState, context: TContext): void {
    const actions = this.exitActions.get(state) || [];
    actions.forEach((stateAction) => {
      try {
        const result = stateAction.action(context);
        if (result instanceof Promise) {
          throw new Error(
            'Async exit actions not supported in sync processing'
          );
        }
      } catch (error) {
        throw new ActionExecutionError('exit', String(state), error as Error);
      }
    });
  }

  private getTransition(
    from: TState,
    event: TEvent
  ): Transition<TContext, TState, TEvent> | undefined {
    const key = `${String(from)}-${String(event)}`;
    return this.transitions.get(key);
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

  private getStateEntryAction(
    state: TState
  ): ActionFunction<TContext> | undefined {
    const actions = this.entryActions.get(state);
    if (!actions || actions.length === 0) {
      return undefined;
    }

    // Combine multiple actions into one
    return async (context: TContext) => {
      for (const stateAction of actions) {
        await stateAction.action(context);
      }
    };
  }

  private getStateExitAction(
    state: TState
  ): ActionFunction<TContext> | undefined {
    const actions = this.exitActions.get(state);
    if (!actions || actions.length === 0) {
      return undefined;
    }

    // Combine multiple actions into one
    return async (context: TContext) => {
      for (const stateAction of actions) {
        await stateAction.action(context);
      }
    };
  }
}
