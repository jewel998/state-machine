---
title: Custom Middleware
description:
  Learn to create custom middleware for state machines including BaseMiddleware implementation,
  hooks system, async middleware patterns, and real-world examples for logging, analytics, and
  persistence.
keywords:
  [
    custom middleware,
    BaseMiddleware,
    middleware development,
    hooks system,
    async middleware,
    logging middleware,
    analytics,
    persistence,
    state machine extensions,
    middleware patterns,
  ]
sidebar_position: 6
---

# Creating Custom Middleware

This guide provides comprehensive instructions for creating custom middleware to extend your state
machine functionality. Learn patterns, best practices, and real-world examples.

## Middleware Architecture

Custom middleware in the state machine library follows a pipeline pattern where each middleware can:

- **Intercept and modify** guard conditions, actions, and state transitions
- **Add metadata** and context information
- **Control pipeline flow** by continuing or stopping execution
- **Handle errors** and implement recovery strategies
- **Perform side effects** like logging, metrics, and notifications

## BaseMiddleware Class (Recommended)

The easiest way to create custom middleware is by extending the `BaseMiddleware` class:

### Basic Structure

```typescript showLineNumbers
import {
  BaseMiddleware,
  StateMachineMiddlewareContext,
  MiddlewareResult,
} from '@jewel998/state-machine';

class MyCustomMiddleware extends BaseMiddleware<Context, State> {
  constructor() {
    super('my-custom-middleware', {
      priority: 0, // Execution order (lower = earlier)
      enabled: true, // Can be disabled
    });
  }

  // Override only the hooks you need
  async onGuard(context, next, originalGuard) {
    // Pre-guard logic
    console.log('Before guard execution');

    // Continue to next middleware or original guard
    const result = await next();

    // Post-guard logic
    console.log('After guard execution:', result);
    return result;
  }

  async onAction(context, next, originalAction) {
    // Pre-action logic
    const startTime = Date.now();

    // Continue pipeline
    const result = await next();

    // Post-action logic
    const duration = Date.now() - startTime;

    return this.createResult(
      result.context,
      result.shouldContinue,
      this.mergeMetadata(result.metadata || {}, {
        executionTime: duration,
        processedBy: this.name,
      })
    );
  }

  async onStateEntry(context, next, state, originalAction) {
    console.log(`Entering state: ${String(state)}`);
    return await next();
  }

  async onStateExit(context, next, state, originalAction) {
    console.log(`Exiting state: ${String(state)}`);
    return await next();
  }

  // Lifecycle hooks
  async onBeforePipeline(context) {
    console.log(`Pipeline ${context.pipelineId} starting`);
  }

  async onAfterPipeline(context, result) {
    console.log(`Pipeline ${context.pipelineId} completed`);
  }

  async onError(error, context) {
    console.error(`${this.name} middleware error:`, error);
    // Handle or re-throw as needed
  }
}
```

### Available Hooks

| Hook               | Purpose                       | When Called                          |
| ------------------ | ----------------------------- | ------------------------------------ |
| `onGuard`          | Intercept guard conditions    | Before/after guard evaluation        |
| `onAction`         | Intercept transition actions  | Before/after action execution        |
| `onStateEntry`     | Intercept state entry actions | When entering a state                |
| `onStateExit`      | Intercept state exit actions  | When leaving a state                 |
| `onBeforePipeline` | Pipeline initialization       | Start of pipeline execution          |
| `onAfterPipeline`  | Pipeline cleanup              | End of pipeline execution            |
| `onError`          | Error handling                | When errors occur in this middleware |

## Real-World Middleware Examples

### 1. Authentication Middleware

```typescript showLineNumbers
interface AuthContext {
  user?: { id: string; role: string; permissions: string[] };
  sessionId?: string;
  authToken?: string;
}

class AuthenticationMiddleware extends BaseMiddleware<AuthContext, State> {
  constructor(private authService: AuthService) {
    super('authentication', { priority: -1000 }); // Run first
  }

  async onGuard(context, next, originalGuard) {
    // Verify authentication before any guard checks
    if (!context.currentContext.user) {
      const user = await this.authService.getCurrentUser(context.currentContext.authToken);

      if (!user) {
        console.log('Authentication failed: No valid user');
        return false; // Stop pipeline
      }

      // Add user to context for subsequent middleware
      context.currentContext.user = user;
    }

    return await next();
  }

  async onAction(context, next, originalAction) {
    // Log authenticated actions for audit
    const user = context.currentContext.user;
    if (user) {
      console.log(`User ${user.id} (${user.role}) performing action`);
    }

    const result = await next();

    return this.createResult(
      result.context,
      result.shouldContinue,
      this.mergeMetadata(result.metadata || {}, {
        authenticatedUser: user?.id,
        userRole: user?.role,
        timestamp: new Date().toISOString(),
      })
    );
  }

  async onError(error, context) {
    // Log authentication-related errors
    const user = context.currentContext.user;
    await this.authService.logSecurityEvent({
      type: 'middleware_error',
      userId: user?.id,
      error: error.message,
      context: context.pipelineId,
    });
  }
}
```

### 2. Validation Middleware

```typescript showLineNumbers
interface ValidationRule<T> {
  field: keyof T;
  validator: (value: any) => boolean | string;
  message?: string;
}

class ValidationMiddleware<TContext> extends BaseMiddleware<TContext, State> {
  constructor(private rules: ValidationRule<TContext>[]) {
    super('validation', { priority: -500 }); // Run early
  }

  async onGuard(context, next, originalGuard) {
    // Validate context before guard execution
    const errors = this.validateContext(context.currentContext);

    if (errors.length > 0) {
      console.log('Validation failed:', errors);
      return false; // Stop pipeline
    }

    return await next();
  }

  async onAction(context, next, originalAction) {
    // Re-validate before action execution
    const errors = this.validateContext(context.currentContext);

    if (errors.length > 0) {
      return this.createResult(
        context.currentContext,
        false, // Stop pipeline
        {
          validationErrors: errors,
          validated: false,
        }
      );
    }

    const result = await next();

    return this.createResult(
      result.context,
      result.shouldContinue,
      this.mergeMetadata(result.metadata || {}, {
        validated: true,
        validationRules: this.rules.length,
      })
    );
  }

  private validateContext(context: TContext): string[] {
    const errors: string[] = [];

    for (const rule of this.rules) {
      const value = context[rule.field];
      const result = rule.validator(value);

      if (result === false) {
        errors.push(rule.message || `Validation failed for ${String(rule.field)}`);
      } else if (typeof result === 'string') {
        errors.push(result);
      }
    }

    return errors;
  }
}

// Usage
const validationMiddleware = new ValidationMiddleware([
  {
    field: 'email',
    validator: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    message: 'Invalid email format',
  },
  {
    field: 'amount',
    validator: (amount) => amount > 0 && amount <= 10000,
    message: 'Amount must be between 0 and 10000',
  },
]);
```

### 3. Rate Limiting Middleware

```typescript showLineNumbers
interface RateLimitContext {
  user?: { id: string };
  clientId?: string;
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
    limited: boolean;
  };
}

class RateLimitMiddleware extends BaseMiddleware<RateLimitContext, State> {
  private requests = new Map<string, number[]>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 100, windowMs = 60000) {
    // 100 requests per minute
    super('rate-limit', { priority: -800 });
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async onAction(context, next, originalAction) {
    const identifier = this.getIdentifier(context.currentContext);

    if (!identifier) {
      // No identifier, allow through
      return await next();
    }

    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Clean old requests outside the time window
    const validRequests = userRequests.filter((time) => now - time < this.windowMs);

    // Check rate limit
    if (validRequests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...validRequests);
      const resetTime = oldestRequest + this.windowMs;

      console.log(`Rate limit exceeded for ${identifier}`);

      // Add rate limit info to context
      context.currentContext.rateLimitInfo = {
        remaining: 0,
        resetTime,
        limited: true,
      };

      return this.createResult(
        context.currentContext,
        false, // Stop pipeline
        {
          rateLimited: true,
          retryAfter: resetTime - now,
          identifier,
        }
      );
    }

    // Record this request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    // Add rate limit info to context
    context.currentContext.rateLimitInfo = {
      remaining: this.maxRequests - validRequests.length,
      resetTime: now + this.windowMs,
      limited: false,
    };

    const result = await next();

    return this.createResult(
      result.context,
      result.shouldContinue,
      this.mergeMetadata(result.metadata || {}, {
        rateLimitChecked: true,
        requestsRemaining: this.maxRequests - validRequests.length,
      })
    );
  }

  private getIdentifier(context: RateLimitContext): string | null {
    return context.user?.id || context.clientId || null;
  }

  // Cleanup old entries periodically
  async onBeforePipeline(context) {
    const now = Date.now();

    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter((time) => now - time < this.windowMs);

      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }
}
```

### 4. Caching Middleware

```typescript showLineNumbers
interface CacheContext {
  cacheKey?: string;
  cacheInfo?: {
    hit: boolean;
    key: string;
    timestamp: number;
    ttl: number;
  };
}

class CacheMiddleware extends BaseMiddleware<CacheContext, State> {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  constructor(private defaultTtl = 300000) {
    // 5 minutes default
    super('cache', { priority: -600 });
  }

  async onAction(context, next, originalAction) {
    const cacheKey = this.getCacheKey(context.currentContext);

    if (!cacheKey) {
      // No cache key, execute normally
      return await next();
    }

    // Check cache
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < cached.ttl) {
      console.log(`Cache hit for key: ${cacheKey}`);

      // Return cached result
      const cachedContext = {
        ...context.currentContext,
        ...cached.data,
        cacheInfo: {
          hit: true,
          key: cacheKey,
          timestamp: cached.timestamp,
          ttl: cached.ttl,
        },
      };

      return this.createResult(cachedContext, true, {
        fromCache: true,
        cacheKey,
        cacheAge: now - cached.timestamp,
      });
    }

    console.log(`Cache miss for key: ${cacheKey}`);

    // Execute pipeline
    const result = await next();

    // Cache the result
    const ttl = this.getTtl(context.currentContext);
    this.cache.set(cacheKey, {
      data: result.context,
      timestamp: now,
      ttl,
    });

    // Add cache info to result
    result.context.cacheInfo = {
      hit: false,
      key: cacheKey,
      timestamp: now,
      ttl,
    };

    return this.createResult(
      result.context,
      result.shouldContinue,
      this.mergeMetadata(result.metadata || {}, {
        cached: true,
        cacheKey,
        cacheSize: this.cache.size,
      })
    );
  }

  private getCacheKey(context: CacheContext): string | null {
    if (context.cacheKey) {
      return context.cacheKey;
    }

    // Generate cache key from context
    const keyParts = [];
    if ('userId' in context) keyParts.push(`user:${(context as any).userId}`);
    if ('action' in context) keyParts.push(`action:${(context as any).action}`);

    return keyParts.length > 0 ? keyParts.join(':') : null;
  }

  private getTtl(context: CacheContext): number {
    // Allow context to specify TTL
    return (context as any).cacheTtl || this.defaultTtl;
  }

  // Cleanup expired entries
  async onBeforePipeline(context) {
    const now = Date.now();

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }
  }
}
```

### 5. Metrics and Monitoring Middleware

```typescript showLineNumbers
interface MetricsContext {
  operationId?: string;
  metrics?: {
    startTime: number;
    endTime?: number;
    duration?: number;
    success: boolean;
  };
}

class MetricsMiddleware extends BaseMiddleware<MetricsContext, State> {
  private metrics = {
    counters: new Map<string, number>(),
    timers: new Map<string, number[]>(),
    errors: new Map<string, number>(),
  };

  constructor(private metricsCollector?: MetricsCollector) {
    super('metrics', { priority: 1000 }); // Run last
  }

  async onBeforePipeline(context) {
    // Start timing
    context.currentContext.metrics = {
      startTime: Date.now(),
      success: false,
    };

    // Generate operation ID if not provided
    if (!context.currentContext.operationId) {
      context.currentContext.operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  async onAction(context, next, originalAction) {
    const operationType = this.getOperationType(context);

    // Increment counter
    this.incrementCounter(`action.${operationType}`);

    const startTime = Date.now();

    try {
      const result = await next();

      const duration = Date.now() - startTime;
      this.recordTiming(`action.${operationType}.duration`, duration);

      // Mark as successful
      if (context.currentContext.metrics) {
        context.currentContext.metrics.success = true;
      }

      return this.createResult(
        result.context,
        result.shouldContinue,
        this.mergeMetadata(result.metadata || {}, {
          operationType,
          actionDuration: duration,
          metricsRecorded: true,
        })
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      this.incrementCounter(`action.${operationType}.error`);
      this.recordTiming(`action.${operationType}.error_duration`, duration);

      throw error;
    }
  }

  async onAfterPipeline(context, result) {
    const metrics = context.currentContext.metrics;
    if (!metrics) return;

    // Calculate total duration
    metrics.endTime = Date.now();
    metrics.duration = metrics.endTime - metrics.startTime;

    // Record pipeline metrics
    this.recordTiming('pipeline.total_duration', metrics.duration);
    this.incrementCounter(metrics.success ? 'pipeline.success' : 'pipeline.failure');

    // Send to external metrics collector
    if (this.metricsCollector) {
      await this.metricsCollector.record({
        operationId: context.currentContext.operationId,
        pipelineId: context.pipelineId,
        duration: metrics.duration,
        success: metrics.success,
        metadata: result.metadata,
      });
    }
  }

  async onError(error, context) {
    const operationType = this.getOperationType(context);
    this.incrementCounter(`error.${operationType}`);
    this.incrementCounter(`error.${error.constructor.name}`);

    // Log error metrics
    console.error(`Metrics middleware recorded error:`, {
      operationType,
      errorType: error.constructor.name,
      pipelineId: context.pipelineId,
    });
  }

  private getOperationType(context: any): string {
    // Determine operation type from context
    if (context.currentContext.action) return context.currentContext.action;
    if (context.currentContext.event) return context.currentContext.event;
    return 'unknown';
  }

  private incrementCounter(key: string): void {
    this.metrics.counters.set(key, (this.metrics.counters.get(key) || 0) + 1);
  }

  private recordTiming(key: string, duration: number): void {
    const timings = this.metrics.timers.get(key) || [];
    timings.push(duration);
    this.metrics.timers.set(key, timings);
  }

  // Get metrics summary
  public getMetrics() {
    const summary: any = {
      counters: Object.fromEntries(this.metrics.counters),
      timers: {},
    };

    // Calculate timing statistics
    for (const [key, timings] of this.metrics.timers) {
      summary.timers[key] = {
        count: timings.length,
        min: Math.min(...timings),
        max: Math.max(...timings),
        avg: timings.reduce((a, b) => a + b, 0) / timings.length,
        p95: this.percentile(timings, 0.95),
        p99: this.percentile(timings, 0.99),
      };
    }

    return summary;
  }

  private percentile(values: number[], p: number): number {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index] || 0;
  }
}
```

## Configuration-Based Middleware

For simpler use cases, you can create middleware using the configuration approach:

```typescript showLineNumbers
import { MiddlewareConfig } from '@jewel998/state-machine';

const loggingMiddleware: MiddlewareConfig<Context, State> = {
  name: 'logging',
  priority: 100,
  enabled: true,

  actionMiddleware: async (context, next, originalAction) => {
    console.log(`Action starting for pipeline ${context.pipelineId}`);

    const startTime = Date.now();
    const result = await next();
    const duration = Date.now() - startTime;

    console.log(`Action completed in ${duration}ms`);

    return {
      context: result.context,
      shouldContinue: result.shouldContinue,
      metadata: {
        ...result.metadata,
        logged: true,
        executionTime: duration,
      },
    };
  },

  guardMiddleware: async (context, next, originalGuard) => {
    console.log('Guard evaluation starting');
    const result = await next();
    console.log('Guard evaluation result:', result);
    return result;
  },
};
```

## Advanced Patterns

### Conditional Middleware

```typescript showLineNumbers
class ConditionalMiddleware extends BaseMiddleware<Context, State> {
  constructor(private condition: (context: Context) => boolean) {
    super('conditional', { priority: 0 });
  }

  async onAction(context, next, originalAction) {
    // Only apply middleware logic if condition is met
    if (!this.condition(context.currentContext)) {
      return await next();
    }

    // Apply middleware logic
    console.log('Conditional middleware activated');
    return await next();
  }
}

// Usage
const devOnlyMiddleware = new ConditionalMiddleware(
  (context) => process.env.NODE_ENV === 'development'
);
```

### Composable Middleware

```typescript showLineNumbers
class ComposableMiddleware extends BaseMiddleware<Context, State> {
  constructor(
    name: string,
    private middlewares: BaseMiddleware<Context, State>[]
  ) {
    super(name, { priority: 0 });
  }

  async onAction(context, next, originalAction) {
    // Execute composed middlewares in sequence
    let currentNext = next;

    // Build chain in reverse order
    for (let i = this.middlewares.length - 1; i >= 0; i--) {
      const middleware = this.middlewares[i];
      const nextFn = currentNext;

      currentNext = async () => {
        return await middleware.onAction!(context, nextFn, originalAction);
      };
    }

    return await currentNext();
  }
}

// Usage
const composedMiddleware = new ComposableMiddleware('composed', [
  new AuthenticationMiddleware(authService),
  new ValidationMiddleware(validationRules),
  new LoggingMiddleware(),
]);
```

## Testing Custom Middleware

```typescript showLineNumbers
describe('Custom Middleware', () => {
  let middleware: MyCustomMiddleware;
  let mockNext: jest.Mock;
  let context: StateMachineMiddlewareContext<TestContext>;

  beforeEach(() => {
    middleware = new MyCustomMiddleware();
    mockNext = jest.fn();
    context = {
      originalContext: { value: 'original' },
      currentContext: { value: 'current' },
      metadata: {},
      pipelineId: 'test-pipeline',
      executionOrder: 0,
      previousResults: [],
    };
  });

  it('should process action correctly', async () => {
    mockNext.mockResolvedValue({
      context: { value: 'processed' },
      shouldContinue: true,
      metadata: {},
    });

    const result = await middleware.onAction(context, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(result.shouldContinue).toBe(true);
    expect(result.metadata).toEqual(
      expect.objectContaining({ processedBy: 'my-custom-middleware' })
    );
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Test error');
    mockNext.mockRejectedValue(error);

    await expect(middleware.onAction(context, mockNext)).rejects.toThrow('Test error');
  });
});
```

## Best Practices

### 1. Single Responsibility

Each middleware should have a single, well-defined purpose:

```typescript showLineNumbers
// ✅ Good - focused on authentication only
class AuthMiddleware extends BaseMiddleware<Context, State> {
  // Only handles authentication logic
}

// ❌ Poor - handles multiple concerns
class MegaMiddleware extends BaseMiddleware<Context, State> {
  // Handles auth, validation, logging, metrics, caching...
}
```

### 2. Proper Priority Management

```typescript showLineNumbers
// System middleware (run first)
const authMiddleware = new AuthMiddleware(); // priority: -1000
const validationMiddleware = new ValidationMiddleware(); // priority: -500

// Business middleware (run in middle)
const businessLogicMiddleware = new BusinessLogicMiddleware(); // priority: 0

// Observability middleware (run last)
const loggingMiddleware = new LoggingMiddleware(); // priority: 500
const metricsMiddleware = new MetricsMiddleware(); // priority: 1000
```

### 3. Error Handling

```typescript showLineNumbers
class RobustMiddleware extends BaseMiddleware<Context, State> {
  async onAction(context, next, originalAction) {
    try {
      return await next();
    } catch (error) {
      // Log error
      console.error(`${this.name} middleware error:`, error);

      // Decide whether to recover or re-throw
      if (this.canRecover(error)) {
        return this.createRecoveryResult(context, error);
      }

      throw error;
    }
  }

  async onError(error, context) {
    // Global error handler for this middleware
    await this.logError(error, context);
  }
}
```

### 4. Performance Considerations

```typescript showLineNumbers
class PerformantMiddleware extends BaseMiddleware<Context, State> {
  private cache = new Map();

  async onAction(context, next, originalAction) {
    // Use caching for expensive operations
    const cacheKey = this.getCacheKey(context);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = await next();

    // Cache result if appropriate
    if (this.shouldCache(result)) {
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  // Cleanup cache periodically
  async onBeforePipeline(context) {
    if (this.cache.size > 1000) {
      this.cache.clear();
    }
  }
}
```

## Next Steps

- [Middleware System](middleware-system) - Learn about the complete middleware system
- [Error Handling](error-handling) - Handle errors in custom middleware
- [Testing](testing) - Test your custom middleware thoroughly
