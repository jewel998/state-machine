/**
 * Middleware system types for state machine extensibility
 * Implements middleware pipeline pattern for flexible state machine composition
 */

import {
  ActionFunction,
  ContextConstraint,
  GuardFunction,
  StateIdentifier,
} from '@/interfaces';

// Core middleware types
export interface MiddlewareContext<TContext extends ContextConstraint> {
  readonly originalContext: TContext;
  readonly currentContext: TContext;
  readonly metadata: Record<string, unknown>;
}

export interface MiddlewareResult<TContext extends ContextConstraint> {
  readonly context: TContext;
  readonly shouldContinue: boolean;
  readonly metadata?: Record<string, unknown>;
}

// State machine middleware pipeline types
export interface StateMachineMiddlewareContext<
  TContext extends ContextConstraint,
> extends MiddlewareContext<TContext> {
  readonly pipelineId: string;
  readonly executionOrder: number;
  readonly previousResults: MiddlewareResult<TContext>[];
}

export type NextFunction<TContext extends ContextConstraint> = () => Promise<
  MiddlewareResult<TContext>
>;

// Enhanced middleware function types with pipeline support
export type GuardMiddleware<TContext extends ContextConstraint> = (
  context: StateMachineMiddlewareContext<TContext>,
  next: () => Promise<boolean>,
  originalGuard?: GuardFunction<TContext>
) => boolean | Promise<boolean>;

export type ActionMiddleware<TContext extends ContextConstraint> = (
  context: StateMachineMiddlewareContext<TContext>,
  next: NextFunction<TContext>,
  originalAction?: ActionFunction<TContext>
) => MiddlewareResult<TContext> | Promise<MiddlewareResult<TContext>>;

export type StateMiddleware<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
> = (
  context: StateMachineMiddlewareContext<TContext>,
  next: NextFunction<TContext>,
  state: TState,
  originalAction?: ActionFunction<TContext>
) => MiddlewareResult<TContext> | Promise<MiddlewareResult<TContext>>;

// Base middleware interface for custom implementations
export interface IMiddleware<
  TContext extends ContextConstraint,
  TState extends StateIdentifier = StateIdentifier,
> {
  readonly name: string;
  readonly priority: number;
  readonly enabled: boolean;

  // Optional middleware hooks
  onGuard?(
    context: StateMachineMiddlewareContext<TContext>,
    next: () => Promise<boolean>,
    originalGuard?: GuardFunction<TContext>
  ): boolean | Promise<boolean>;

  onAction?(
    context: StateMachineMiddlewareContext<TContext>,
    next: NextFunction<TContext>,
    originalAction?: ActionFunction<TContext>
  ): MiddlewareResult<TContext> | Promise<MiddlewareResult<TContext>>;

  onStateEntry?(
    context: StateMachineMiddlewareContext<TContext>,
    next: NextFunction<TContext>,
    state: TState,
    originalAction?: ActionFunction<TContext>
  ): MiddlewareResult<TContext> | Promise<MiddlewareResult<TContext>>;

  onStateExit?(
    context: StateMachineMiddlewareContext<TContext>,
    next: NextFunction<TContext>,
    state: TState,
    originalAction?: ActionFunction<TContext>
  ): MiddlewareResult<TContext> | Promise<MiddlewareResult<TContext>>;

  // Lifecycle hooks
  onBeforePipeline?(
    context: StateMachineMiddlewareContext<TContext>
  ): void | Promise<void>;
  onAfterPipeline?(
    context: StateMachineMiddlewareContext<TContext>,
    result: MiddlewareResult<TContext>
  ): void | Promise<void>;
  onError?(
    error: Error,
    context: StateMachineMiddlewareContext<TContext>
  ): void | Promise<void>;
}

// Backward compatibility - legacy middleware configuration
export interface MiddlewareConfig<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
> {
  readonly name: string;
  readonly priority?: number;
  readonly guardMiddleware?: GuardMiddleware<TContext>;
  readonly actionMiddleware?: ActionMiddleware<TContext>;
  readonly entryMiddleware?: StateMiddleware<TContext, TState>;
  readonly exitMiddleware?: StateMiddleware<TContext, TState>;
  readonly enabled?: boolean;
}

// Enhanced middleware manager interface
export interface IMiddlewareManager<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
> {
  // Legacy methods for backward compatibility
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

  // Pipeline execution methods
  executeGuardPipeline(
    context: TContext,
    originalGuard?: GuardFunction<TContext>
  ): Promise<boolean>;
  executeActionPipeline(
    context: TContext,
    originalAction?: ActionFunction<TContext>
  ): Promise<MiddlewareResult<TContext>>;
  executeEntryPipeline(
    context: TContext,
    state: TState,
    originalAction?: ActionFunction<TContext>
  ): Promise<MiddlewareResult<TContext>>;
  executeExitPipeline(
    context: TContext,
    state: TState,
    originalAction?: ActionFunction<TContext>
  ): Promise<MiddlewareResult<TContext>>;

  // Legacy chain methods for backward compatibility
  executeGuardChain(
    context: TContext,
    originalGuard?: GuardFunction<TContext>
  ): Promise<boolean>;
  executeActionChain(
    context: TContext,
    originalAction?: ActionFunction<TContext>
  ): Promise<MiddlewareResult<TContext>>;
  executeEntryChain(
    context: TContext,
    state: TState,
    originalAction?: ActionFunction<TContext>
  ): Promise<MiddlewareResult<TContext>>;
  executeExitChain(
    context: TContext,
    state: TState,
    originalAction?: ActionFunction<TContext>
  ): Promise<MiddlewareResult<TContext>>;

  // Legacy methods for backward compatibility
  executeGuardMiddleware(
    context: TContext,
    originalGuard?: GuardFunction<TContext>
  ): Promise<boolean>;
  executeActionMiddleware(
    context: TContext,
    originalAction?: ActionFunction<TContext>
  ): Promise<MiddlewareResult<TContext>>;
  executeEntryMiddleware(
    context: TContext,
    state: TState,
    originalAction?: ActionFunction<TContext>
  ): Promise<MiddlewareResult<TContext>>;
  executeExitMiddleware(
    context: TContext,
    state: TState,
    originalAction?: ActionFunction<TContext>
  ): Promise<MiddlewareResult<TContext>>;

  // Pipeline management
  getPipelineOrder(): string[];
  clearPipeline(): void;
  // Legacy methods for backward compatibility
  getChainOrder(): string[];
  clearChain(): void;
}

// Immutability provider interface
export interface ImmutabilityProvider<TContext extends ContextConstraint> {
  readonly name: string;
  clone(context: TContext): TContext;
  freeze(context: TContext): TContext;
  isImmutable(context: TContext): boolean;
}

// Built-in immutability providers
export type ImmutabilityProviderType =
  | 'native'
  | 'immer'
  | 'immutable-js'
  | 'custom';

export interface ImmutabilityOptions<TContext extends ContextConstraint> {
  readonly provider: ImmutabilityProviderType | ImmutabilityProvider<TContext>;
  readonly autoFreeze?: boolean;
  readonly enablePatches?: boolean;
  readonly strictMode?: boolean;
}
