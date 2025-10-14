/**
 * Enhanced middleware manager implementing state machine middleware pipeline pattern
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  ActionFunction,
  ContextConstraint,
  GuardFunction,
  StateIdentifier,
} from '@/interfaces';
import { logger } from '@/logger';
import { IdGenerator } from '@/utils/IdGenerator';
import {
  IMiddleware,
  IMiddlewareManager,
  MiddlewareConfig,
  MiddlewareResult,
  StateMachineMiddlewareContext,
} from './types';

type AnyMiddleware<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
> = MiddlewareConfig<TContext, TState> | IMiddleware<TContext, TState>;

export class MiddlewareManager<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
> implements IMiddlewareManager<TContext, TState>
{
  private readonly middlewares: Map<string, AnyMiddleware<TContext, TState>> =
    new Map();

  public addMiddleware(middleware: AnyMiddleware<TContext, TState>): void {
    if (this.middlewares.has(middleware.name)) {
      logger.warn(`Middleware '${middleware.name}' already exists. Replacing.`);
    }

    this.middlewares.set(middleware.name, middleware);
    logger.debug(`Added middleware: ${middleware.name}`, {
      priority: this.getMiddlewarePriority(middleware),
      enabled: this.isMiddlewareEnabled(middleware),
      type: this.isNewStyleMiddleware(middleware)
        ? 'IMiddleware'
        : 'MiddlewareConfig',
    });
  }

  public removeMiddleware(name: string): void {
    if (this.middlewares.delete(name)) {
      logger.debug(`Removed middleware: ${name}`);
    } else {
      logger.warn(`Middleware '${name}' not found`);
    }
  }

  public hasMiddleware(name: string): boolean {
    return this.middlewares.has(name);
  }

  public getMiddleware(
    name: string
  ): AnyMiddleware<TContext, TState> | undefined {
    return this.middlewares.get(name);
  }

  public getPipelineOrder(): string[] {
    return this.getEnabledMiddlewares()
      .sort(
        (a, b) => this.getMiddlewarePriority(a) - this.getMiddlewarePriority(b)
      )
      .map((m) => m.name);
  }

  public clearPipeline(): void {
    this.middlewares.clear();
    logger.debug('Cleared all middleware');
  }

  // State machine middleware pipeline methods
  public async executeGuardPipeline(
    context: TContext,
    originalGuard?: GuardFunction<TContext>
  ): Promise<boolean> {
    const enabledMiddlewares = this.getEnabledMiddlewares()
      .filter((m) => this.hasGuardHandler(m))
      .sort(
        (a, b) => this.getMiddlewarePriority(a) - this.getMiddlewarePriority(b)
      );

    if (enabledMiddlewares.length === 0) {
      return originalGuard ? await originalGuard(context) : true;
    }

    const pipelineId = IdGenerator.generateTransitionId();
    let executionOrder = 0;

    const executePipeline = async (index: number): Promise<boolean> => {
      if (index >= enabledMiddlewares.length) {
        // End of pipeline - execute original guard
        return originalGuard ? await originalGuard(context) : true;
      }

      const middleware = enabledMiddlewares[index];
      if (!middleware) {
        return originalGuard ? await originalGuard(context) : true;
      }

      const pipelineContext: StateMachineMiddlewareContext<TContext> = {
        originalContext: context,
        currentContext: context,
        metadata: {},
        pipelineId,
        executionOrder: executionOrder++,
        previousResults: [],
      };

      const next = async (): Promise<boolean> => {
        return await executePipeline(index + 1);
      };

      try {
        if (this.isNewStyleMiddleware(middleware)) {
          // Call chain hooks for backward compatibility if they exist
          if (
            'onBeforeChain' in middleware &&
            typeof middleware.onBeforeChain === 'function'
          ) {
            await (middleware as any).onBeforeChain(pipelineContext);
          } else {
            await middleware.onBeforePipeline?.(pipelineContext);
          }

          const result = await middleware.onGuard!(
            pipelineContext,
            next,
            originalGuard
          );

          const middlewareResult = {
            context,
            shouldContinue: result,
          };

          // Call chain hooks for backward compatibility if they exist
          if (
            'onAfterChain' in middleware &&
            typeof middleware.onAfterChain === 'function'
          ) {
            await (middleware as any).onAfterChain(
              pipelineContext,
              middlewareResult
            );
          } else {
            await middleware.onAfterPipeline?.(
              pipelineContext,
              middlewareResult
            );
          }

          return result;
        } else {
          // Legacy middleware support - need to create proper pipeline context
          const legacyContext: StateMachineMiddlewareContext<TContext> = {
            originalContext: context,
            currentContext: context,
            metadata: {},
            pipelineId,
            executionOrder: executionOrder - 1,
            previousResults: [],
          };
          return await middleware.guardMiddleware!(
            legacyContext,
            next,
            originalGuard
          );
        }
      } catch (error) {
        if (this.isNewStyleMiddleware(middleware)) {
          await middleware.onError?.(error as Error, pipelineContext);
        }
        logger.error(`Guard middleware '${middleware.name}' failed`, {
          error,
          pipelineId,
        });
        throw error;
      }
    };

    return await executePipeline(0);
  }

  public async executeActionPipeline(
    context: TContext,
    originalAction?: ActionFunction<TContext>
  ): Promise<MiddlewareResult<TContext>> {
    const enabledMiddlewares = this.getEnabledMiddlewares()
      .filter((m) => this.hasActionHandler(m))
      .sort(
        (a, b) => this.getMiddlewarePriority(a) - this.getMiddlewarePriority(b)
      );

    if (enabledMiddlewares.length === 0) {
      // No middleware - execute original action and return result
      if (originalAction) {
        await originalAction(context);
      }
      return {
        context,
        shouldContinue: true,
        metadata: {},
      };
    }

    const pipelineId = IdGenerator.generateTransitionId();
    let executionOrder = 0;
    let currentContext = context;

    const executePipeline = async (
      index: number
    ): Promise<MiddlewareResult<TContext>> => {
      if (index >= enabledMiddlewares.length) {
        // End of pipeline - execute original action
        if (originalAction) {
          await originalAction(currentContext);
        }
        return {
          context: currentContext,
          shouldContinue: true,
          metadata: {},
        };
      }

      const middleware = enabledMiddlewares[index];
      if (!middleware) {
        if (originalAction) {
          await originalAction(currentContext);
        }
        return {
          context: currentContext,
          shouldContinue: true,
          metadata: {},
        };
      }

      const pipelineContext: StateMachineMiddlewareContext<TContext> = {
        originalContext: context,
        currentContext,
        metadata: {},
        pipelineId,
        executionOrder: executionOrder++,
        previousResults: [],
      };

      const next = async (): Promise<MiddlewareResult<TContext>> => {
        return await executePipeline(index + 1);
      };

      try {
        if (this.isNewStyleMiddleware(middleware)) {
          // Call chain hooks for backward compatibility if they exist
          if (
            'onBeforeChain' in middleware &&
            typeof middleware.onBeforeChain === 'function'
          ) {
            await (middleware as any).onBeforeChain(pipelineContext);
          } else {
            await middleware.onBeforePipeline?.(pipelineContext);
          }

          const result = await middleware.onAction!(
            pipelineContext,
            next,
            originalAction
          );

          // Call chain hooks for backward compatibility if they exist
          if (
            'onAfterChain' in middleware &&
            typeof middleware.onAfterChain === 'function'
          ) {
            await (middleware as any).onAfterChain(pipelineContext, result);
          } else {
            await middleware.onAfterPipeline?.(pipelineContext, result);
          }

          currentContext = result.context;
          return result;
        } else {
          // Legacy middleware support
          const legacyContext: StateMachineMiddlewareContext<TContext> = {
            originalContext: context,
            currentContext,
            metadata: {},
            pipelineId,
            executionOrder: executionOrder - 1,
            previousResults: [],
          };
          const result = await middleware.actionMiddleware!(
            legacyContext,
            next,
            originalAction
          );
          currentContext = result.context;
          return result;
        }
      } catch (error) {
        if (this.isNewStyleMiddleware(middleware)) {
          await middleware.onError?.(error as Error, pipelineContext);
        }
        logger.error(`Action middleware '${middleware.name}' failed`, {
          error,
          pipelineId,
        });
        throw error;
      }
    };

    return await executePipeline(0);
  }

  public async executeEntryPipeline(
    context: TContext,
    state: TState,
    originalAction?: ActionFunction<TContext>
  ): Promise<MiddlewareResult<TContext>> {
    const enabledMiddlewares = this.getEnabledMiddlewares()
      .filter((m) => this.hasEntryHandler(m))
      .sort(
        (a, b) => this.getMiddlewarePriority(a) - this.getMiddlewarePriority(b)
      );

    if (enabledMiddlewares.length === 0) {
      if (originalAction) {
        await originalAction(context);
      }
      return {
        context,
        shouldContinue: true,
        metadata: {},
      };
    }

    const pipelineId = IdGenerator.generateTransitionId();
    let executionOrder = 0;
    let currentContext = context;

    const executePipeline = async (
      index: number
    ): Promise<MiddlewareResult<TContext>> => {
      if (index >= enabledMiddlewares.length) {
        if (originalAction) {
          await originalAction(currentContext);
        }
        return {
          context: currentContext,
          shouldContinue: true,
          metadata: {},
        };
      }

      const middleware = enabledMiddlewares[index];
      if (!middleware) {
        if (originalAction) {
          await originalAction(currentContext);
        }
        return {
          context: currentContext,
          shouldContinue: true,
          metadata: {},
        };
      }

      const pipelineContext: StateMachineMiddlewareContext<TContext> = {
        originalContext: context,
        currentContext,
        metadata: {},
        pipelineId,
        executionOrder: executionOrder++,
        previousResults: [],
      };

      const next = async (): Promise<MiddlewareResult<TContext>> => {
        return await executePipeline(index + 1);
      };

      try {
        if (this.isNewStyleMiddleware(middleware)) {
          // Call chain hooks for backward compatibility if they exist
          if (
            'onBeforeChain' in middleware &&
            typeof middleware.onBeforeChain === 'function'
          ) {
            await (middleware as any).onBeforeChain(pipelineContext);
          } else {
            await middleware.onBeforePipeline?.(pipelineContext);
          }

          const result = await middleware.onStateEntry!(
            pipelineContext,
            next,
            state,
            originalAction
          );

          // Call chain hooks for backward compatibility if they exist
          if (
            'onAfterChain' in middleware &&
            typeof middleware.onAfterChain === 'function'
          ) {
            await (middleware as any).onAfterChain(pipelineContext, result);
          } else {
            await middleware.onAfterPipeline?.(pipelineContext, result);
          }

          currentContext = result.context;
          return result;
        } else {
          const legacyContext: StateMachineMiddlewareContext<TContext> = {
            originalContext: context,
            currentContext,
            metadata: {},
            pipelineId,
            executionOrder: executionOrder - 1,
            previousResults: [],
          };
          const result = await middleware.entryMiddleware!(
            legacyContext,
            next,
            state,
            originalAction
          );
          currentContext = result.context;
          return result;
        }
      } catch (error) {
        if (this.isNewStyleMiddleware(middleware)) {
          await middleware.onError?.(error as Error, pipelineContext);
        }
        logger.error(`Entry middleware '${middleware.name}' failed`, {
          error,
          pipelineId,
        });
        throw error;
      }
    };

    return await executePipeline(0);
  }

  public async executeExitPipeline(
    context: TContext,
    state: TState,
    originalAction?: ActionFunction<TContext>
  ): Promise<MiddlewareResult<TContext>> {
    const enabledMiddlewares = this.getEnabledMiddlewares()
      .filter((m) => this.hasExitHandler(m))
      .sort(
        (a, b) => this.getMiddlewarePriority(a) - this.getMiddlewarePriority(b)
      );

    if (enabledMiddlewares.length === 0) {
      if (originalAction) {
        await originalAction(context);
      }
      return {
        context,
        shouldContinue: true,
        metadata: {},
      };
    }

    const pipelineId = IdGenerator.generateTransitionId();
    let executionOrder = 0;
    let currentContext = context;

    const executePipeline = async (
      index: number
    ): Promise<MiddlewareResult<TContext>> => {
      if (index >= enabledMiddlewares.length) {
        if (originalAction) {
          await originalAction(currentContext);
        }
        return {
          context: currentContext,
          shouldContinue: true,
          metadata: {},
        };
      }

      const middleware = enabledMiddlewares[index];
      if (!middleware) {
        if (originalAction) {
          await originalAction(currentContext);
        }
        return {
          context: currentContext,
          shouldContinue: true,
          metadata: {},
        };
      }

      const pipelineContext: StateMachineMiddlewareContext<TContext> = {
        originalContext: context,
        currentContext,
        metadata: {},
        pipelineId,
        executionOrder: executionOrder++,
        previousResults: [],
      };

      const next = async (): Promise<MiddlewareResult<TContext>> => {
        return await executePipeline(index + 1);
      };

      try {
        if (this.isNewStyleMiddleware(middleware)) {
          // Call chain hooks for backward compatibility if they exist
          if (
            'onBeforeChain' in middleware &&
            typeof middleware.onBeforeChain === 'function'
          ) {
            await (middleware as any).onBeforeChain(pipelineContext);
          } else {
            await middleware.onBeforePipeline?.(pipelineContext);
          }

          const result = await middleware.onStateExit!(
            pipelineContext,
            next,
            state,
            originalAction
          );

          // Call chain hooks for backward compatibility if they exist
          if (
            'onAfterChain' in middleware &&
            typeof middleware.onAfterChain === 'function'
          ) {
            await (middleware as any).onAfterChain(pipelineContext, result);
          } else {
            await middleware.onAfterPipeline?.(pipelineContext, result);
          }

          currentContext = result.context;
          return result;
        } else {
          const legacyContext: StateMachineMiddlewareContext<TContext> = {
            originalContext: context,
            currentContext,
            metadata: {},
            pipelineId,
            executionOrder: executionOrder - 1,
            previousResults: [],
          };
          const result = await middleware.exitMiddleware!(
            legacyContext,
            next,
            state,
            originalAction
          );
          currentContext = result.context;
          return result;
        }
      } catch (error) {
        if (this.isNewStyleMiddleware(middleware)) {
          await middleware.onError?.(error as Error, pipelineContext);
        }
        logger.error(`Exit middleware '${middleware.name}' failed`, {
          error,
          pipelineId,
        });
        throw error;
      }
    };

    return await executePipeline(0);
  }

  // Legacy methods for backward compatibility - delegate to new pipeline methods
  public async executeGuardChain(
    context: TContext,
    originalGuard?: GuardFunction<TContext>
  ): Promise<boolean> {
    return await this.executeGuardPipeline(context, originalGuard);
  }

  public async executeActionChain(
    context: TContext,
    originalAction?: ActionFunction<TContext>
  ): Promise<MiddlewareResult<TContext>> {
    return await this.executeActionPipeline(context, originalAction);
  }

  public async executeEntryChain(
    context: TContext,
    state: TState,
    originalAction?: ActionFunction<TContext>
  ): Promise<MiddlewareResult<TContext>> {
    return await this.executeEntryPipeline(context, state, originalAction);
  }

  public async executeExitChain(
    context: TContext,
    state: TState,
    originalAction?: ActionFunction<TContext>
  ): Promise<MiddlewareResult<TContext>> {
    return await this.executeExitPipeline(context, state, originalAction);
  }

  public getChainOrder(): string[] {
    return this.getPipelineOrder();
  }

  public clearChain(): void {
    this.clearPipeline();
  }

  // Legacy methods for backward compatibility
  public async executeGuardMiddleware(
    context: TContext,
    originalGuard?: GuardFunction<TContext>
  ): Promise<boolean> {
    return await this.executeGuardPipeline(context, originalGuard);
  }

  public async executeActionMiddleware(
    context: TContext,
    originalAction?: ActionFunction<TContext>
  ): Promise<MiddlewareResult<TContext>> {
    return await this.executeActionChain(context, originalAction);
  }

  public async executeEntryMiddleware(
    context: TContext,
    state: TState,
    originalAction?: ActionFunction<TContext>
  ): Promise<MiddlewareResult<TContext>> {
    return await this.executeEntryChain(context, state, originalAction);
  }

  public async executeExitMiddleware(
    context: TContext,
    state: TState,
    originalAction?: ActionFunction<TContext>
  ): Promise<MiddlewareResult<TContext>> {
    return await this.executeExitChain(context, state, originalAction);
  }

  private getEnabledMiddlewares(): AnyMiddleware<TContext, TState>[] {
    return Array.from(this.middlewares.values()).filter((m) =>
      this.isMiddlewareEnabled(m)
    );
  }

  private isNewStyleMiddleware(
    middleware: AnyMiddleware<TContext, TState>
  ): middleware is IMiddleware<TContext, TState> {
    return (
      'onGuard' in middleware ||
      'onAction' in middleware ||
      'onStateEntry' in middleware ||
      'onStateExit' in middleware
    );
  }

  private getMiddlewarePriority(
    middleware: AnyMiddleware<TContext, TState>
  ): number {
    return middleware.priority ?? 0;
  }

  private isMiddlewareEnabled(
    middleware: AnyMiddleware<TContext, TState>
  ): boolean {
    return middleware.enabled !== false;
  }

  private hasGuardHandler(
    middleware: AnyMiddleware<TContext, TState>
  ): boolean {
    return this.isNewStyleMiddleware(middleware)
      ? !!middleware.onGuard
      : !!middleware.guardMiddleware;
  }

  private hasActionHandler(
    middleware: AnyMiddleware<TContext, TState>
  ): boolean {
    return this.isNewStyleMiddleware(middleware)
      ? !!middleware.onAction
      : !!middleware.actionMiddleware;
  }

  private hasEntryHandler(
    middleware: AnyMiddleware<TContext, TState>
  ): boolean {
    return this.isNewStyleMiddleware(middleware)
      ? !!middleware.onStateEntry
      : !!middleware.entryMiddleware;
  }

  private hasExitHandler(middleware: AnyMiddleware<TContext, TState>): boolean {
    return this.isNewStyleMiddleware(middleware)
      ? !!middleware.onStateExit
      : !!middleware.exitMiddleware;
  }
}
