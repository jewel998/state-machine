/**
 * Main configuration validator using Strategy pattern
 */

import {
  ContextConstraint,
  EventIdentifier,
  StateIdentifier,
  StateMachineConfig,
} from '@/interfaces';
import { logger } from '@/logger';
import {
  IValidationStrategy,
  ValidationResult,
  ValidationResultImpl,
} from '@/patterns/Strategy';
import { BasicConfigurationValidator } from './BasicValidator';
import { TransitionConsistencyValidator } from './ConsistencyValidator';
import { StateReachabilityValidator } from './ReachabilityValidator';

export class ConfigurationValidator<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
  TEvent extends EventIdentifier,
> implements IValidationStrategy<StateMachineConfig<TContext, TState, TEvent>>
{
  private readonly strategies: readonly IValidationStrategy<
    StateMachineConfig<TContext, TState, TEvent>
  >[];

  constructor(
    strategies: readonly IValidationStrategy<
      StateMachineConfig<TContext, TState, TEvent>
    >[] = []
  ) {
    this.strategies = [
      new BasicConfigurationValidator<TContext, TState, TEvent>(),
      new StateReachabilityValidator<TContext, TState, TEvent>(),
      new TransitionConsistencyValidator<TContext, TState, TEvent>(),
      ...strategies,
    ];
  }

  public validate(
    config: StateMachineConfig<TContext, TState, TEvent>
  ): ValidationResult {
    logger.debug('Starting configuration validation');

    const results = this.strategies.map((strategy) =>
      strategy.validate(config)
    );
    const combinedResult = ValidationResultImpl.combine(...results);

    if (!combinedResult.isValid) {
      logger.error('Configuration validation failed', {
        errors: combinedResult.errors,
        warnings: combinedResult.warnings,
      });
    } else if (combinedResult.warnings.length > 0) {
      logger.warn('Configuration validation completed with warnings', {
        warnings: combinedResult.warnings,
      });
    } else {
      logger.debug('Configuration validation passed');
    }

    return combinedResult;
  }
}

// Re-export individual validators for backward compatibility
export { BasicConfigurationValidator } from './BasicValidator';
export { TransitionConsistencyValidator } from './ConsistencyValidator';
export { StateReachabilityValidator } from './ReachabilityValidator';
