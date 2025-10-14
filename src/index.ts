/**
 * @jewel998/state-machine
 * A lightweight, type-safe state machine library for JavaScript/TypeScript
 * Enhanced with design patterns and strict typing - Modular Architecture
 */

// Core classes - Stateless pattern only
export { StateMachine } from '@/core/StateMachine';
export { StateMachineDefinition } from '@/core/StateMachineDefinition';
export { StateMachineDefinitionBuilder } from '@/core/StateMachineDefinitionBuilder';

// All interfaces and types
export * from '@/interfaces';

// Error classes
export * from '@/errors';

// Logger (for configuration)
export { LogLevel, Logger, logger } from '@/logger';

// Design patterns (for advanced usage)
export {
  BaseCommand,
  CommandInvoker,
  CompositeCommand,
} from '@/patterns/Command';
export type { ICommand, ICommandInvoker } from '@/patterns/Command';
export { Observable } from '@/patterns/Observer';
export type { IObserver, ISubject } from '@/patterns/Observer';
export { ValidationContext, ValidationResultImpl } from '@/patterns/Strategy';
export type {
  IValidationStrategy,
  ValidationResult,
} from '@/patterns/Strategy';

// Validation strategies
export {
  BasicConfigurationValidator,
  ConfigurationValidator,
  StateReachabilityValidator,
  TransitionConsistencyValidator,
} from '@/validation/ConfigurationValidator';

// Utilities (for advanced usage)
export { IdGenerator } from '@/utils/IdGenerator';
export { PerformanceMonitor } from '@/utils/PerformanceMonitor';
export type { PerformanceMetrics } from '@/utils/PerformanceMonitor';

// Statistics and History (for monitoring)
export { HistoryManager } from '@/history/HistoryManager';
export { ObserverManager } from '@/observers/ObserverManager';
export { StatisticsCollector } from '@/statistics/StatisticsCollector';

// Middleware system (for extensibility)
export { BaseMiddleware } from '@/middleware/BaseMiddleware';
export { MiddlewareManager } from '@/middleware/MiddlewareManager';
export * from '@/middleware/types';

// Middleware factories (examples moved to examples/ directory)
export * from '@/middleware/factories';

// Immutability middleware
export { ImmutabilityMiddleware } from '@/middleware/immutability/ImmutabilityMiddleware';
export * from '@/middleware/immutability/providers/ImmerImmutabilityProvider';
export * from '@/middleware/immutability/providers/ImmutableJSProvider';
export * from '@/middleware/immutability/providers/NativeImmutabilityProvider';
