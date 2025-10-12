/**
 * Strategy pattern for different validation and execution strategies
 */

export interface IValidationStrategy<TConfig> {
  validate(config: TConfig): ValidationResult;
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

/**
 * Validation result implementation
 */
export class ValidationResultImpl implements ValidationResult {
  constructor(
    public readonly isValid: boolean,
    public readonly errors: readonly string[] = [],
    public readonly warnings: readonly string[] = []
  ) {}

  public static success(warnings: readonly string[] = []): ValidationResult {
    return new ValidationResultImpl(true, [], warnings);
  }

  public static failure(
    errors: readonly string[],
    warnings: readonly string[] = []
  ): ValidationResult {
    return new ValidationResultImpl(false, errors, warnings);
  }

  public static combine(
    ...results: readonly ValidationResult[]
  ): ValidationResult {
    const allErrors = results.flatMap((r) => r.errors);
    const allWarnings = results.flatMap((r) => r.warnings);
    const isValid = results.every((r) => r.isValid);

    return new ValidationResultImpl(isValid, allErrors, allWarnings);
  }
}

/**
 * Context class for Strategy pattern
 */
export class ValidationContext<TConfig> {
  private strategy: IValidationStrategy<TConfig>;

  constructor(strategy: IValidationStrategy<TConfig>) {
    this.strategy = strategy;
  }

  public setStrategy(strategy: IValidationStrategy<TConfig>): void {
    this.strategy = strategy;
  }

  public validate(config: TConfig): ValidationResult {
    return this.strategy.validate(config);
  }
}
