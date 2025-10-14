/**
 * Factory functions for creating common middleware configurations
 */

import { ContextConstraint, StateIdentifier } from '@/interfaces';
import { ImmutabilityMiddleware } from './immutability/ImmutabilityMiddleware';

import {
  ImmutabilityOptions,
  ImmutabilityProvider,
  MiddlewareConfig,
} from './types';

// Example middleware classes moved to examples/ directory

/**
 * Create an immutability middleware with the specified options
 */
export function createImmutabilityMiddleware<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
>(options: ImmutabilityOptions<TContext>): MiddlewareConfig<TContext, TState> {
  const middleware = new ImmutabilityMiddleware<TContext, TState>(options);
  return middleware.getMiddlewareConfig();
}

/**
 * Create a native immutability middleware (using Object.freeze and structuredClone)
 */
export function createNativeImmutabilityMiddleware<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
>(
  options: {
    autoFreeze?: boolean;
    strictMode?: boolean;
  } = {}
): MiddlewareConfig<TContext, TState> {
  return createImmutabilityMiddleware<TContext, TState>({
    provider: 'native',
    autoFreeze: options.autoFreeze ?? true,
    strictMode: options.strictMode ?? false,
  });
}

/**
 * Create an Immer.js immutability middleware
 */
export function createImmerMiddleware<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
>(
  options: {
    autoFreeze?: boolean;
    enablePatches?: boolean;
    strictMode?: boolean;
    immerInstance?: unknown;
  } = {}
): MiddlewareConfig<TContext, TState> {
  if (options.immerInstance) {
    // Create provider directly with the immer instance
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const {
      ImmerImmutabilityProvider,
    } = require('./immutability/providers/ImmerImmutabilityProvider');
    const provider = new ImmerImmutabilityProvider({
      enablePatches: options.enablePatches ?? false,
      immerInstance: options.immerInstance,
    }) as ImmutabilityProvider<TContext>;

    return createImmutabilityMiddleware<TContext, TState>({
      provider,
      autoFreeze: options.autoFreeze ?? true,
      strictMode: options.strictMode ?? false,
    });
  }

  return createImmutabilityMiddleware<TContext, TState>({
    provider: 'immer',
    autoFreeze: options.autoFreeze ?? true,
    enablePatches: options.enablePatches ?? false,
    strictMode: options.strictMode ?? false,
  });
}

/**
 * Create an Immutable.js middleware
 */
export function createImmutableJSMiddleware<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
>(
  options: {
    autoFreeze?: boolean;
    strictMode?: boolean;
  } = {}
): MiddlewareConfig<TContext, TState> {
  return createImmutabilityMiddleware<TContext, TState>({
    provider: 'immutable-js',
    autoFreeze: options.autoFreeze ?? true,
    strictMode: options.strictMode ?? false,
  });
}

// State machine middleware pipeline factories

// Factory functions for example middleware moved to examples/ directory

// Export middleware classes for direct use
export { BaseMiddleware } from './BaseMiddleware';

// Example middleware classes (LoggingMiddleware, MetricsMiddleware, ValidationMiddleware)
// have been moved to examples/ directory as JavaScript files
