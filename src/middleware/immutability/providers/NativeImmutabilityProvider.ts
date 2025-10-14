/**
 * Native JavaScript immutability provider using Object.freeze and structuredClone
 */

import { ContextConstraint } from '@/interfaces';
import { logger } from '@/logger';
import { ImmutabilityProvider } from '../../types';

// Local type definitions for this provider
type ObjectProperty<T = unknown> = T;

export class NativeImmutabilityProvider<TContext extends ContextConstraint>
  implements ImmutabilityProvider<TContext>
{
  public readonly name = 'native';

  public clone(context: TContext): TContext {
    try {
      // Use structuredClone if available (Node 17+, modern browsers)
      if (typeof structuredClone !== 'undefined') {
        return structuredClone(context);
      }

      // Fallback to JSON clone for simple objects
      return JSON.parse(JSON.stringify(context)) as TContext;
    } catch (error) {
      logger.error('Failed to clone context using native provider', { error });
      throw new Error(
        `Native immutability provider failed to clone context: ${error}`
      );
    }
  }

  public freeze(context: TContext): TContext {
    try {
      return this.deepFreeze(context);
    } catch (error) {
      logger.error('Failed to freeze context using native provider', { error });
      throw new Error(
        `Native immutability provider failed to freeze context: ${error}`
      );
    }
  }

  public isImmutable(context: TContext): boolean {
    return Object.isFrozen(context) && this.isDeepFrozen(context);
  }

  private deepFreeze<T>(obj: T): T {
    // Retrieve the property names defined on obj
    const propNames = Object.getOwnPropertyNames(obj);

    // Freeze properties before freezing self
    for (const name of propNames) {
      const value = (obj as Record<string, unknown>)[name];

      if (value && typeof value === 'object') {
        this.deepFreeze(value);
      }
    }

    return Object.freeze(obj);
  }

  private isDeepFrozen(obj: ObjectProperty): boolean {
    if (!Object.isFrozen(obj)) {
      return false;
    }

    const propNames = Object.getOwnPropertyNames(obj);

    for (const name of propNames) {
      const value = (obj as Record<string, unknown>)[name];

      if (value && typeof value === 'object' && !this.isDeepFrozen(value)) {
        return false;
      }
    }

    return true;
  }
}
