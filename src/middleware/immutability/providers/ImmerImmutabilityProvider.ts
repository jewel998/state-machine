/**
 * Immer.js immutability provider for advanced immutable state management
 */

import { ContextConstraint } from '@/interfaces';
import { logger } from '@/logger';
import { ImmutabilityProvider } from '../../types';

// Local type definitions for this provider
type UnknownValue = unknown;
interface Patch {
  op: 'replace' | 'add' | 'remove';
  path: (string | number)[];
  value?: unknown;
}

// Type definitions for Immer (to avoid requiring it as a dependency)
interface ImmerAPI {
  produce<T>(base: T, recipe: (draft: T) => void | T): T;
  freeze<T>(obj: T, deep?: boolean): T;
  isDraft(value: UnknownValue): boolean;
  current<T>(value: T): T;
  original<T>(value: T): T | undefined;
  enablePatches(): void;
  applyPatches<T>(base: T, patches: Patch[]): T;
  produceWithPatches<T>(
    base: T,
    recipe: (draft: T) => void | T
  ): [T, Patch[], Patch[]];
}

export class ImmerImmutabilityProvider<TContext extends ContextConstraint>
  implements ImmutabilityProvider<TContext>
{
  public readonly name = 'immer';
  private immer: ImmerAPI | null = null;
  private readonly enablePatches: boolean;

  constructor(
    options: { enablePatches?: boolean; immerInstance?: ImmerAPI } = {}
  ) {
    this.enablePatches = options.enablePatches ?? false;

    if (options.immerInstance) {
      this.immer = options.immerInstance;
      if (this.enablePatches && this.immer.enablePatches) {
        this.immer.enablePatches();
      }
    } else {
      this.initializeImmer();
    }
  }

  public clone(context: TContext): TContext {
    if (!this.immer) {
      throw new Error(
        'Immer is not available. Please install immer: npm install immer'
      );
    }

    try {
      // Use Immer's produce to create a clone
      return this.immer.produce(context, (draft) => {
        // Return the draft as-is to create a clone
        return draft;
      });
    } catch (error) {
      logger.error('Failed to clone context using Immer provider', { error });
      throw new Error(
        `Immer immutability provider failed to clone context: ${error}`
      );
    }
  }

  public freeze(context: TContext): TContext {
    if (!this.immer) {
      throw new Error(
        'Immer is not available. Please install immer: npm install immer'
      );
    }

    try {
      return this.immer.freeze(context, true);
    } catch (error) {
      logger.error('Failed to freeze context using Immer provider', { error });
      throw new Error(
        `Immer immutability provider failed to freeze context: ${error}`
      );
    }
  }

  public isImmutable(context: TContext): boolean {
    if (!this.immer) {
      return false;
    }

    try {
      // Check if it's a draft (mutable) or frozen
      return !this.immer.isDraft(context) && Object.isFrozen(context);
    } catch {
      return false;
    }
  }

  public produce<T extends TContext>(
    base: T,
    recipe: (draft: T) => void | T
  ): T {
    if (!this.immer) {
      throw new Error(
        'Immer is not available. Please install immer: npm install immer'
      );
    }

    return this.immer.produce(base, recipe);
  }

  public produceWithPatches<T extends TContext>(
    base: T,
    recipe: (draft: T) => void | T
  ): [T, Patch[], Patch[]] {
    if (!this.immer) {
      throw new Error(
        'Immer is not available. Please install immer: npm install immer'
      );
    }

    if (!this.enablePatches) {
      throw new Error(
        'Patches are not enabled. Create provider with enablePatches: true'
      );
    }

    return this.immer.produceWithPatches(base, recipe);
  }

  public applyPatches<T extends TContext>(base: T, patches: Patch[]): T {
    if (!this.immer) {
      throw new Error(
        'Immer is not available. Please install immer: npm install immer'
      );
    }

    return this.immer.applyPatches(base, patches);
  }

  public current<T extends TContext>(draft: T): T {
    if (!this.immer) {
      throw new Error(
        'Immer is not available. Please install immer: npm install immer'
      );
    }

    return this.immer.current(draft);
  }

  public original<T extends TContext>(draft: T): T | undefined {
    if (!this.immer) {
      throw new Error(
        'Immer is not available. Please install immer: npm install immer'
      );
    }

    return this.immer.original(draft);
  }

  private initializeImmer(): void {
    try {
      // Try to dynamically import Immer
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const immer = require('immer');

      this.immer = {
        produce: immer.produce || immer.default?.produce,
        freeze: immer.freeze || immer.default?.freeze,
        isDraft: immer.isDraft || immer.default?.isDraft,
        current: immer.current || immer.default?.current,
        original: immer.original || immer.default?.original,
        enablePatches: immer.enablePatches || immer.default?.enablePatches,
        applyPatches: immer.applyPatches || immer.default?.applyPatches,
        produceWithPatches:
          immer.produceWithPatches || immer.default?.produceWithPatches,
      };

      if (this.enablePatches && this.immer.enablePatches) {
        this.immer.enablePatches();
        logger.debug('Immer patches enabled');
      }

      logger.debug('Immer immutability provider initialized');
    } catch (error) {
      logger.warn('Immer is not available. Install with: npm install immer', {
        error,
      });
      this.immer = null;
    }
  }
}
