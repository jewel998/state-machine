---
title: Error Handling
description:
  Comprehensive error handling guide for state machines covering try-catch patterns, error recovery,
  middleware error handling, async error management, and production-ready error strategies.
keywords:
  [
    error handling,
    state machine errors,
    error recovery,
    try-catch,
    async errors,
    middleware errors,
    error strategies,
    production errors,
    debugging,
    error boundaries,
  ]
sidebar_position: 4
---

# Error Handling

The state machine library provides comprehensive error handling mechanisms to help you build robust
applications. This guide covers all error types, handling strategies, and best practices.

## Error Types

The library defines specific error types for different scenarios, all extending the base
`StateMachineError` class.

### StateMachineError (Base Class)

The base error class that all other state machine errors extend:

```typescript showLineNumbers
import { StateMachineError } from '@jewel998/state-machine';

try {
  // State machine operations
} catch (error) {
  if (error instanceof StateMachineError) {
    console.log('State machine error:', error.message);
    console.log('Error code:', error.code);
  }
}
```

### InvalidStateError

Thrown when trying to use an invalid or undefined state:

```typescript showLineNumbers
import { StateMachine, InvalidStateError } from '@jewel998/state-machine';

const machine = StateMachine.definitionBuilder()
  .initialState('IDLE')
  .state('IDLE')
  .state('PROCESSING')
  .buildDefinition();

try {
  // This will throw InvalidStateError
  const result = machine.processEvent('INVALID_STATE', 'start', context);
} catch (error) {
  if (error instanceof InvalidStateError) {
    console.log('Invalid state:', error.currentState);
    console.log('Valid states:', error.validStates);
  }
}
```

### InvalidTransitionError

Thrown when attempting an invalid transition:

```typescript showLineNumbers
import { InvalidTransitionError } from '@jewel998/state-machine';

try {
  // Trying to transition from IDLE to COMPLETE without going through PROCESSING
  const result = machine.processEvent('IDLE', 'complete', context);
} catch (error) {
  if (error instanceof InvalidTransitionError) {
    console.log('Invalid transition from:', error.fromState);
    console.log('Event:', error.event);
    console.log('Available events:', error.availableEvents);
  }
}
```

### GuardConditionError

Thrown when guard conditions fail:

```typescript showLineNumbers
import { GuardConditionError } from '@jewel998/state-machine';

const machine = StateMachine.definitionBuilder()
  .initialState('IDLE')
  .state('IDLE')
  .state('PROCESSING')
  .transition('IDLE', 'PROCESSING', 'start')
  .guard((context) => context.hasPermission)
  .buildDefinition();

try {
  const result = machine.processEvent('IDLE', 'start', { hasPermission: false });
} catch (error) {
  if (error instanceof GuardConditionError) {
    console.log('Guard failed for transition:', error.fromState, '->', error.toState);
    console.log('Event:', error.event);
  }
}
```

### ActionExecutionError

Thrown when actions fail during execution:

```typescript showLineNumbers
import { ActionExecutionError } from '@jewel998/state-machine';

const machine = StateMachine.definitionBuilder()
  .initialState('IDLE')
  .state('IDLE')
  .state('PROCESSING')
  .transition('IDLE', 'PROCESSING', 'start')
  .action((context) => {
    throw new Error('Database connection failed');
  })
  .buildDefinition();

try {
  const result = machine.processEvent('IDLE', 'start', context);
} catch (error) {
  if (error instanceof ActionExecutionError) {
    console.log('Action failed in state:', error.state);
    console.log('Original error:', error.originalError);
    console.log('Action type:', error.actionType); // 'transition', 'entry', or 'exit'
  }
}
```

## Error Handling Strategies

### Safe Processing with Boolean Returns

Use the standard `processEvent` method for safe processing that returns boolean success:

```typescript showLineNumbers
const machine = StateMachine.definitionBuilder()
  .initialState('IDLE')
  .state('IDLE')
  .state('PROCESSING')
  .transition('IDLE', 'PROCESSING', 'start')
  .guard((context) => context.isValid)
  .buildDefinition();

// Safe processing - returns false on failure
const success = machine.processEvent('IDLE', 'start', context);
if (!success) {
  console.log('Transition failed - check conditions');
  console.log('Available events:', machine.getAvailableEvents('IDLE', context));
}
```

### Strict Processing with Exceptions

Use `processEventStrict` when you want exceptions for better error handling:

```typescript showLineNumbers
try {
  const result = machine.processEventStrict('IDLE', 'start', context);
  console.log('Transition successful:', result.newState);
} catch (error) {
  if (error instanceof GuardConditionError) {
    console.log('Guard condition failed');
  } else if (error instanceof InvalidTransitionError) {
    console.log('Invalid transition attempted');
  } else if (error instanceof ActionExecutionError) {
    console.log('Action execution failed');
  }
}
```

### Async Error Handling

Async operations provide detailed error information:

```typescript showLineNumbers
try {
  const result = await machine.processEventAsync('IDLE', 'start', context);
  if (result.success) {
    console.log('Transition successful');
  } else {
    console.log('Transition failed:', result.error?.message);
    if (result.rollbackExecuted) {
      console.log('Rollback was executed');
    }
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

## Middleware Error Handling

Middleware can handle errors at different levels:

### Middleware-Level Error Handling

```typescript showLineNumbers
import { BaseMiddleware } from '@jewel998/state-machine';

class ErrorHandlingMiddleware extends BaseMiddleware<Context, State> {
  constructor() {
    super('error-handling', { priority: -1000 });
  }

  async onAction(context, next, originalAction) {
    try {
      return await next();
    } catch (error) {
      console.error('Action failed:', error.message);

      // Option 1: Stop pipeline and return error state
      return this.createResult(
        context.currentContext,
        false, // Stop pipeline
        {
          error: error.message,
          recovered: false,
          timestamp: Date.now(),
        }
      );
    }
  }

  async onError(error, context) {
    // Global error handler for this middleware
    console.error(`${this.name} middleware error:`, error);

    // Log to external service
    await this.logError(error, context);
  }

  private async logError(error: Error, context: any) {
    // Send to logging service
    try {
      await fetch('/api/errors', {
        method: 'POST',
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          context: context.currentContext,
          timestamp: Date.now(),
        }),
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }
}
```

### Error Recovery Middleware

```typescript showLineNumbers
class ErrorRecoveryMiddleware extends BaseMiddleware<Context, State> {
  constructor() {
    super('error-recovery', { priority: 500 });
  }

  async onAction(context, next, originalAction) {
    try {
      return await next();
    } catch (error) {
      // Attempt recovery based on error type
      if (this.canRecover(error)) {
        console.log('Attempting error recovery...');

        const recoveredContext = await this.recoverFromError(context.currentContext, error);

        return this.createResult(
          recoveredContext,
          true, // Continue pipeline
          {
            recovered: true,
            originalError: error.message,
            recoveryStrategy: this.getRecoveryStrategy(error),
          }
        );
      }

      // Re-throw if can't recover
      throw error;
    }
  }

  private canRecover(error: Error): boolean {
    // Define recoverable error conditions
    return (
      error.message.includes('timeout') ||
      error.message.includes('network') ||
      error.message.includes('temporary')
    );
  }

  private async recoverFromError(context: any, error: Error): Promise<any> {
    if (error.message.includes('timeout')) {
      // Retry with exponential backoff
      return { ...context, retryCount: (context.retryCount || 0) + 1 };
    }

    if (error.message.includes('network')) {
      // Switch to offline mode
      return { ...context, offlineMode: true };
    }

    // Default recovery
    return { ...context, errorRecovered: true };
  }

  private getRecoveryStrategy(error: Error): string {
    if (error.message.includes('timeout')) return 'retry';
    if (error.message.includes('network')) return 'offline-mode';
    return 'default';
  }
}
```

## Transaction Rollback

For database operations, use transactions with automatic rollback:

```typescript showLineNumbers
const orderMachine = StateMachine.definitionBuilder()
  .initialState('DRAFT')
  .state('DRAFT')
  .state('CONFIRMED')
  .state('FAILED')

  .transition('DRAFT', 'CONFIRMED', 'confirm')
  .transaction(
    // Main transaction
    async (context) => {
      await database.createOrder(context.order);
      await database.reserveInventory(context.items);
      await paymentService.charge(context.payment);
    },
    // Rollback function
    async (context, error) => {
      console.log('Transaction failed, rolling back:', error.message);

      try {
        await paymentService.refund(context.payment);
        await database.releaseInventory(context.items);
        await database.deleteOrder(context.order.id);
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
        // Log critical error for manual intervention
        await criticalErrorLogger.log({
          type: 'rollback_failure',
          originalError: error,
          rollbackError,
          context,
        });
      }
    }
  )

  .buildDefinition();

// Use async processing for transactions
try {
  const result = await orderMachine.processEventAsync('DRAFT', 'confirm', context);

  if (result.success) {
    console.log('Order confirmed successfully');
  } else {
    console.log('Order confirmation failed');
    if (result.rollbackExecuted) {
      console.log('All changes have been rolled back');
    }
  }
} catch (error) {
  console.error('Critical error during order processing:', error);
}
```

## Error Logging and Monitoring

### Structured Error Logging

```typescript showLineNumbers
class LoggingMiddleware extends BaseMiddleware<Context, State> {
  constructor(private logger: Logger) {
    super('logging', { priority: 1000 });
  }

  async onError(error, context) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.constructor.name,
        message: error.message,
        stack: error.stack,
      },
      context: {
        pipelineId: context.pipelineId,
        executionOrder: context.executionOrder,
        originalContext: context.originalContext,
        currentContext: context.currentContext,
      },
      middleware: this.name,
    };

    // Log to different levels based on error type
    if (error instanceof GuardConditionError) {
      this.logger.warn('Guard condition failed', errorInfo);
    } else if (error instanceof ActionExecutionError) {
      this.logger.error('Action execution failed', errorInfo);
    } else {
      this.logger.error('Unexpected error', errorInfo);
    }

    // Send to monitoring service
    await this.sendToMonitoring(errorInfo);
  }

  private async sendToMonitoring(errorInfo: any) {
    try {
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorInfo),
      });
    } catch (monitoringError) {
      console.error('Failed to send error to monitoring:', monitoringError);
    }
  }
}
```

### Error Metrics Collection

```typescript showLineNumbers
class MetricsMiddleware extends BaseMiddleware<Context, State> {
  private errorCounts = new Map<string, number>();
  private lastErrors = new Map<string, Date>();

  async onError(error, context) {
    const errorType = error.constructor.name;

    // Update error counts
    this.errorCounts.set(errorType, (this.errorCounts.get(errorType) || 0) + 1);
    this.lastErrors.set(errorType, new Date());

    // Check for error rate thresholds
    if (this.shouldAlert(errorType)) {
      await this.sendAlert(errorType, context);
    }
  }

  private shouldAlert(errorType: string): boolean {
    const count = this.errorCounts.get(errorType) || 0;
    const lastError = this.lastErrors.get(errorType);

    // Alert if more than 10 errors in the last 5 minutes
    if (count > 10 && lastError) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return lastError > fiveMinutesAgo;
    }

    return false;
  }

  private async sendAlert(errorType: string, context: any) {
    const alert = {
      type: 'high_error_rate',
      errorType,
      count: this.errorCounts.get(errorType),
      timestamp: new Date().toISOString(),
      context: context.pipelineId,
    };

    await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert),
    });
  }
}
```

## Best Practices

### 1. Use Appropriate Error Handling Strategy

```typescript showLineNumbers
// For user-facing operations - use safe processing
const userAction = machine.processEvent(currentState, userEvent, context);
if (!userAction) {
  showUserMessage('Action not available right now');
}

// For critical operations - use strict processing
try {
  machine.processEventStrict(currentState, criticalEvent, context);
} catch (error) {
  handleCriticalError(error);
}

// For async operations - use async processing
const result = await machine.processEventAsync(currentState, event, context);
if (!result.success) {
  handleAsyncError(result.error);
}
```

### 2. Implement Graceful Degradation

```typescript showLineNumbers
class GracefulDegradationMiddleware extends BaseMiddleware<Context, State> {
  async onAction(context, next, originalAction) {
    try {
      return await next();
    } catch (error) {
      // Provide fallback functionality
      return this.createResult(this.createFallbackContext(context.currentContext, error), true, {
        degraded: true,
        fallbackReason: error.message,
      });
    }
  }

  private createFallbackContext(context: any, error: Error): any {
    return {
      ...context,
      mode: 'degraded',
      features: context.features.filter((f) => f.essential),
      error: error.message,
    };
  }
}
```

### 3. Validate Early and Often

```typescript showLineNumbers
class ValidationMiddleware extends BaseMiddleware<Context, State> {
  constructor() {
    super('validation', { priority: -500 });
  }

  async onGuard(context, next, originalGuard) {
    // Validate context before any processing
    const validationErrors = this.validateContext(context.currentContext);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    return await next();
  }

  private validateContext(context: any): string[] {
    const errors: string[] = [];

    if (!context.userId) errors.push('userId is required');
    if (!context.sessionId) errors.push('sessionId is required');
    if (context.amount && context.amount < 0) errors.push('amount must be positive');

    return errors;
  }
}
```

### 4. Monitor Error Patterns

```typescript showLineNumbers
// Set up error monitoring
const errorMonitor = new ErrorMonitoringMiddleware({
  alertThreshold: 10,
  timeWindow: 300000, // 5 minutes
  criticalErrors: [ActionExecutionError, 'DatabaseError'],
  onAlert: async (alert) => {
    await notificationService.sendAlert(alert);
  },
});

machine.addMiddleware(errorMonitor);
```

## Testing Error Scenarios

### Unit Testing Error Conditions

```typescript showLineNumbers
describe('Error Handling', () => {
  it('should handle guard failures gracefully', () => {
    const machine = StateMachine.definitionBuilder()
      .initialState('IDLE')
      .state('IDLE')
      .state('PROCESSING')
      .transition('IDLE', 'PROCESSING', 'start')
      .guard(() => false) // Always fails
      .buildDefinition();

    const success = machine.processEvent('IDLE', 'start', {});
    expect(success).toBe(false);
  });

  it('should throw GuardConditionError in strict mode', () => {
    const machine = StateMachine.definitionBuilder()
      .initialState('IDLE')
      .state('IDLE')
      .state('PROCESSING')
      .transition('IDLE', 'PROCESSING', 'start')
      .guard(() => false)
      .buildDefinition();

    expect(() => {
      machine.processEventStrict('IDLE', 'start', {});
    }).toThrow(GuardConditionError);
  });

  it('should handle action failures with rollback', async () => {
    const rollbackCalled = jest.fn();

    const machine = StateMachine.definitionBuilder()
      .initialState('IDLE')
      .state('IDLE')
      .state('PROCESSING')
      .transition('IDLE', 'PROCESSING', 'start')
      .transaction(async () => {
        throw new Error('Action failed');
      }, rollbackCalled)
      .buildDefinition();

    const result = await machine.processEventAsync('IDLE', 'start', {});

    expect(result.success).toBe(false);
    expect(result.rollbackExecuted).toBe(true);
    expect(rollbackCalled).toHaveBeenCalled();
  });
});
```

## Next Steps

- [Middleware System](middleware-system) - Learn about middleware error handling
- [Architecture Overview](../architecture) - Understand the error handling architecture
- [Testing](testing) - Test error scenarios effectively
