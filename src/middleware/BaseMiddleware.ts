/**
 * Base middleware class implementing state machine middleware pipeline pattern
 * Users can extend this class to create custom state machine middleware easily
 */

import {
  ActionFunction,
  ContextConstraint,
  GuardFunction,
  StateIdentifier,
} from '@/interfaces';
import {
  IMiddleware,
  MiddlewareResult,
  NextFunction,
  StateMachineMiddlewareContext,
} from './types';

export abstract class BaseMiddleware<
  TContext extends ContextConstraint,
  TState extends StateIdentifier = StateIdentifier,
> implements IMiddleware<TContext, TState>
{
  public readonly name: string;
  public readonly priority: number;
  public readonly enabled: boolean;

  constructor(
    name: string,
    options: {
      priority?: number;
      enabled?: boolean;
    } = {}
  ) {
    this.name = name;
    this.priority = options.priority ?? 0;
    this.enabled = options.enabled ?? true;
  }

  // Optional hooks that subclasses can override
  public async onGuard(
    _context: StateMachineMiddlewareContext<TContext>,
    next: () => Promise<boolean>,
    _originalGuard?: GuardFunction<TContext>
  ): Promise<boolean> {
    return await next();
  }

  public async onAction(
    _context: StateMachineMiddlewareContext<TContext>,
    next: NextFunction<TContext>,
    _originalAction?: ActionFunction<TContext>
  ): Promise<MiddlewareResult<TContext>> {
    return await next();
  }

  public async onStateEntry(
    _context: StateMachineMiddlewareContext<TContext>,
    next: NextFunction<TContext>,
    _state: TState,
    _originalAction?: ActionFunction<TContext>
  ): Promise<MiddlewareResult<TContext>> {
    return await next();
  }

  public async onStateExit(
    _context: StateMachineMiddlewareContext<TContext>,
    next: NextFunction<TContext>,
    _state: TState,
    _originalAction?: ActionFunction<TContext>
  ): Promise<MiddlewareResult<TContext>> {
    return await next();
  }

  // Lifecycle hooks
  public async onBeforePipeline(
    _context: StateMachineMiddlewareContext<TContext>
  ): Promise<void> {
    // Default implementation does nothing
  }

  public async onAfterPipeline(
    _context: StateMachineMiddlewareContext<TContext>,
    _result: MiddlewareResult<TContext>
  ): Promise<void> {
    // Default implementation does nothing
  }

  public async onError(
    error: Error,
    _context: StateMachineMiddlewareContext<TContext>
  ): Promise<void> {
    // Default implementation re-throws the error
    throw error;
  }

  // Utility methods for common middleware patterns
  protected createResult(
    context: TContext,
    shouldContinue: boolean = true,
    metadata?: Record<string, unknown>
  ): MiddlewareResult<TContext> {
    return {
      context,
      shouldContinue,
      ...(metadata && { metadata }),
    };
  }

  protected mergeMetadata(
    existing: Record<string, unknown>,
    additional: Record<string, unknown>
  ): Record<string, unknown> {
    return { ...existing, ...additional };
  }

  protected shouldSkip(
    _context: StateMachineMiddlewareContext<TContext>
  ): boolean {
    return !this.enabled;
  }

  // Legacy chain hooks for backward compatibility
  protected async onBeforeChain(
    _context: StateMachineMiddlewareContext<TContext>
  ): Promise<void> {
    // Default implementation delegates to onBeforePipeline
    await this.onBeforePipeline(_context);
  }

  protected async onAfterChain(
    context: StateMachineMiddlewareContext<TContext>,
    result: MiddlewareResult<TContext>
  ): Promise<void> {
    // Default implementation delegates to onAfterPipeline
    await this.onAfterPipeline(context, result);
  }

  // Template method for common pre/post processing
  protected async executeWithHooks<T>(
    context: StateMachineMiddlewareContext<TContext>,
    operation: () => Promise<T>
  ): Promise<T> {
    try {
      await this.onBeforeChain(context);
      const result = await operation();

      if (this.isMiddlewareResult(result)) {
        await this.onAfterChain(context, result);
      }

      return result;
    } catch (error) {
      await this.onError(error as Error, context);
      throw error;
    }
  }

  private isMiddlewareResult(
    value: unknown
  ): value is MiddlewareResult<TContext> {
    return (
      typeof value === 'object' &&
      value !== null &&
      'context' in value &&
      'shouldContinue' in value
    );
  }
}
