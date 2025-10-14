---
title: Middleware Pipeline
description:
  Complete guide to the middleware pipeline system featuring BaseMiddleware class, immutability
  providers (Immer, Immutable.js), custom middleware creation, and real-world examples for
  authentication, caching, and logging.
keywords:
  [
    middleware pipeline,
    BaseMiddleware,
    immutability,
    Immer middleware,
    custom middleware,
    authentication middleware,
    caching,
    logging,
    pipeline hooks,
    async middleware,
    state machine extensions,
  ]
sidebar_position: 3
---

# Middleware Pipeline System

The middleware system provides a powerful way to extend state machine functionality with
cross-cutting concerns like immutability, logging, validation, and more. The system implements a
**middleware pipeline pattern** specifically designed for state machines, providing robust
functionality, excellent type safety, and clean architecture.

## Overview

The enhanced middleware system operates on a state machine middleware pipeline pattern where
multiple middleware can be composed together in priority order. Each middleware can:

- **Intercept guard conditions** before they execute
- **Wrap actions** with additional functionality
- **Process state entry/exit** actions
- **Modify context** during transitions
- **Add metadata** to operations
- **Control pipeline execution** by stopping or continuing to the next middleware
- **Access pipeline information** like execution order and previous results

### Key Features

- **Complete Pipeline Implementation**: Fully implemented `executeActionPipeline`,
  `executeEntryPipeline`, and `executeExitPipeline` methods
- **BaseMiddleware Class**: Abstract base class for easy custom middleware creation with lifecycle
  hooks
- **State Machine Pipeline Pattern**: Middleware can call `next()` to continue the pipeline or stop
  execution
- **Priority-based Execution**: Middleware executes in priority order (lower numbers first)
- **Type Safety**: Full TypeScript support with proper generic constraints and type safety
- **Flexible Configuration**: Support for both class-based and configuration-based middleware
- **Lifecycle Hooks**: Pipeline hooks (`onBeforePipeline`, `onAfterPipeline`) and chain hooks
  (`onBeforeChain`, `onAfterChain`)
- **Context Passing**: Rich context passing through middleware pipeline with execution order
  tracking
- **Error Handling**: Comprehensive error handling with proper error propagation and recovery

## Quick Start

```typescript showLineNumbers
import { StateMachine, BaseMiddleware } from '@jewel998/state-machine';

interface AppContext {
  user: { id: string; name: string };
  data: any[];
  amount: number;
  timestamp?: number;
}

type AppState = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';
type AppEvent = 'fetch' | 'success' | 'error' | 'reset';

// Custom middleware extending BaseMiddleware (recommended approach)
class AuthMiddleware extends BaseMiddleware<AppContext, AppState> {
  constructor() {
    super('auth', { priority: -200 }); // Run first
  }

  async onGuard(context, next, originalGuard) {
    if (!context.currentContext.user?.id) {
      return false; // Stop pipeline execution
    }
    return await next(); // Continue to next middleware
  }

  async onAction(context, next, originalAction) {
    console.log(`User ${context.currentContext.user.id} performing action`);
    const result = await next();

    return this.createResult(result.context, result.shouldContinue, { authenticated: true });
  }
}

class LoggingMiddleware extends BaseMiddleware<AppContext, AppState> {
  constructor() {
    super('logging', { priority: 100 });
  }

  async onAction(context, next, originalAction) {
    const startTime = Date.now();
    console.log('Action starting...');

    const result = await next();

    const duration = Date.now() - startTime;
    console.log(`Action completed in ${duration}ms`);

    return this.createResult(
      result.context,
      result.shouldContinue,
      this.mergeMetadata(result.metadata || {}, {
        executionTime: duration,
      })
    );
  }

  // Legacy chain hooks for backward compatibility
  async onBeforeChain(context) {
    console.log('Pipeline starting');
  }

  async onAfterChain(context, result) {
    console.log('Pipeline completed');
  }
}

// Build state machine with middleware pipeline
const definition = StateMachine.definitionBuilder<AppContext, AppState, AppEvent>()
  .initialState('IDLE')
  .state('IDLE')
  .state('LOADING')
  .state('SUCCESS')
  .state('ERROR')

  .transition('IDLE', 'LOADING', 'fetch')
  .action((context) => {
    context.data.push('loading...');
    context.timestamp = Date.now();
  })

  // Add middleware - they execute in priority order
  .addMiddleware(new AuthMiddleware()) // Priority: -200 (first)
  .addMiddleware(new LoggingMiddleware()) // Priority: 100 (second)

  .buildDefinition();

// Use async methods for full middleware support
const context: AppContext = {
  user: { id: '123', name: 'John' },
  data: [],
  amount: 100,
};

const result = await definition.processEventAsync('IDLE', 'fetch', context);
console.log(result.success); // true
console.log(result.context?.data); // ['loading...']
// Console output:
// "User 123 performing action"
// "Pipeline starting"
// "Action starting..."
// "Action completed in Xms"
// "Pipeline completed"
```

## Immutability Middleware

The library provides built-in immutability middleware with support for multiple providers.

### Native JavaScript Provider

Uses `Object.freeze()` and `structuredClone()` for immutability. This provider uses proper type
templates instead of `any` types for better type safety:

```typescript showLineNumbers
import { createNativeImmutabilityMiddleware } from '@jewel998/state-machine';

const middleware = createNativeImmutabilityMiddleware<Context, State>({
  autoFreeze: true, // Automatically freeze context after actions
  strictMode: false, // Throw errors on immutability violations
});
```

### Immer.js Provider

Integrates with [Immer.js](https://immerjs.github.io/immer/) for advanced immutable updates:

```bash
npm install immer
```

```typescript showLineNumbers
import { createImmerMiddleware } from '@jewel998/state-machine';

const middleware = createImmerMiddleware<Context, State, Event>({
  autoFreeze: true,
  enablePatches: true, // Enable Immer patches for debugging
  strictMode: false,
});

// Use with async transitions for full middleware support
const result = await definition.processEventAsync('IDLE', 'fetch', context);
console.log(result.context); // Immutable context with changes
```

### Immutable.js Provider

Integrates with [Immutable.js](https://immutable-js.com/) data structures:

```bash
npm install immutable
```

```typescript showLineNumbers
import { createImmutableJSMiddleware } from '@jewel998/state-machine';

const middleware = createImmutableJSMiddleware<Context, State, Event>({
  autoFreeze: true,
  strictMode: false,
});
```

### Custom Immutability Provider

Create your own immutability provider:

```typescript showLineNumbers
import { ImmutabilityProvider, ImmutabilityMiddleware } from '@jewel998/state-machine';

class CustomImmutabilityProvider<TContext> implements ImmutabilityProvider<TContext> {
  readonly name = 'custom';

  clone(context: TContext): TContext {
    // Your custom cloning logic
    return JSON.parse(JSON.stringify(context));
  }

  freeze(context: TContext): TContext {
    // Your custom freezing logic
    return Object.freeze(context);
  }

  isImmutable(context: TContext): boolean {
    // Your custom immutability check
    return Object.isFrozen(context);
  }
}

const customProvider = new CustomImmutabilityProvider<Context>();
const middleware = new ImmutabilityMiddleware<Context, State, Event>({
  provider: customProvider,
  autoFreeze: true,
});
```

## Creating Custom Middleware

### Using BaseMiddleware (Recommended)

The easiest way to create custom middleware is by extending the `BaseMiddleware` class. This
provides a clean, type-safe foundation with all the lifecycle hooks:

```typescript showLineNumbers
import {
  BaseMiddleware,
  StateMachineMiddlewareContext,
  MiddlewareResult,
} from '@jewel998/state-machine';

class CustomMiddleware extends BaseMiddleware<Context, State> {
  constructor() {
    super('custom', {
      priority: 0, // Execution order (lower = earlier)
      enabled: true, // Can be disabled
    });
  }

  // Override only the hooks you need
  async onGuard(context, next, originalGuard) {
    console.log('Before guard check');

    // Access pipeline information
    console.log(`Pipeline ID: ${context.pipelineId}`);
    console.log(`Execution order: ${context.executionOrder}`);

    // Call next() to continue the pipeline
    const result = await next();

    console.log('After guard check:', result);
    return result;
  }

  async onAction(context, next, originalAction) {
    console.log('Before action execution');

    // Modify context before continuing
    const startTime = Date.now();
    context.currentContext.timestamp = startTime;

    // Continue the pipeline
    const result = await next();

    console.log('After action execution');

    // Return modified result with metadata
    return this.createResult(
      result.context,
      result.shouldContinue,
      this.mergeMetadata(result.metadata || {}, {
        customProcessed: true,
        executionTime: Date.now() - startTime,
        pipelineId: context.pipelineId,
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

  // New pipeline lifecycle hooks
  async onBeforePipeline(context) {
    console.log('Pipeline starting');
  }

  async onAfterPipeline(context, result) {
    console.log('Pipeline completed');
  }

  // Legacy chain hooks for backward compatibility
  async onBeforeChain(context) {
    console.log('Chain starting (legacy hook)');
  }

  async onAfterChain(context, result) {
    console.log('Chain completed (legacy hook)');
  }

  async onError(error, context) {
    console.error('Middleware error:', error.message);
    // Handle error or re-throw
    throw error;
  }

  // Utility method to conditionally skip middleware
  protected shouldSkip(context: StateMachineMiddlewareContext<Context>): boolean {
    // Skip if disabled or based on context conditions
    return !this.enabled || context.currentContext.skipCustomMiddleware;
  }
}

// Usage
const customMiddleware = new CustomMiddleware();
definition.addMiddleware(customMiddleware);
```

### Advanced Custom Middleware

For more complex scenarios, implement the `IMiddleware` interface directly:

```typescript showLineNumbers
import {
  IMiddleware,
  StateMachineMiddlewareContext,
  MiddlewareResult,
} from '@jewel998/state-machine';

class AdvancedMiddleware implements IMiddleware<Context, State> {
  readonly name = 'advanced';
  readonly priority = 0;
  readonly enabled = true;

  async onAction(context, next, originalAction) {
    // Access pipeline information
    console.log(`Pipeline ID: ${context.pipelineId}`);
    console.log(`Execution order: ${context.executionOrder}`);
    console.log(`Previous results: ${context.previousResults.length}`);

    // Conditional logic based on pipeline state
    if (context.executionOrder === 0) {
      console.log('First middleware in pipeline');
    }

    // Access previous middleware results
    const hasValidation = context.previousResults.some((result) => result.metadata?.validated);

    if (!hasValidation) {
      // Stop pipeline if validation not performed
      return {
        context: context.currentContext,
        shouldContinue: false,
        metadata: { error: 'Validation required' },
      };
    }

    return await next();
  }

  // Optional lifecycle hooks
  async onBeforePipeline(context) {
    console.log('Advanced middleware: pipeline starting');
  }

  async onAfterPipeline(context, result) {
    console.log('Advanced middleware: pipeline completed');
  }

  async onError(error, context) {
    console.error('Advanced middleware error:', error);
    throw error;
  }
}
```

### Configuration-Based Middleware

The system also supports configuration-based middleware for simpler use cases:

```typescript showLineNumbers
import { MiddlewareConfig } from '@jewel998/state-machine';

const configMiddleware: MiddlewareConfig<Context, State> = {
  name: 'config-based',
  priority: 50,
  enabled: true,

  guardMiddleware: async (context, next, originalGuard) => {
    console.log('Config-based guard middleware');
    return await next();
  },

  actionMiddleware: async (context, next, originalAction) => {
    console.log('Config-based action middleware');
    const result = await next();
    return {
      context: result.context,
      shouldContinue: result.shouldContinue,
      metadata: { configProcessed: true },
    };
  },

  entryMiddleware: async (context, next, state, originalAction) => {
    console.log(`Config-based entry middleware for state: ${String(state)}`);
    return await next();
  },

  exitMiddleware: async (context, next, state, originalAction) => {
    console.log(`Config-based exit middleware for state: ${String(state)}`);
    return await next();
  },
};

// Works alongside class-based middleware
definition.addMiddleware(configMiddleware);
```

### Real-World Examples

#### Authentication Middleware

```typescript showLineNumbers
interface AuthContext {
  user?: { id: string; role: string };
  sessionId?: string;
  authToken?: string;
}

class AuthenticationMiddleware extends BaseMiddleware<AuthContext, State> {
  constructor(private authService: AuthService) {
    super('authentication', { priority: -1000 }); // Run first
  }

  async onGuard(context, next, originalGuard) {
    const user = await this.authService.getCurrentUser();

    if (!user) {
      console.log('Authentication failed: No user');
      return false; // Stop pipeline execution
    }

    // Add user to context
    context.currentContext.user = user;

    // Continue to next middleware
    return await next();
  }

  async onAction(context, next, originalAction) {
    // Log user actions for audit
    console.log(`User ${context.currentContext.user?.id} performing action`);

    const result = await next();

    return this.createResult(
      result.context,
      result.shouldContinue,
      this.mergeMetadata(result.metadata || {}, {
        authenticatedUser: context.currentContext.user?.id,
        timestamp: new Date().toISOString(),
        pipelineId: context.pipelineId,
      })
    );
  }

  async onBeforePipeline(context) {
    console.log(`Starting authenticated pipeline: ${context.pipelineId}`);
  }

  async onError(error, context) {
    console.error(`Auth middleware error for user ${context.currentContext.user?.id}:`, error);
    // Don't re-throw - allow pipeline to continue with error metadata
    return;
  }
}
```

#### Rate Limiting Middleware

```typescript showLineNumbers
interface RateLimitContext {
  user?: { id: string };
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
  };
}

class RateLimitMiddleware extends BaseMiddleware<RateLimitContext, State> {
  private requests = new Map<string, number[]>();

  constructor(
    private maxRequests = 10,
    private windowMs = 60000
  ) {
    super('rate-limit', { priority: -800 });
  }

  async onAction(context, next, originalAction) {
    const userId = context.currentContext.user?.id;
    if (!userId) {
      return await next(); // Skip if no user
    }

    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];

    // Clean old requests
    const validRequests = userRequests.filter((time) => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      console.log(`Rate limit exceeded for user ${userId}`);
      return this.createResult(
        context.currentContext,
        false, // Stop pipeline execution
        {
          rateLimited: true,
          retryAfter: this.windowMs,
          pipelineId: context.pipelineId,
          executionOrder: context.executionOrder,
        }
      );
    }

    // Record this request
    validRequests.push(now);
    this.requests.set(userId, validRequests);

    // Add rate limit info to context
    context.currentContext.rateLimitInfo = {
      remaining: this.maxRequests - validRequests.length,
      resetTime: now + this.windowMs,
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

  async onBeforePipeline(context) {
    const userId = context.currentContext.user?.id;
    if (userId) {
      console.log(`Rate limit check for user ${userId}`);
    }
  }
}
```

#### Caching Middleware

```typescript showLineNumbers
interface CacheContext {
  user?: { id: string };
  data?: any[];
  cacheInfo?: {
    hit: boolean;
    key: string;
    timestamp: number;
  };
}

class CacheMiddleware extends BaseMiddleware<CacheContext, State> {
  private cache = new Map<string, { data: any; timestamp: number }>();

  constructor(private ttlMs = 300000) {
    // 5 minutes
    super('cache', { priority: -600 });
  }

  async onAction(context, next, originalAction) {
    const cacheKey = this.getCacheKey(context.currentContext);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.ttlMs) {
      console.log(`Cache hit for key: ${cacheKey}`);

      // Add cache info to context
      const cachedContext = {
        ...context.currentContext,
        ...cached.data,
        cacheInfo: {
          hit: true,
          key: cacheKey,
          timestamp: cached.timestamp,
        },
      };

      // Return cached result without executing rest of pipeline
      return this.createResult(cachedContext, true, {
        fromCache: true,
        cacheKey,
        pipelineId: context.pipelineId,
        executionOrder: context.executionOrder,
      });
    }

    console.log(`Cache miss for key: ${cacheKey}`);

    // Execute pipeline
    const result = await next();

    // Cache the result
    this.cache.set(cacheKey, {
      data: result.context,
      timestamp: Date.now(),
    });

    // Add cache info to result context
    result.context.cacheInfo = {
      hit: false,
      key: cacheKey,
      timestamp: Date.now(),
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

  async onBeforePipeline(context) {
    // Clean expired cache entries
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttlMs) {
        this.cache.delete(key);
      }
    }
  }

  private getCacheKey(context: CacheContext): string {
    const userId = context.user?.id || 'anonymous';
    const dataHash = context.data ? JSON.stringify(context.data).slice(0, 50) : 'no-data';
    return `${userId}-${dataHash}`;
  }
}
```

## Enhanced Pipeline Features

### Pipeline Context Information

Each middleware receives rich context information about the pipeline execution:

```typescript showLineNumbers
class InformationMiddleware extends BaseMiddleware<Context, State> {
  async onAction(context, next, originalAction) {
    // Access pipeline information
    console.log(`Pipeline ID: ${context.pipelineId}`);
    console.log(`Execution order: ${context.executionOrder}`);
    console.log(`Original context:`, context.originalContext);
    console.log(`Current context:`, context.currentContext);
    console.log(`Previous results: ${context.previousResults.length}`);

    // Check what other middleware have done
    const hasAuth = context.previousResults.some((result) => result.metadata?.authenticated);

    if (hasAuth) {
      console.log('Authentication middleware has already run');
    }

    return await next();
  }
}
```

### Pipeline Control

Middleware can control pipeline execution flow:

```typescript showLineNumbers
class ConditionalMiddleware extends BaseMiddleware<Context, State> {
  async onAction(context, next, originalAction) {
    // Stop pipeline based on conditions
    if (context.currentContext.skipRemaining) {
      return this.createResult(
        context.currentContext,
        false, // Stop pipeline
        { skipped: true, reason: 'User requested skip' }
      );
    }

    // Modify context for subsequent middleware
    context.currentContext.processedBy = this.name;

    const result = await next();

    // Post-process result
    return this.createResult(
      result.context,
      result.shouldContinue,
      this.mergeMetadata(result.metadata || {}, {
        postProcessed: true,
        originalShouldContinue: result.shouldContinue,
      })
    );
  }
}
```

### Error Recovery

Enhanced error handling with recovery mechanisms:

```typescript showLineNumbers
class ErrorRecoveryMiddleware extends BaseMiddleware<Context, State> {
  async onAction(context, next, originalAction) {
    try {
      return await next();
    } catch (error) {
      console.error(`Pipeline error at order ${context.executionOrder}:`, error);

      // Attempt recovery
      if (this.canRecover(error, context)) {
        console.log('Attempting error recovery...');

        return this.createResult(
          this.recoverContext(context.currentContext, error),
          true, // Continue pipeline
          {
            recovered: true,
            originalError: error.message,
            recoveryStrategy: 'fallback',
          }
        );
      }

      // Re-throw if can't recover
      throw error;
    }
  }

  private canRecover(error: Error, context: any): boolean {
    // Implement recovery logic
    return error.message.includes('recoverable');
  }

  private recoverContext(context: any, error: Error): any {
    // Implement context recovery
    return {
      ...context,
      errorRecovered: true,
      fallbackData: 'default-value',
    };
  }
}
```

## Middleware Execution Order

Middleware executes in priority order (lower numbers first):

```typescript showLineNumbers
const definition = StateMachine.definitionBuilder<Context, State, Event>()
  .initialState('IDLE')
  // ... states and transitions

  .addMiddleware(new AuthMiddleware()) // Priority: -1000 (first)
  .addMiddleware(new ValidationMiddleware()) // Priority: -500 (second)
  .addMiddleware(new LoggingMiddleware()) // Priority: 0 (third)
  .addMiddleware(new MetricsMiddleware()) // Priority: 500 (fourth)

  .buildDefinition();

// Execution order: Auth -> Validation -> Logging -> Metrics -> Original Action -> Metrics -> Logging -> Validation -> Auth
```

## Middleware Management

### Runtime Middleware Management

```typescript showLineNumbers
const definition = StateMachine.definitionBuilder<Context, State, Event>()
  // ... configuration
  .buildDefinition();

// Add middleware at runtime
definition.addMiddleware(loggingMiddleware);

// Check if middleware exists
if (definition.hasMiddleware('logging')) {
  console.log('Logging middleware is active');
}

// Remove middleware
definition.removeMiddleware('logging');

// Get middleware configuration
const config = definition.getMiddleware('validation');
```

### Conditional Middleware

```typescript showLineNumbers
const conditionalMiddleware: MiddlewareConfig<Context, State> = {
  name: 'conditional',

  actionMiddleware: async (context, originalAction) => {
    // Only apply middleware under certain conditions
    if (context.currentContext.user.role === 'admin') {
      console.log('Admin action detected');
    }

    if (originalAction) {
      await originalAction(context.currentContext);
    }

    return {
      context: context.currentContext,
      shouldContinue: true,
    };
  },

  // Enable/disable based on environment
  enabled: process.env.NODE_ENV === 'development',
};
```

## Frontend vs Backend Usage

### Frontend (React/Vue/Angular)

```typescript showLineNumbers
// Frontend typically needs immutability for state management
const frontendMiddleware = createImmerMiddleware<AppState, UIState, UIEvent>({
  autoFreeze: true,
  enablePatches: true, // Useful for debugging state changes
  strictMode: true, // Catch immutability violations early
});

const uiStateMachine = StateMachine.definitionBuilder<AppState, UIState, UIEvent>()
  .initialState('LOADING')
  .state('LOADING')
  .state('LOADED')
  .state('ERROR')

  .transition('LOADING', 'LOADED', 'data-received')
  .action((context) => {
    // Immer allows "mutative" syntax while maintaining immutability
    context.data = action.payload;
    context.lastUpdated = Date.now();
  })

  .addMiddleware(frontendMiddleware)
  .buildDefinition();

// Use async methods for full middleware support
const newState = await uiStateMachine.processEventAsync(
  currentState,
  'data-received',
  currentContext
);

// Context is immutable and safe to use in React/Vue
setAppState(newState.context);
```

### Backend (Node.js/Deno)

```typescript showLineNumbers
// Backend might not need immutability but can benefit from other middleware
const backendMiddleware = [
  {
    name: 'logging',
    actionMiddleware: async (context, originalAction) => {
      const startTime = Date.now();

      if (originalAction) {
        await originalAction(context.currentContext);
      }

      console.log(`Action completed in ${Date.now() - startTime}ms`);

      return {
        context: context.currentContext,
        shouldContinue: true,
      };
    },
  },
  {
    name: 'metrics',
    actionMiddleware: async (context, originalAction) => {
      // Send metrics to monitoring system
      metrics.increment('state_machine.action.executed');

      if (originalAction) {
        await originalAction(context.currentContext);
      }

      return {
        context: context.currentContext,
        shouldContinue: true,
      };
    },
  },
];

const serverStateMachine = StateMachine.definitionBuilder<ServerContext, ServerState, ServerEvent>()
  // ... configuration
  .addMiddleware(backendMiddleware[0])
  .addMiddleware(backendMiddleware[1])
  .buildDefinition();
```

## Best Practices

### 1. Use Async Methods for Full Middleware Support

```typescript showLineNumbers
// ✅ Good - supports full middleware pipeline
const result = await definition.processEventAsync(state, event, context);

// ❌ Limited - middleware not supported in sync mode
const result = definition.processEvent(state, event, context);
```

### 2. Extend BaseMiddleware for Type Safety

```typescript showLineNumbers
// ✅ Good - type-safe, clean implementation
class MyMiddleware extends BaseMiddleware<Context, State> {
  constructor() {
    super('my-middleware', { priority: 0 });
  }

  async onAction(context, next, originalAction) {
    // Type-safe context access
    const result = await next();
    return this.createResult(result.context, result.shouldContinue);
  }
}

// ❌ Acceptable but less type-safe - configuration-based
const configMiddleware: MiddlewareConfig<Context, State> = {
  name: 'config-based',
  actionMiddleware: async (context, next) => {
    // Less type safety, more boilerplate
    return await next();
  },
};
```

### 3. Handle Errors Gracefully

```typescript showLineNumbers
class RobustMiddleware extends BaseMiddleware<Context, State> {
  async onAction(context, next, originalAction) {
    try {
      const result = await next();
      return result;
    } catch (error) {
      console.error('Middleware error:', error);

      // Option 1: Stop pipeline with error metadata
      return this.createResult(
        context.currentContext,
        false, // Stop execution
        { error: error.message, pipelineId: context.pipelineId }
      );

      // Option 2: Continue with fallback
      // return this.createResult(
      //   this.createFallbackContext(context.currentContext),
      //   true,
      //   { recovered: true, originalError: error.message }
      // );
    }
  }

  async onError(error, context) {
    // Global error handler for this middleware
    console.error(`${this.name} middleware error:`, error);
    // Don't re-throw to allow pipeline to continue
  }
}
```

### 4. Use Priority for Execution Order

```typescript showLineNumbers
// Authentication should run before business logic
class AuthMiddleware extends BaseMiddleware<Context, State> {
  constructor() {
    super('auth', { priority: -1000 }); // Run first
  }
}

class BusinessMiddleware extends BaseMiddleware<Context, State> {
  constructor() {
    super('business', { priority: 0 }); // Run in middle
  }
}

class LoggingMiddleware extends BaseMiddleware<Context, State> {
  constructor() {
    super('logging', { priority: 1000 }); // Run last
  }
}
```

### 5. Keep Middleware Focused

```typescript showLineNumbers
// ✅ Good - single responsibility
class AuthMiddleware extends BaseMiddleware<Context, State> {
  // Only handles authentication
}

class ValidationMiddleware extends BaseMiddleware<Context, State> {
  // Only handles validation
}

// ❌ Poor - multiple responsibilities
class MegaMiddleware extends BaseMiddleware<Context, State> {
  async onAction(context, next, originalAction) {
    // Don't do: auth, validation, logging, metrics, caching all in one
  }
}
```

### 6. Leverage Pipeline Context Information

```typescript showLineNumbers
class SmartMiddleware extends BaseMiddleware<Context, State> {
  async onAction(context, next, originalAction) {
    // Use pipeline information for smart decisions
    if (context.executionOrder === 0) {
      console.log('First middleware in pipeline');
    }

    // Check what previous middleware have done
    const hasAuth = context.previousResults.some((result) => result.metadata?.authenticated);

    if (!hasAuth && this.requiresAuth()) {
      return this.createResult(context.currentContext, false, { error: 'Authentication required' });
    }

    return await next();
  }
}
```

### 7. Use Lifecycle Hooks Appropriately

```typescript showLineNumbers
class LifecycleMiddleware extends BaseMiddleware<Context, State> {
  async onBeforePipeline(context) {
    // Setup/initialization before pipeline starts
    this.startTimer();
  }

  async onAfterPipeline(context, result) {
    // Cleanup/finalization after pipeline completes
    this.endTimer();
    this.logMetrics();
  }

  async onBeforeChain(context) {
    // Alternative chain hook (same as onBeforePipeline)
    console.log('Chain starting');
  }

  async onError(error, context) {
    // Handle errors specific to this middleware
    this.logError(error, context);
  }
}
```

## Next Steps

- [Architecture Overview](../architecture) - Complete system architecture documentation
- [Builder Pattern](builder-pattern) - Advanced builder usage patterns
- [Guards and Actions](guards-and-actions) - Detailed guide on guards and actions
