/**
 * Immutability middleware for state machine context management
 */

import {
  ActionFunction,
  ContextConstraint,
  GuardFunction,
  StateIdentifier,
} from '@/interfaces';
import { logger } from '@/logger';
import {
  ActionMiddleware,
  GuardMiddleware,
  ImmutabilityOptions,
  ImmutabilityProvider,
  MiddlewareConfig,
  MiddlewareResult,
  NextFunction,
  StateMachineMiddlewareContext,
  StateMiddleware,
} from '../types';
import { ImmerImmutabilityProvider } from './providers/ImmerImmutabilityProvider';
import { ImmutableJSProvider } from './providers/ImmutableJSProvider';
import { NativeImmutabilityProvider } from './providers/NativeImmutabilityProvider';

export class ImmutabilityMiddleware<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
> {
  private readonly provider: ImmutabilityProvider<TContext>;
  private readonly options: Required<ImmutabilityOptions<TContext>>;

  constructor(options: ImmutabilityOptions<TContext>) {
    this.options = {
      provider: options.provider,
      autoFreeze: options.autoFreeze ?? true,
      enablePatches: options.enablePatches ?? false,
      strictMode: options.strictMode ?? false,
    };

    this.provider = this.createProvider();

    logger.info(
      `Immutability middleware initialized with ${this.provider.name} provider`,
      {
        autoFreeze: this.options.autoFreeze,
        enablePatches: this.options.enablePatches,
        strictMode: this.options.strictMode,
      }
    );
  }

  public getMiddlewareConfig(): MiddlewareConfig<TContext, TState> {
    return {
      name: 'immutability',
      priority: -1000, // Run early to ensure immutability
      guardMiddleware: this.createGuardMiddleware(),
      actionMiddleware: this.createActionMiddleware(),
      entryMiddleware: this.createStateMiddleware(),
      exitMiddleware: this.createStateMiddleware(),
      enabled: true,
    };
  }

  public getProvider(): ImmutabilityProvider<TContext> {
    return this.provider;
  }

  private createProvider(): ImmutabilityProvider<TContext> {
    if (typeof this.options.provider === 'object') {
      return this.options.provider;
    }

    switch (this.options.provider) {
      case 'immer':
        return new ImmerImmutabilityProvider<TContext>({
          enablePatches: this.options.enablePatches,
        });

      case 'immutable-js':
        return new ImmutableJSProvider<TContext>();

      case 'native':
      default:
        return new NativeImmutabilityProvider<TContext>();
    }
  }

  private createGuardMiddleware(): GuardMiddleware<TContext> {
    return async (
      context: StateMachineMiddlewareContext<TContext>,
      _next: () => Promise<boolean>,
      originalGuard?: GuardFunction<TContext>
    ): Promise<boolean> => {
      try {
        // Ensure context is immutable before guard execution
        const immutableContext = this.ensureImmutable(context.currentContext);

        if (!originalGuard) {
          return true;
        }

        // Execute guard with immutable context
        const result = await originalGuard(immutableContext);

        logger.debug('Guard executed with immutable context', {
          provider: this.provider.name,
          result,
        });

        return result;
      } catch (error) {
        logger.error('Immutability guard middleware failed', { error });

        if (this.options.strictMode) {
          throw error;
        }

        return false;
      }
    };
  }

  private createActionMiddleware(): ActionMiddleware<TContext> {
    return async (
      context: StateMachineMiddlewareContext<TContext>,
      _next: NextFunction<TContext>,
      originalAction?: ActionFunction<TContext>
    ): Promise<MiddlewareResult<TContext>> => {
      try {
        // Clone context to ensure immutability
        const clonedContext = this.provider.clone(context.currentContext);

        // Execute original action if provided
        if (originalAction) {
          await originalAction(clonedContext);
        }

        // Freeze the result if auto-freeze is enabled
        const finalContext = this.options.autoFreeze
          ? this.provider.freeze(clonedContext)
          : clonedContext;

        logger.debug('Action executed with immutable context', {
          provider: this.provider.name,
          autoFreeze: this.options.autoFreeze,
          isImmutable: this.provider.isImmutable(finalContext),
        });

        return {
          context: finalContext,
          shouldContinue: true,
          metadata: {
            immutabilityProvider: this.provider.name,
            wasCloned: true,
            wasFrozen: this.options.autoFreeze,
          },
        };
      } catch (error) {
        logger.error('Immutability action middleware failed', { error });

        if (this.options.strictMode) {
          throw error;
        }

        // Return original context on error
        return {
          context: context.currentContext,
          shouldContinue: true,
          metadata: {
            immutabilityProvider: this.provider.name,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    };
  }

  private createStateMiddleware(): StateMiddleware<TContext, TState> {
    return async (
      context: StateMachineMiddlewareContext<TContext>,
      _next: NextFunction<TContext>,
      state: TState,
      originalAction?: ActionFunction<TContext>
    ): Promise<MiddlewareResult<TContext>> => {
      try {
        // Clone context to ensure immutability
        const clonedContext = this.provider.clone(context.currentContext);

        // Execute original action if provided
        if (originalAction) {
          await originalAction(clonedContext);
        }

        // Freeze the result if auto-freeze is enabled
        const finalContext = this.options.autoFreeze
          ? this.provider.freeze(clonedContext)
          : clonedContext;

        logger.debug('State action executed with immutable context', {
          state: String(state),
          provider: this.provider.name,
          autoFreeze: this.options.autoFreeze,
          isImmutable: this.provider.isImmutable(finalContext),
        });

        return {
          context: finalContext,
          shouldContinue: true,
          metadata: {
            immutabilityProvider: this.provider.name,
            state: String(state),
            wasCloned: true,
            wasFrozen: this.options.autoFreeze,
          },
        };
      } catch (error) {
        logger.error('Immutability state middleware failed', {
          error,
          state: String(state),
        });

        if (this.options.strictMode) {
          throw error;
        }

        // Return original context on error
        return {
          context: context.currentContext,
          shouldContinue: true,
          metadata: {
            immutabilityProvider: this.provider.name,
            state: String(state),
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    };
  }

  private ensureImmutable(context: TContext): TContext {
    if (this.provider.isImmutable(context)) {
      return context;
    }

    try {
      // Auto-freeze if not immutable
      return this.provider.freeze(context);
    } catch (error) {
      if (this.options.strictMode) {
        throw error;
      }

      // In non-strict mode, return the original context
      return context;
    }
  }
}
