/**
 * Middleware system exports
 */

// Core middleware types and interfaces
export * from './types';

// Middleware manager
export { MiddlewareManager } from './MiddlewareManager';

// Immutability middleware and providers
export { ImmutabilityMiddleware } from './immutability/ImmutabilityMiddleware';
export { ImmerImmutabilityProvider } from './immutability/providers/ImmerImmutabilityProvider';
export { ImmutableJSProvider } from './immutability/providers/ImmutableJSProvider';
export { NativeImmutabilityProvider } from './immutability/providers/NativeImmutabilityProvider';

// Convenience factory functions
export {
  createImmerMiddleware,
  createImmutabilityMiddleware,
  createImmutableJSMiddleware,
  createNativeImmutabilityMiddleware,
} from './factories';
