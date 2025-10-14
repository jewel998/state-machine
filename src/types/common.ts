/**
 * Common type templates to replace any types
 */

// Generic object type for unknown structures
export type UnknownRecord = Record<string, unknown>;

// Generic function type for callbacks
export type UnknownFunction = (...args: unknown[]) => unknown;

// Generic array type for unknown elements
export type UnknownArray = unknown[];

// Generic value type for unknown values
export type UnknownValue = unknown;

// Type for object property access
export type ObjectProperty<T = unknown> = T;

// Type for dynamic object access
export type DynamicObject<T = unknown> = Record<string | number | symbol, T>;

// Type for external library interfaces
export interface ExternalLibraryAPI {
  [key: string]: UnknownFunction | UnknownValue;
}

// Type for patches in immutability libraries
export interface Patch {
  op: 'replace' | 'add' | 'remove';
  path: (string | number)[];
  value?: unknown;
}

// Type for immutable data structures
export interface ImmutableData {
  toJS?(): unknown;
  [key: string]: unknown;
}

// Type for reviver functions in JSON parsing
export type ReviverFunction = (
  key: string | number,
  sequence: unknown,
  path?: (string | number)[]
) => unknown;

// Type for guard context validation
export interface GuardContext {
  [key: string]: unknown;
}

// Type for action context modification
export interface ActionContext {
  [key: string]: unknown;
}
