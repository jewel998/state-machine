---
title: Testing State Machines
description:
  Complete testing guide for state machines covering unit tests, integration tests, async
  operations, middleware testing, performance testing, and best practices with Jest examples.
keywords:
  [
    state machine testing,
    unit testing,
    integration testing,
    Jest,
    async testing,
    middleware testing,
    performance testing,
    test utilities,
    mocking,
    test patterns,
  ]
sidebar_position: 5
---

# Testing State Machines

Testing state machines requires a systematic approach to ensure all transitions, guards, actions,
and error conditions work correctly. This guide covers comprehensive testing strategies and
patterns.

## Testing Philosophy

State machines are inherently testable because they have:

- **Predictable behavior** - Same input always produces same output
- **Clear boundaries** - Well-defined states and transitions
- **Isolated logic** - Guards and actions can be tested independently
- **Deterministic flow** - No hidden state or side effects

## Unit Testing Basics

### Testing State Transitions

```typescript showLineNumbers
import { StateMachine } from '@jewel998/state-machine';

describe('Order State Machine', () => {
  let orderMachine: any;

  beforeEach(() => {
    orderMachine = StateMachine.definitionBuilder()
      .initialState('DRAFT')
      .state('DRAFT')
      .state('CONFIRMED')
      .state('SHIPPED')
      .state('DELIVERED')
      .transition('DRAFT', 'CONFIRMED', 'confirm')
      .transition('CONFIRMED', 'SHIPPED', 'ship')
      .transition('SHIPPED', 'DELIVERED', 'deliver')
      .buildDefinition();
  });

  it('should transition from DRAFT to CONFIRMED', () => {
    const result = orderMachine.processEvent('DRAFT', 'confirm', {});

    expect(result.success).toBe(true);
    expect(result.newState).toBe('CONFIRMED');
  });

  it('should reject invalid transitions', () => {
    const result = orderMachine.processEvent('DRAFT', 'ship', {});

    expect(result.success).toBe(false);
    expect(result.newState).toBe('DRAFT'); // State unchanged
  });

  it('should handle non-existent events', () => {
    const result = orderMachine.processEvent('DRAFT', 'invalid_event', {});

    expect(result.success).toBe(false);
  });
});
```

### Testing Guards

```typescript showLineNumbers
describe('Order Guards', () => {
  let orderMachine: any;

  beforeEach(() => {
    orderMachine = StateMachine.definitionBuilder()
      .initialState('CART')
      .state('CART')
      .state('CHECKOUT')
      .transition('CART', 'CHECKOUT', 'proceed')
      .guard((context) => context.items.length > 0)
      .guard((context) => context.user.isAuthenticated)
      .buildDefinition();
  });

  it('should allow transition when all guards pass', () => {
    const context = {
      items: [{ id: 1, name: 'Product' }],
      user: { isAuthenticated: true },
    };

    const result = orderMachine.processEvent('CART', 'proceed', context);
    expect(result.success).toBe(true);
  });

  it('should block transition when guard fails - empty cart', () => {
    const context = {
      items: [], // Empty cart
      user: { isAuthenticated: true },
    };

    const result = orderMachine.processEvent('CART', 'proceed', context);
    expect(result.success).toBe(false);
  });

  it('should block transition when guard fails - not authenticated', () => {
    const context = {
      items: [{ id: 1, name: 'Product' }],
      user: { isAuthenticated: false },
    };

    const result = orderMachine.processEvent('CART', 'proceed', context);
    expect(result.success).toBe(false);
  });

  it('should provide available events when transition blocked', () => {
    const context = { items: [], user: { isAuthenticated: false } };

    const availableEvents = orderMachine.getAvailableEvents('CART', context);
    expect(availableEvents).toEqual([]); // No events available due to failed guards
  });
});
```

### Testing Actions

```typescript showLineNumbers
describe('Order Actions', () => {
  let orderMachine: any;
  let mockEmailService: jest.Mock;
  let mockInventoryService: jest.Mock;

  beforeEach(() => {
    mockEmailService = jest.fn();
    mockInventoryService = jest.fn();

    orderMachine = StateMachine.definitionBuilder()
      .initialState('CONFIRMED')
      .state('CONFIRMED')
      .state('SHIPPED')
      .transition('CONFIRMED', 'SHIPPED', 'ship')
      .action((context) => {
        // Reserve inventory
        mockInventoryService(context.items);

        // Send notification
        mockEmailService(context.user.email, 'Order shipped');

        // Update context
        context.shippedAt = new Date();
        context.trackingNumber = 'TRK123456';
      })
      .buildDefinition();
  });

  it('should execute actions during transition', () => {
    const context = {
      items: [{ id: 1, quantity: 2 }],
      user: { email: 'user@example.com' },
    };

    const result = orderMachine.processEvent('CONFIRMED', 'ship', context);

    expect(result.success).toBe(true);
    expect(mockInventoryService).toHaveBeenCalledWith(context.items);
    expect(mockEmailService).toHaveBeenCalledWith('user@example.com', 'Order shipped');
    expect(context.shippedAt).toBeDefined();
    expect(context.trackingNumber).toBe('TRK123456');
  });
});
```

### Testing State Entry/Exit Actions

```typescript showLineNumbers
describe('State Entry/Exit Actions', () => {
  let orderMachine: any;
  let mockLogger: jest.Mock;
  let mockMetrics: jest.Mock;

  beforeEach(() => {
    mockLogger = jest.fn();
    mockMetrics = jest.fn();

    orderMachine = StateMachine.definitionBuilder()
      .initialState('IDLE')
      .state('IDLE')
      .state('PROCESSING')
      .state('COMPLETED')

      .onStateEntry('PROCESSING', (context) => {
        mockLogger('Processing started', context.orderId);
        mockMetrics('processing.started');
        context.processingStartTime = Date.now();
      })

      .onStateExit('PROCESSING', (context) => {
        const duration = Date.now() - context.processingStartTime;
        mockLogger('Processing completed', { orderId: context.orderId, duration });
        mockMetrics('processing.completed', duration);
      })

      .transition('IDLE', 'PROCESSING', 'start')
      .transition('PROCESSING', 'COMPLETED', 'complete')
      .buildDefinition();
  });

  it('should execute entry action when entering state', () => {
    const context = { orderId: 'ORD-123' };

    const result = orderMachine.processEvent('IDLE', 'start', context);

    expect(result.success).toBe(true);
    expect(mockLogger).toHaveBeenCalledWith('Processing started', 'ORD-123');
    expect(mockMetrics).toHaveBeenCalledWith('processing.started');
    expect(context.processingStartTime).toBeDefined();
  });

  it('should execute exit action when leaving state', () => {
    const context = {
      orderId: 'ORD-123',
      processingStartTime: Date.now() - 1000, // 1 second ago
    };

    const result = orderMachine.processEvent('PROCESSING', 'complete', context);

    expect(result.success).toBe(true);
    expect(mockLogger).toHaveBeenCalledWith(
      'Processing completed',
      expect.objectContaining({ orderId: 'ORD-123' })
    );
    expect(mockMetrics).toHaveBeenCalledWith('processing.completed', expect.any(Number));
  });
});
```

## Testing Async Operations

### Testing Async Guards

```typescript showLineNumbers
describe('Async Guards', () => {
  let authMachine: any;
  let mockAuthService: jest.Mock;

  beforeEach(() => {
    mockAuthService = jest.fn();

    authMachine = StateMachine.definitionBuilder()
      .initialState('LOGGED_OUT')
      .state('LOGGED_OUT')
      .state('LOGGED_IN')
      .transition('LOGGED_OUT', 'LOGGED_IN', 'login')
      .guard(async (context) => {
        const isValid = await mockAuthService.validateCredentials(
          context.username,
          context.password
        );
        return isValid;
      })
      .buildDefinition();
  });

  it('should allow transition when async guard passes', async () => {
    mockAuthService.validateCredentials.mockResolvedValue(true);

    const context = { username: 'user', password: 'pass' };
    const result = await authMachine.processEventAsync('LOGGED_OUT', 'login', context);

    expect(result.success).toBe(true);
    expect(result.newState).toBe('LOGGED_IN');
    expect(mockAuthService.validateCredentials).toHaveBeenCalledWith('user', 'pass');
  });

  it('should block transition when async guard fails', async () => {
    mockAuthService.validateCredentials.mockResolvedValue(false);

    const context = { username: 'user', password: 'wrong' };
    const result = await authMachine.processEventAsync('LOGGED_OUT', 'login', context);

    expect(result.success).toBe(false);
    expect(result.newState).toBe('LOGGED_OUT');
  });

  it('should handle async guard errors', async () => {
    mockAuthService.validateCredentials.mockRejectedValue(new Error('Service unavailable'));

    const context = { username: 'user', password: 'pass' };

    await expect(authMachine.processEventAsync('LOGGED_OUT', 'login', context)).rejects.toThrow(
      'Service unavailable'
    );
  });
});
```

### Testing Async Actions

```typescript showLineNumbers
describe('Async Actions', () => {
  let orderMachine: any;
  let mockPaymentService: jest.Mock;
  let mockInventoryService: jest.Mock;

  beforeEach(() => {
    mockPaymentService = jest.fn();
    mockInventoryService = jest.fn();

    orderMachine = StateMachine.definitionBuilder()
      .initialState('PENDING')
      .state('PENDING')
      .state('CONFIRMED')
      .transition('PENDING', 'CONFIRMED', 'confirm')
      .action(async (context) => {
        await mockPaymentService.charge(context.payment);
        await mockInventoryService.reserve(context.items);
        context.confirmedAt = new Date();
      })
      .buildDefinition();
  });

  it('should execute async actions successfully', async () => {
    mockPaymentService.charge.mockResolvedValue({ transactionId: 'TXN-123' });
    mockInventoryService.reserve.mockResolvedValue({ reservationId: 'RES-456' });

    const context = {
      payment: { amount: 100, method: 'card' },
      items: [{ id: 1, quantity: 2 }],
    };

    const result = await orderMachine.processEventAsync('PENDING', 'confirm', context);

    expect(result.success).toBe(true);
    expect(mockPaymentService.charge).toHaveBeenCalledWith(context.payment);
    expect(mockInventoryService.reserve).toHaveBeenCalledWith(context.items);
    expect(context.confirmedAt).toBeDefined();
  });

  it('should handle async action failures', async () => {
    mockPaymentService.charge.mockRejectedValue(new Error('Payment failed'));

    const context = {
      payment: { amount: 100, method: 'card' },
      items: [{ id: 1, quantity: 2 }],
    };

    await expect(orderMachine.processEventAsync('PENDING', 'confirm', context)).rejects.toThrow(
      'Payment failed'
    );
  });
});
```

## Testing Transactions and Rollbacks

```typescript showLineNumbers
describe('Transaction Rollbacks', () => {
  let orderMachine: any;
  let mockDatabase: any;
  let mockPaymentService: any;

  beforeEach(() => {
    mockDatabase = {
      createOrder: jest.fn(),
      deleteOrder: jest.fn(),
      reserveInventory: jest.fn(),
      releaseInventory: jest.fn(),
    };

    mockPaymentService = {
      charge: jest.fn(),
      refund: jest.fn(),
    };

    orderMachine = StateMachine.definitionBuilder()
      .initialState('DRAFT')
      .state('DRAFT')
      .state('CONFIRMED')
      .state('FAILED')
      .transition('DRAFT', 'CONFIRMED', 'confirm')
      .transaction(
        // Main transaction
        async (context) => {
          await mockDatabase.createOrder(context.order);
          await mockDatabase.reserveInventory(context.items);
          await mockPaymentService.charge(context.payment);
        },
        // Rollback function
        async (context, error) => {
          await mockPaymentService.refund(context.payment);
          await mockDatabase.releaseInventory(context.items);
          await mockDatabase.deleteOrder(context.order.id);
        }
      )
      .buildDefinition();
  });

  it('should complete transaction successfully', async () => {
    mockDatabase.createOrder.mockResolvedValue({ id: 'ORD-123' });
    mockDatabase.reserveInventory.mockResolvedValue({ reserved: true });
    mockPaymentService.charge.mockResolvedValue({ transactionId: 'TXN-456' });

    const context = {
      order: { id: 'ORD-123', total: 100 },
      items: [{ id: 1, quantity: 2 }],
      payment: { method: 'card', amount: 100 },
    };

    const result = await orderMachine.processEventAsync('DRAFT', 'confirm', context);

    expect(result.success).toBe(true);
    expect(result.newState).toBe('CONFIRMED');
    expect(result.rollbackExecuted).toBe(false);

    expect(mockDatabase.createOrder).toHaveBeenCalledWith(context.order);
    expect(mockDatabase.reserveInventory).toHaveBeenCalledWith(context.items);
    expect(mockPaymentService.charge).toHaveBeenCalledWith(context.payment);
  });

  it('should execute rollback when transaction fails', async () => {
    mockDatabase.createOrder.mockResolvedValue({ id: 'ORD-123' });
    mockDatabase.reserveInventory.mockResolvedValue({ reserved: true });
    mockPaymentService.charge.mockRejectedValue(new Error('Payment failed'));

    // Rollback mocks
    mockPaymentService.refund.mockResolvedValue({ refunded: true });
    mockDatabase.releaseInventory.mockResolvedValue({ released: true });
    mockDatabase.deleteOrder.mockResolvedValue({ deleted: true });

    const context = {
      order: { id: 'ORD-123', total: 100 },
      items: [{ id: 1, quantity: 2 }],
      payment: { method: 'card', amount: 100 },
    };

    const result = await orderMachine.processEventAsync('DRAFT', 'confirm', context);

    expect(result.success).toBe(false);
    expect(result.newState).toBe('DRAFT'); // State unchanged
    expect(result.rollbackExecuted).toBe(true);
    expect(result.error?.message).toBe('Payment failed');

    // Verify rollback was executed
    expect(mockPaymentService.refund).toHaveBeenCalledWith(context.payment);
    expect(mockDatabase.releaseInventory).toHaveBeenCalledWith(context.items);
    expect(mockDatabase.deleteOrder).toHaveBeenCalledWith('ORD-123');
  });
});
```

## Testing Middleware

```typescript showLineNumbers
describe('Middleware Testing', () => {
  let machine: any;
  let mockMiddleware: any;

  beforeEach(() => {
    mockMiddleware = {
      name: 'test-middleware',
      priority: 0,
      enabled: true,
      actionMiddleware: jest.fn(async (context, next) => {
        context.currentContext.middlewareExecuted = true;
        const result = await next();
        return {
          ...result,
          metadata: { ...result.metadata, processed: true },
        };
      }),
    };

    machine = StateMachine.definitionBuilder()
      .initialState('A')
      .state('A')
      .state('B')
      .transition('A', 'B', 'go')
      .action((context) => {
        context.actionExecuted = true;
      })
      .addMiddleware(mockMiddleware)
      .buildDefinition();
  });

  it('should execute middleware during transitions', async () => {
    const context = {};

    const result = await machine.processEventAsync('A', 'go', context);

    expect(result.success).toBe(true);
    expect(context.middlewareExecuted).toBe(true);
    expect(context.actionExecuted).toBe(true);
    expect(result.metadata?.processed).toBe(true);
    expect(mockMiddleware.actionMiddleware).toHaveBeenCalled();
  });

  it('should handle middleware errors', async () => {
    mockMiddleware.actionMiddleware.mockImplementation(async () => {
      throw new Error('Middleware error');
    });

    const context = {};

    await expect(machine.processEventAsync('A', 'go', context)).rejects.toThrow('Middleware error');
  });
});
```

## Integration Testing

### Testing Complete Workflows

```typescript showLineNumbers
describe('Order Processing Workflow', () => {
  let orderWorkflow: any;
  let mockServices: any;

  beforeEach(() => {
    mockServices = {
      inventory: {
        checkAvailability: jest.fn(),
        reserve: jest.fn(),
        release: jest.fn(),
      },
      payment: {
        validate: jest.fn(),
        charge: jest.fn(),
        refund: jest.fn(),
      },
      shipping: {
        calculateCost: jest.fn(),
        createShipment: jest.fn(),
      },
      notification: {
        sendEmail: jest.fn(),
        sendSMS: jest.fn(),
      },
    };

    orderWorkflow = createOrderWorkflow(mockServices);
  });

  it('should process complete order workflow successfully', async () => {
    // Setup mocks
    mockServices.inventory.checkAvailability.mockResolvedValue(true);
    mockServices.inventory.reserve.mockResolvedValue({ reservationId: 'RES-123' });
    mockServices.payment.validate.mockResolvedValue(true);
    mockServices.payment.charge.mockResolvedValue({ transactionId: 'TXN-456' });
    mockServices.shipping.calculateCost.mockResolvedValue(10.99);
    mockServices.shipping.createShipment.mockResolvedValue({ trackingId: 'TRK-789' });
    mockServices.notification.sendEmail.mockResolvedValue(true);

    const context = {
      order: { id: 'ORD-123', items: [{ id: 1, quantity: 2 }] },
      customer: { email: 'customer@example.com' },
      payment: { method: 'card', token: 'tok_123' },
    };

    // Execute complete workflow
    let result = await orderWorkflow.processEventAsync('DRAFT', 'validate', context);
    expect(result.success).toBe(true);
    expect(result.newState).toBe('VALIDATED');

    result = await orderWorkflow.processEventAsync('VALIDATED', 'confirm', context);
    expect(result.success).toBe(true);
    expect(result.newState).toBe('CONFIRMED');

    result = await orderWorkflow.processEventAsync('CONFIRMED', 'ship', context);
    expect(result.success).toBe(true);
    expect(result.newState).toBe('SHIPPED');

    // Verify all services were called
    expect(mockServices.inventory.checkAvailability).toHaveBeenCalled();
    expect(mockServices.payment.charge).toHaveBeenCalled();
    expect(mockServices.shipping.createShipment).toHaveBeenCalled();
    expect(mockServices.notification.sendEmail).toHaveBeenCalled();
  });

  it('should handle workflow failures with proper rollback', async () => {
    // Setup mocks - payment fails
    mockServices.inventory.checkAvailability.mockResolvedValue(true);
    mockServices.inventory.reserve.mockResolvedValue({ reservationId: 'RES-123' });
    mockServices.payment.validate.mockResolvedValue(true);
    mockServices.payment.charge.mockRejectedValue(new Error('Payment declined'));

    // Rollback mocks
    mockServices.inventory.release.mockResolvedValue(true);
    mockServices.payment.refund.mockResolvedValue(true);

    const context = {
      order: { id: 'ORD-123', items: [{ id: 1, quantity: 2 }] },
      customer: { email: 'customer@example.com' },
      payment: { method: 'card', token: 'tok_123' },
    };

    // Validate should succeed
    let result = await orderWorkflow.processEventAsync('DRAFT', 'validate', context);
    expect(result.success).toBe(true);

    // Confirm should fail and rollback
    result = await orderWorkflow.processEventAsync('VALIDATED', 'confirm', context);
    expect(result.success).toBe(false);
    expect(result.rollbackExecuted).toBe(true);
    expect(result.error?.message).toBe('Payment declined');

    // Verify rollback was executed
    expect(mockServices.inventory.release).toHaveBeenCalled();
  });
});
```

## Performance Testing

```typescript showLineNumbers
describe('Performance Tests', () => {
  let machine: any;

  beforeEach(() => {
    machine = StateMachine.definitionBuilder()
      .initialState('A')
      .state('A')
      .state('B')
      .transition('A', 'B', 'go')
      .buildDefinition();
  });

  it('should handle high-frequency transitions efficiently', () => {
    const iterations = 100000;
    const contexts = Array.from({ length: iterations }, (_, i) => ({ id: i }));

    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      const result = machine.processEvent('A', 'go', contexts[i]);
      expect(result.success).toBe(true);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    const opsPerSecond = iterations / (duration / 1000);

    console.log(`Processed ${iterations} transitions in ${duration}ms`);
    console.log(`Performance: ${opsPerSecond.toFixed(0)} ops/second`);

    // Assert minimum performance threshold
    expect(opsPerSecond).toBeGreaterThan(10000); // At least 10k ops/second
  });

  it('should scale with multiple concurrent state machines', async () => {
    const machineCount = 1000;
    const machines = Array.from({ length: machineCount }, () =>
      StateMachine.definitionBuilder()
        .initialState('A')
        .state('A')
        .state('B')
        .transition('A', 'B', 'go')
        .buildDefinition()
    );

    const startTime = Date.now();

    const promises = machines.map(async (m, i) => {
      const result = await m.processEventAsync('A', 'go', { id: i });
      expect(result.success).toBe(true);
      return result;
    });

    await Promise.all(promises);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`Processed ${machineCount} concurrent machines in ${duration}ms`);

    // Assert reasonable concurrent performance
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });
});
```

## Test Utilities and Helpers

```typescript showLineNumbers
// Test utilities for common patterns
export class StateMachineTestUtils {
  static createMockContext(overrides = {}) {
    return {
      userId: 'test-user',
      sessionId: 'test-session',
      timestamp: Date.now(),
      ...overrides,
    };
  }

  static async executeTransitionSequence(
    machine: any,
    transitions: Array<{ state: string; event: string; context?: any }>
  ) {
    let currentState = transitions[0].state;

    for (const { state, event, context } of transitions) {
      expect(currentState).toBe(state);

      const result = await machine.processEventAsync(state, event, context || {});
      expect(result.success).toBe(true);

      currentState = result.newState;
    }

    return currentState;
  }

  static expectTransitionFailure(machine: any, fromState: string, event: string, context = {}) {
    const result = machine.processEvent(fromState, event, context);
    expect(result.success).toBe(false);
    expect(result.newState).toBe(fromState); // State should remain unchanged
  }

  static expectGuardFailure(machine: any, fromState: string, event: string, context = {}) {
    // Should be able to check available events
    const availableEvents = machine.getAvailableEvents(fromState, context);
    expect(availableEvents).not.toContain(event);

    // Transition should fail
    this.expectTransitionFailure(machine, fromState, event, context);
  }
}

// Usage in tests
describe('Using Test Utilities', () => {
  it('should use helper methods for cleaner tests', async () => {
    const context = StateMachineTestUtils.createMockContext({
      hasPermission: true,
    });

    const finalState = await StateMachineTestUtils.executeTransitionSequence(machine, [
      { state: 'DRAFT', event: 'validate' },
      { state: 'VALIDATED', event: 'confirm', context },
      { state: 'CONFIRMED', event: 'ship' },
    ]);

    expect(finalState).toBe('SHIPPED');
  });
});
```

## Best Practices

### 1. Test State Machine Behavior, Not Implementation

```typescript showLineNumbers
// ✅ Good - tests behavior
it('should prevent checkout with empty cart', () => {
  const result = machine.processEvent('CART', 'checkout', { items: [] });
  expect(result.success).toBe(false);
});

// ❌ Poor - tests implementation details
it('should call isEmpty function on cart', () => {
  const spy = jest.spyOn(cart, 'isEmpty');
  machine.processEvent('CART', 'checkout', { items: [] });
  expect(spy).toHaveBeenCalled();
});
```

### 2. Use Descriptive Test Names

```typescript showLineNumbers
// ✅ Good - describes the scenario and expected outcome
it('should reject login when user account is locked after 3 failed attempts', () => {
  // test implementation
});

// ❌ Poor - vague and unhelpful
it('should test login', () => {
  // test implementation
});
```

### 3. Test Edge Cases and Error Conditions

```typescript showLineNumbers
describe('Edge Cases', () => {
  it('should handle null context gracefully', () => {
    const result = machine.processEvent('IDLE', 'start', null);
    expect(result.success).toBe(false);
  });

  it('should handle undefined event gracefully', () => {
    const result = machine.processEvent('IDLE', undefined, {});
    expect(result.success).toBe(false);
  });

  it('should handle concurrent transitions safely', async () => {
    const promises = [
      machine.processEventAsync('IDLE', 'start', { id: 1 }),
      machine.processEventAsync('IDLE', 'start', { id: 2 }),
    ];

    const results = await Promise.all(promises);
    results.forEach((result) => {
      expect(result.success).toBe(true);
    });
  });
});
```

### 4. Mock External Dependencies

```typescript showLineNumbers
// ✅ Good - mocks external services
beforeEach(() => {
  mockEmailService = jest.fn();
  mockPaymentGateway = jest.fn();

  // Inject mocks into state machine
  machine = createOrderMachine({
    emailService: mockEmailService,
    paymentGateway: mockPaymentGateway,
  });
});
```

### 5. Test Middleware Integration

```typescript showLineNumbers
it('should execute middleware in correct order', async () => {
  const executionOrder: string[] = [];

  const middleware1 = createTestMiddleware('first', -100, executionOrder);
  const middleware2 = createTestMiddleware('second', 0, executionOrder);
  const middleware3 = createTestMiddleware('third', 100, executionOrder);

  machine.addMiddleware(middleware1);
  machine.addMiddleware(middleware2);
  machine.addMiddleware(middleware3);

  await machine.processEventAsync('A', 'go', {});

  expect(executionOrder).toEqual([
    'first-before',
    'second-before',
    'third-before',
    'third-after',
    'second-after',
    'first-after',
  ]);
});
```

## Next Steps

- [Error Handling](error-handling) - Test error scenarios comprehensively
- [Middleware System](middleware-system) - Test middleware behavior
- [Architecture Overview](../architecture) - Understand testable architecture patterns
