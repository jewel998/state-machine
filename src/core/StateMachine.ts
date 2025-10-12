/**
 * StateMachine - Stateless pattern for maximum efficiency
 * Objects store only state values, share behavior definitions
 */

import { StateMachineConfigurationError } from '@/errors';
import {
  ContextConstraint,
  EventIdentifier,
  IStateMachineDefinition,
  StateIdentifier,
  StateMachineConfig,
} from '@/interfaces';
import { logger } from '@/logger';
import { ConfigurationValidator } from '@/validation/ConfigurationValidator';
import { StateMachineDefinition } from './StateMachineDefinition';

export class StateMachine {
  // Static factory method for creating stateless definitions
  public static createDefinition<
    TContext extends ContextConstraint,
    TState extends StateIdentifier,
    TEvent extends EventIdentifier,
  >(
    config: StateMachineConfig<TContext, TState, TEvent>
  ): IStateMachineDefinition<TContext, TState, TEvent> {
    StateMachine.validateConfiguration(config);
    return new StateMachineDefinition(config);
  }

  // Builder for stateless definitions (primary API)
  public static definitionBuilder<
    TContext extends ContextConstraint,
    TState extends StateIdentifier,
    TEvent extends EventIdentifier,
  >(): import('./StateMachineDefinitionBuilder').StateMachineDefinitionBuilder<
    TContext,
    TState,
    TEvent
  > {
    // Dynamic import to avoid circular dependency
    const {
      StateMachineDefinitionBuilder,
    } = require('./StateMachineDefinitionBuilder');
    return new StateMachineDefinitionBuilder();
  }

  private static validateConfiguration<
    TContext extends ContextConstraint,
    TState extends StateIdentifier,
    TEvent extends EventIdentifier,
  >(config: StateMachineConfig<TContext, TState, TEvent>): void {
    const validator = new ConfigurationValidator<TContext, TState, TEvent>();
    const validationResult = validator.validate(config);

    if (!validationResult.isValid) {
      const errorMessage = `Configuration validation failed: ${validationResult.errors.join(', ')}`;
      logger.error(errorMessage);
      throw new StateMachineConfigurationError(errorMessage);
    }

    if (validationResult.warnings.length > 0) {
      validationResult.warnings.forEach((warning: string) =>
        logger.warn(warning)
      );
    }
  }
}
