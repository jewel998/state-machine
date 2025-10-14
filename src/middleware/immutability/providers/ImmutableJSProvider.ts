/**
 * Immutable.js provider for Facebook's Immutable data structures
 */

import { ContextConstraint } from '@/interfaces';
import { logger } from '@/logger';
import { ImmutabilityProvider } from '../../types';

// Local type definitions for this provider
type UnknownValue = unknown;
type UnknownArray = unknown[];
type ReviverFunction = (
  key: string | number,
  sequence: unknown,
  path?: (string | number)[]
) => unknown;
interface ImmutableData {
  toJS?(): unknown;
  [key: string]: unknown;
}

// Type definitions for Immutable.js (to avoid requiring it as a dependency)
interface ImmutableAPI {
  Map(obj?: UnknownValue): ImmutableData;
  List(array?: UnknownArray): ImmutableData;
  Set(array?: UnknownArray): ImmutableData;
  fromJS(obj: UnknownValue, reviver?: ReviverFunction): ImmutableData;
  isImmutable(maybeImmutable: UnknownValue): boolean;
  isMap(maybeMap: UnknownValue): boolean;
  isList(maybeList: UnknownValue): boolean;
  isSet(maybeSet: UnknownValue): boolean;
}

export class ImmutableJSProvider<TContext extends ContextConstraint>
  implements ImmutabilityProvider<TContext>
{
  public readonly name = 'immutable-js';
  private immutable: ImmutableAPI | null = null;

  constructor() {
    this.initializeImmutableJS();
  }

  public clone(context: TContext): TContext {
    if (!this.immutable) {
      throw new Error(
        'Immutable.js is not available. Please install immutable: npm install immutable'
      );
    }

    try {
      // Convert to Immutable and back to get a deep clone
      const immutableData = this.immutable.fromJS(context);
      return immutableData.toJS?.() as TContext;
    } catch (error) {
      logger.error('Failed to clone context using Immutable.js provider', {
        error,
      });
      throw new Error(
        `Immutable.js provider failed to clone context: ${error}`
      );
    }
  }

  public freeze(context: TContext): TContext {
    if (!this.immutable) {
      throw new Error(
        'Immutable.js is not available. Please install immutable: npm install immutable'
      );
    }

    try {
      // Convert to Immutable data structure (which is inherently immutable)
      this.immutable.fromJS(context);

      // For compatibility, we'll return the original context but frozen
      // In a real implementation, you might want to return the Immutable structure
      return Object.freeze(JSON.parse(JSON.stringify(context))) as TContext;
    } catch (error) {
      logger.error('Failed to freeze context using Immutable.js provider', {
        error,
      });
      throw new Error(
        `Immutable.js provider failed to freeze context: ${error}`
      );
    }
  }

  public isImmutable(context: TContext): boolean {
    if (!this.immutable) {
      return false;
    }

    try {
      return this.immutable.isImmutable(context) || Object.isFrozen(context);
    } catch {
      return false;
    }
  }

  public toImmutable(context: TContext): ImmutableData {
    if (!this.immutable) {
      throw new Error(
        'Immutable.js is not available. Please install immutable: npm install immutable'
      );
    }

    return this.immutable.fromJS(context);
  }

  public fromImmutable(immutableData: ImmutableData): TContext {
    if (!this.immutable) {
      throw new Error(
        'Immutable.js is not available. Please install immutable: npm install immutable'
      );
    }

    if (!this.immutable.isImmutable(immutableData)) {
      throw new Error('Provided data is not an Immutable.js structure');
    }

    return immutableData.toJS?.() as TContext;
  }

  public isMap(value: UnknownValue): boolean {
    return this.immutable?.isMap(value) ?? false;
  }

  public isList(value: UnknownValue): boolean {
    return this.immutable?.isList(value) ?? false;
  }

  public isSet(value: UnknownValue): boolean {
    return this.immutable?.isSet(value) ?? false;
  }

  private initializeImmutableJS(): void {
    try {
      // Try to dynamically import Immutable.js
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Immutable = require('immutable');

      this.immutable = {
        Map: Immutable.Map,
        List: Immutable.List,
        Set: Immutable.Set,
        fromJS: Immutable.fromJS,
        isImmutable: Immutable.isImmutable,
        isMap: Immutable.isMap,
        isList: Immutable.isList,
        isSet: Immutable.isSet,
      };

      logger.debug('Immutable.js provider initialized');
    } catch (error) {
      logger.warn(
        'Immutable.js is not available. Install with: npm install immutable',
        { error }
      );
      this.immutable = null;
    }
  }
}
