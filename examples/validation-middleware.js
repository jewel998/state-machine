/**
 * Example validation middleware demonstrating state machine middleware pipeline pattern
 */

const { BaseMiddleware } = require('../dist/middleware/BaseMiddleware');

class ValidationError extends Error {
  constructor(failures, context) {
    super(`Validation failed in ${context}: ${failures.join(', ')}`);
    this.name = 'ValidationError';
    this.failures = failures;
    this.context = context;
  }
}

class ValidationMiddleware extends BaseMiddleware {
  constructor(options = {}) {
    super('validation', {
      priority: options.priority ?? -500, // Run early to catch issues
      enabled: options.enabled ?? true,
    });

    this.rules = options.rules ?? [];
    this.options = {
      stopOnFirstError: options.stopOnFirstError ?? false,
      validateOnGuard: options.validateOnGuard ?? true,
      validateOnAction: options.validateOnAction ?? true,
      validateOnStateEntry: options.validateOnStateEntry ?? false,
      validateOnStateExit: options.validateOnStateExit ?? false,
    };
  }

  addRule(rule) {
    this.rules.push(rule);
  }

  removeRule(name) {
    const index = this.rules.findIndex((rule) => rule.name === name);
    if (index >= 0) {
      this.rules.splice(index, 1);
    }
  }

  async onGuard(context, next, _originalGuard) {
    if (this.options.validateOnGuard) {
      await this.validateContext(context.currentContext, 'guard');
    }
    return await next();
  }

  async onAction(context, next, _originalAction) {
    if (this.options.validateOnAction) {
      await this.validateContext(context.currentContext, 'action');
    }

    const result = await next();

    // Validate the result context as well
    if (this.options.validateOnAction) {
      await this.validateContext(result.context, 'action-result');
    }

    return this.createResult(
      result.context,
      result.shouldContinue,
      this.mergeMetadata(result.metadata ?? {}, { validated: true })
    );
  }

  async onStateEntry(context, next, state, _originalAction) {
    if (this.options.validateOnStateEntry) {
      await this.validateContext(
        context.currentContext,
        `state-entry-${String(state)}`
      );
    }

    const result = await next();

    if (this.options.validateOnStateEntry) {
      await this.validateContext(
        result.context,
        `state-entry-result-${String(state)}`
      );
    }

    return result;
  }

  async onStateExit(context, next, state, _originalAction) {
    if (this.options.validateOnStateExit) {
      await this.validateContext(
        context.currentContext,
        `state-exit-${String(state)}`
      );
    }

    const result = await next();

    if (this.options.validateOnStateExit) {
      await this.validateContext(
        result.context,
        `state-exit-result-${String(state)}`
      );
    }

    return result;
  }

  async validateContext(context, contextName) {
    const failures = [];

    for (const rule of this.rules) {
      try {
        const result = await rule.validate(context);

        if (result === false) {
          failures.push(rule.name);
          if (this.options.stopOnFirstError) {
            break;
          }
        } else if (typeof result === 'string') {
          failures.push(`${rule.name}: ${result}`);
          if (this.options.stopOnFirstError) {
            break;
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        failures.push(`${rule.name}: ${errorMessage}`);
        if (this.options.stopOnFirstError) {
          break;
        }
      }
    }

    if (failures.length > 0) {
      throw new ValidationError(failures, contextName);
    }
  }
}

// Common validation rules factory
class ValidationRules {
  static required(fieldPath, getter) {
    return {
      name: `required-${fieldPath}`,
      validate: (context) => {
        const value = getter(context);
        return value !== null && value !== undefined && value !== '';
      },
      required: true,
    };
  }

  static type(fieldPath, expectedType, getter) {
    return {
      name: `type-${fieldPath}`,
      validate: (context) => {
        const value = getter(context);
        return typeof value === expectedType;
      },
    };
  }

  static range(fieldPath, min, max, getter) {
    return {
      name: `range-${fieldPath}`,
      validate: (context) => {
        const value = getter(context);
        return value >= min && value <= max;
      },
    };
  }

  static custom(name, validator) {
    return {
      name,
      validate: validator,
    };
  }
}

module.exports = { ValidationMiddleware, ValidationError, ValidationRules };
