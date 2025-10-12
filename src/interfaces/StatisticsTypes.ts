/**
 * Statistics and validation related type definitions
 */

import { ReadonlyRecord } from './BaseTypes';

// Validation result types
export interface ValidationIssue {
  readonly type: 'error' | 'warning';
  readonly message: string;
  readonly code: string;
  readonly context?: ReadonlyRecord<string, unknown>;
}

export interface ConfigurationValidationResult {
  readonly isValid: boolean;
  readonly issues: readonly ValidationIssue[];
}

// Statistics interface
export interface StateMachineStatistics {
  readonly totalTransitions: number;
  readonly successfulTransitions: number;
  readonly failedTransitions: number;
  readonly stateVisitCounts: ReadonlyRecord<string, number>;
  readonly eventCounts: ReadonlyRecord<string, number>;
  readonly averageTransitionTime: number;
  readonly createdAt: Date;
  readonly lastTransitionAt?: Date;
}
