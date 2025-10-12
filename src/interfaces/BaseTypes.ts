/**
 * Base type definitions for the state machine library
 */

// Base constraint types for better type safety
export type StateIdentifier = string | number | symbol;
export type EventIdentifier = string | number | symbol;

// Utility types for strict typing
export type NonEmptyArray<T> = [T, ...T[]];
export type ReadonlyRecord<K extends PropertyKey, V> = Readonly<Record<K, V>>;

// Context constraint - must be an object type
export type ContextConstraint = Record<string, unknown>;

// Function type definitions for better type safety
export type GuardFunction<TContext extends ContextConstraint> = (
  context: TContext
) => boolean;

export type ActionFunction<TContext extends ContextConstraint> = (
  context: TContext
) => void;
