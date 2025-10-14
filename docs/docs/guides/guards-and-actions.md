---
title: Guards and Actions
description:
  Master guards and actions in state machines for conditional transitions and side effects. Learn
  synchronous/asynchronous patterns, error handling, context manipulation, and real-world examples
  for validation and business logic.
keywords:
  [
    state machine guards,
    actions,
    conditional transitions,
    side effects,
    validation,
    business logic,
    async guards,
    context manipulation,
    error handling,
    state machine logic,
  ]
sidebar_position: 2
---

# Guards and Actions

Guards and actions are the core mechanisms that add business logic and side effects to your state
machines. This comprehensive guide covers their purpose, implementation patterns, and best
practices.

## What Are Guards and Actions?

### Guards

**Guards** are boolean conditions that control whether a transition can occur. They serve as
gatekeepers, ensuring transitions only happen when specific business rules are met.

**Purpose:**

- Enforce business rules and constraints
- Validate context data before transitions
- Implement conditional logic
- Prevent invalid state changes
- Control access and permissions

### Actions

**Actions** are side effects that execute during state transitions or when entering/exiting states.
They perform the actual work of your application.

**Purpose:**

- Execute business logic
- Update context data
- Trigger external services
- Log events and audit trails
- Perform cleanup operations
- Send notifications

## Guards in Detail

### Basic Guard Usage

Guards are functions that receive the current context and return a boolean value:

```typescript showLineNumbers
interface LoginContext {
  username?: string;
  password?: string;
  attempts: number;
  isLocked: boolean;
}

const authMachine = StateMachine.definitionBuilder<LoginContext, AuthState, AuthEvent>()
  .initialState('LOGGED_OUT')
  .state('LOGGED_OUT')
  .state('LOGGED_IN')

  .transition('LOGGED_OUT', 'LOGGED_IN', 'login')
  .guard((context) => {
    // Multiple validation conditions
    return context.username && context.password && context.attempts < 3 && !context.isLocked;
  })

  .buildDefinition();

// Usage
const context: LoginContext = {
  username: 'john',
  password: 'secret123',
  attempts: 0,
  isLocked: false,
};

// This will succeed because all guard conditions are met
const result = authMachine.processEvent('LOGGED_OUT', 'login', context);
console.log(result.success); // true
console.log(result.newState); // 'LOGGED_IN'
```

### Guard Types and Patterns

#### Simple Boolean Guards

```typescript showLineNumbers
// Permission check
.guard((context) => context.user.role === 'admin')

// Data validation
.guard((context) => context.amount > 0 && context.amount <= 10000)

// State validation
.guard((context) => context.inventory.available >= context.quantity)
```

#### Multiple Guards (AND Logic)

You can add multiple guards to the same transition. All guards must return `true` for the transition
to occur:

```typescript showLineNumbers
.transition('CART', 'CHECKOUT', 'proceed')
.guard((context) => context.items.length > 0)           // Has items
.guard((context) => context.user.isAuthenticated)       // User logged in
.guard((context) => context.shippingAddress != null)    // Has shipping address
.guard((context) => context.paymentMethod != null)      // Has payment method
```

#### Complex Business Logic Guards

```typescript showLineNumbers
.transition('ORDER_PENDING', 'ORDER_APPROVED', 'approve')
.guard((context) => {
  // Complex approval logic
  const { order, user, businessRules } = context;

  // Check user permissions
  if (!user.permissions.includes('approve_orders')) {
    return false;
  }

  // Check order amount limits
  const userLimit = businessRules.approvalLimits[user.role] || 0;
  if (order.total > userLimit) {
    return false;
  }

  // Check business hours
  const now = new Date();
  const isBusinessHours = now.getHours() >= 9 && now.getHours() <= 17;
  if (order.requiresBusinessHours && !isBusinessHours) {
    return false;
  }

  return true;
})
```

### Guard with Complex Logic

Guards can contain complex business logic:

```javascript showLineNumbers
.transition('CART', 'CHECKOUT', 'proceed')
.guard((context) => {
  // Multiple conditions
  const hasItems = context.items.length > 0;
  const hasValidPayment = context.paymentMethod && context.paymentMethod.isValid;
  const withinLimit = context.total <= context.creditLimit;
  const isBusinessHours = new Date().getHours() >= 9 && new Date().getHours() <= 17;

  return hasItems && hasValidPayment && withinLimit && isBusinessHours;
})
```

### Guard Error Handling

When guards fail, you can handle it gracefully:

```javascript showLineNumbers
// Method 1: Check before sending event
if (machine.canTransition('login', context)) {
  machine.sendEvent('login', context);
} else {
  console.log('Login conditions not met');
}

// Method 2: Handle with boolean return
const success = machine.sendEvent('login', context);
if (!success) {
  console.log('Login failed - check credentials');
}

// Method 3: Use strict mode for exceptions
try {
  machine.sendEventStrict('login', context);
} catch (error) {
  if (error instanceof GuardConditionError) {
    console.log(`Guard failed: ${error.fromState} -> ${error.toState}`);
  }
}
```

## Actions

**Actions** are side effects that execute during state transitions or when entering/exiting states.
They allow you to perform operations like logging, API calls, or updating context.

### Transition Actions

Execute code during a transition:

```javascript showLineNumbers
.transition('IDLE', 'LOADING', 'start')
.action((context) => {
  console.log('Starting operation...');
  context.startTime = Date.now();
  context.attempts = (context.attempts || 0) + 1;
})
```

### State Entry Actions

Execute code when entering a state:

```javascript showLineNumbers
.onStateEntry('LOADING', (context) => {
  console.log('Entered loading state');
  context.loadingSpinner = true;
  context.startTime = Date.now();
})
```

### State Exit Actions

Execute code when leaving a state:

```javascript showLineNumbers
.onStateExit('LOADING', (context) => {
  console.log('Exiting loading state');
  context.loadingSpinner = false;
  const duration = Date.now() - context.startTime;
  console.log(`Loading took ${duration}ms`);
})
```

### Multiple Actions

Add multiple actions to the same transition or state:

```javascript showLineNumbers
.transition('PROCESSING', 'COMPLETE', 'finish')
.action((context) => console.log('Processing complete'))
.action((context) => context.endTime = Date.now())
.action((context) => context.notifyUser('Process finished'))
.action((context) => context.cleanup())
```

## Advanced Patterns

### Conditional Actions

Actions can contain conditional logic:

```javascript showLineNumbers
.transition('LOADING', 'SUCCESS', 'complete')
.action((context) => {
  if (context.shouldLog) {
    console.log('Operation completed successfully');
  }

  if (context.shouldNotify) {
    context.sendNotification('Success!');
  }

  // Always update timestamp
  context.completedAt = new Date();
})
```

### Async Actions

Actions can be asynchronous, but the state machine doesn't wait for them:

```javascript showLineNumbers
.transition('IDLE', 'PROCESSING', 'start')
.action(async (context) => {
  // Fire and forget - state machine continues immediately
  try {
    await context.logToServer('Processing started');
  } catch (error) {
    console.error('Logging failed:', error);
  }
})

// For operations that should block the transition, use guards instead
.transition('PROCESSING', 'COMPLETE', 'finish')
.guard(async (context) => {
  try {
    await context.validateResult();
    return true;
  } catch (error) {
    return false;
  }
})
```

### Action Error Handling

Handle errors in actions gracefully:

```javascript showLineNumbers
.transition('PROCESSING', 'COMPLETE', 'finish')
.action((context) => {
  try {
    context.saveResults();
    context.sendNotification('Complete!');
  } catch (error) {
    console.error('Action failed:', error);
    // Don't throw - let transition complete
    context.actionError = error;
  }
})

// Or use strict error handling
try {
  machine.sendEventStrict('finish', context);
} catch (error) {
  if (error instanceof ActionExecutionError) {
    console.log(`Action failed in ${error.state}: ${error.message}`);
  }
}
```

## Real-World Examples

### User Authentication Flow

```javascript showLineNumbers
const authMachine = StateMachine.builder()
  .initialState('LOGGED_OUT')
  .state('LOGGED_OUT')
  .state('LOGGING_IN')
  .state('LOGGED_IN')
  .state('LOCKED')

  // Start login process
  .transition('LOGGED_OUT', 'LOGGING_IN', 'login')
  .guard((context) => context.username && context.password)
  .action((context) => {
    context.loginAttempts = (context.loginAttempts || 0) + 1;
    context.loginStartTime = Date.now();
  })

  // Successful login
  .transition('LOGGING_IN', 'LOGGED_IN', 'success')
  .guard((context) => context.authToken)
  .action((context) => {
    context.loginTime = Date.now();
    context.sessionId = generateSessionId();
    console.log(`User ${context.username} logged in`);
  })

  // Failed login
  .transition('LOGGING_IN', 'LOGGED_OUT', 'failure')
  .action((context) => {
    console.log(`Login failed for ${context.username}`);
    context.lastFailure = Date.now();
  })

  // Account lockout after too many attempts
  .transition('LOGGING_IN', 'LOCKED', 'failure')
  .guard((context) => context.loginAttempts >= 3)
  .action((context) => {
    console.log(`Account locked for ${context.username}`);
    context.lockedAt = Date.now();
    context.sendSecurityAlert();
  })

  // State entry/exit actions
  .onStateEntry('LOGGING_IN', (context) => {
    context.showLoadingSpinner();
  })

  .onStateExit('LOGGING_IN', (context) => {
    context.hideLoadingSpinner();
  })

  .build();
```

### E-commerce Order Processing

```javascript showLineNumbers
const orderMachine = StateMachine.builder()
  .initialState('CART')
  .state('CART')
  .state('CHECKOUT')
  .state('PAYMENT_PROCESSING')
  .state('CONFIRMED')
  .state('SHIPPED')
  .state('DELIVERED')
  .state('CANCELLED')

  // Proceed to checkout
  .transition('CART', 'CHECKOUT', 'checkout')
  .guard((context) => {
    return context.items.length > 0 && context.items.every((item) => item.inStock);
  })
  .action((context) => {
    context.checkoutStarted = Date.now();
    context.reserveInventory();
  })

  // Process payment
  .transition('CHECKOUT', 'PAYMENT_PROCESSING', 'pay')
  .guard((context) => {
    return context.paymentMethod && context.shippingAddress && context.total > 0;
  })
  .action((context) => {
    context.paymentStarted = Date.now();
    context.logEvent('payment_initiated');
  })

  // Payment successful
  .transition('PAYMENT_PROCESSING', 'CONFIRMED', 'payment_success')
  .guard((context) => context.paymentConfirmed)
  .action((context) => {
    context.orderId = generateOrderId();
    context.confirmationEmail();
    context.updateInventory();
    console.log(`Order ${context.orderId} confirmed`);
  })

  // Payment failed
  .transition('PAYMENT_PROCESSING', 'CHECKOUT', 'payment_failure')
  .action((context) => {
    context.paymentError = context.lastError;
    context.releaseInventory();
    console.log('Payment failed, returning to checkout');
  })

  // Ship order
  .transition('CONFIRMED', 'SHIPPED', 'ship')
  .guard((context) => context.inventoryAllocated)
  .action((context) => {
    context.trackingNumber = generateTrackingNumber();
    context.shippingNotification();
    console.log(`Order ${context.orderId} shipped`);
  })

  // Cancel order (from multiple states)
  .transition('CART', 'CANCELLED', 'cancel')
  .transition('CHECKOUT', 'CANCELLED', 'cancel')
  .transition('CONFIRMED', 'CANCELLED', 'cancel')
  .guard((context) => !context.shipped) // Can't cancel if already shipped
  .action((context) => {
    context.releaseInventory();
    context.refundPayment();
    context.cancellationNotification();
    console.log(`Order ${context.orderId} cancelled`);
  })

  .build();
```

## Best Practices

### Keep Guards Simple

```javascript showLineNumbers
// ✅ Good - simple, focused guard
.guard((context) => context.isValid)

// ❌ Poor - complex logic in guard
.guard((context) => {
  // 50 lines of complex validation logic
  // Better to extract to a separate function
})

// ✅ Better - extract complex logic
.guard((context) => context.validateComplexRules())
```

### Use Actions for Side Effects Only

```javascript showLineNumbers
// ✅ Good - actions for side effects
.action((context) => {
  console.log('State changed');
  context.updateUI();
  context.logEvent();
})

// ❌ Poor - actions that affect transition logic
.action((context) => {
  if (someCondition) {
    // Don't try to trigger another transition from an action
    machine.sendEvent('anotherEvent'); // This can cause issues
  }
})
```

### Handle Action Errors

```javascript showLineNumbers
// ✅ Good - handle errors gracefully
.action((context) => {
  try {
    context.riskyOperation();
  } catch (error) {
    console.error('Action failed:', error);
    context.errorState = error;
    // Don't re-throw unless you want to fail the transition
  }
})
```

### Use Context Effectively

```javascript showLineNumbers
// ✅ Good - context carries necessary data
const context = {
  userId: '123',
  permissions: ['read', 'write'],
  sessionData: {},

  // Helper methods
  hasPermission(perm) {
    return this.permissions.includes(perm);
  },

  log(message) {
    console.log(`[${this.userId}] ${message}`);
  }
};

.guard((context) => context.hasPermission('write'))
.action((context) => context.log('Action executed'))
```

## Next Steps

Continue exploring the library with the [Builder Pattern](builder-pattern) guide or check out the
[API Reference](../api) for detailed documentation.
