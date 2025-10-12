# @jewel998/state-machine

A lightweight, type-safe state machine library for JavaScript/TypeScript with production-ready
performance and clean architecture. Features declarative state management, comprehensive error
handling, and server-scale performance testing.

## Features

- 🎯 **Declarative API** - Clean, intuitive syntax for state definitions
- 🔒 **Type Safety** - Full TypeScript support with strict type checking
- 🏗️ **Builder Pattern** - Fluent API with method chaining
- ⚡ **Production Ready** - Optimized bundle (~45KB) with tree-shaking support
- 🛡️ **Guard Conditions** - Conditional transition logic (sync & async)
- 📝 **Actions** - State entry, exit, and transition actions (sync & async)
- 🔄 **Async Transactions** - Database transactions with automatic rollback
- 🚨 **Error Handling** - Comprehensive error types with rollback support
- 🔍 **Observability** - Built-in statistics, history, and event tracking
- 🚀 **Performance** - Stateless definitions for zero per-object overhead
- 🏭 **Scalable** - Efficient pattern for millions of objects
- 🧪 **Testing** - Comprehensive test suite

## Installation

```bash
npm install @jewel998/state-machine
```

```bash
pnpm add @jewel998/state-machine
```

```bash
yarn add @jewel998/state-machine
```

## Quick Start

```javascript
import { StateMachine } from '@jewel998/state-machine';

// 1. Create ONE shared definition (zero per-object overhead)
const orderWorkflow = StateMachine.definitionBuilder()
  .initialState('PENDING')
  .state('PENDING')
  .state('APPROVED')
  .state('SHIPPED')
  .transition('PENDING', 'APPROVED', 'approve')
  .transition('APPROVED', 'SHIPPED', 'ship')
  .buildDefinition();

// 2. Objects just track their state
class Order {
  constructor(id) {
    this.id = id;
    this.state = 'PENDING'; // Just the state value - no machine instance!
  }

  processEvent(event) {
    const result = orderWorkflow.processEvent(this.state, event, this);
    if (result.success) {
      this.state = result.newState;
    }
    return result.success;
  }
}

// 3. Scale to millions with shared definition
const orders = Array.from({ length: 1000000 }, (_, i) => new Order(`ORD-${i}`));
orders.forEach((order) => order.processEvent('approve'));
console.log('Processed 1M orders with ONE shared definition!');
```

## Advanced Usage

### Async Transactions with Database Rollback

```javascript
const orderWorkflow = StateMachine.definitionBuilder()
  .initialState('DRAFT')
  .state('DRAFT')
  .state('INVENTORY_RESERVED')
  .state('PAYMENT_PROCESSED')
  .state('CONFIRMED')

  // Reserve inventory with automatic rollback on failure
  .transition('DRAFT', 'INVENTORY_RESERVED', 'reserve_inventory')
  .transaction(
    async (context) => {
      await database.reserveInventory(context.orderId, context.quantity);
      await database.updateOrderStatus(context.orderId, 'RESERVED');
    },
    async (context, error) => {
      // Automatic rollback on any failure
      await database.rollbackInventory(context.orderId, context.quantity);
    }
  )

  // Process payment with rollback
  .transition('INVENTORY_RESERVED', 'PAYMENT_PROCESSED', 'process_payment')
  .transaction(
    async (context) => {
      await paymentService.charge(context.orderId, context.amount);
    },
    async (context, error) => {
      // Rollback both payment and inventory
      await paymentService.refund(context.orderId, context.amount);
      await database.rollbackInventory(context.orderId, context.quantity);
    }
  )

  .buildDefinition();

// Use async processing
class Order {
  async processEvent(event) {
    const result = await orderWorkflow.processEventAsync(this.state, event, this);
    if (result.success) {
      this.state = result.newState;
    } else if (result.rollbackExecuted) {
      console.log('Transaction rolled back automatically');
    }
    return result.success;
  }
}
```

### Guards and Actions (Sync & Async)

```javascript
const workflow = StateMachine.definitionBuilder()
  .initialState('IDLE')
  .state('PROCESSING')
  .state('COMPLETED')

  .transition('IDLE', 'PROCESSING', 'start')
  .guard(async (context) => {
    // Async guard - check permissions from database
    return await permissionService.hasAccess(context.userId);
  })
  .action(async (context) => {
    // Async action
    await auditService.log('Processing started', context);
  })

  .onStateEntry('PROCESSING', async (context) => {
    await context.startTimer();
  })

  .buildDefinition();
```

### TypeScript Support

```typescript
interface OrderContext {
  orderId: string;
  amount: number;
  approved: boolean;
}

type OrderState = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SHIPPED';
type OrderEvent = 'approve' | 'reject' | 'ship';

const orderMachine = StateMachine.builder<OrderContext, OrderState, OrderEvent>()
  .initialState('PENDING')
  .state('PENDING')
  .state('APPROVED')
  .state('REJECTED')
  .state('SHIPPED')
  .transition('PENDING', 'APPROVED', 'approve')
  .guard((context) => context.amount < 10000)
  .transition('PENDING', 'REJECTED', 'reject')
  .transition('APPROVED', 'SHIPPED', 'ship')
  .build();
```

## Examples

Check out the comprehensive examples in the `examples/` directory:

- **`stateless-pattern.js`** - Efficient stateless pattern with 1M objects
- **`async-transactions.js`** - Database transactions with automatic rollbacks
- **`advanced-features.js`** - Complex workflows with guards and actions

```bash
# Run the stateless pattern demo
node examples/stateless-pattern.js

# Run async transaction demo
node examples/async-transactions.js

# Run advanced features demo
node examples/advanced-features.js
```

## API Reference

### StateMachine.definitionBuilder()

Creates a new stateless definition builder instance.

### Builder Methods

- `.initialState(state)` - Set the initial state
- `.state(state)` - Define a state
- `.transition(from, to, event)` - Define a transition
- `.guard(condition)` - Add guard condition (sync or async)
- `.action(callback)` - Add action (sync or async)
- `.transaction(callback, rollback)` - Add async transaction with rollback
- `.onStateEntry(state, callback)` - Add state entry action
- `.onStateExit(state, callback)` - Add state exit action
- `.buildDefinition()` - Create the stateless definition

### Definition Methods

- `.processEvent(currentState, event, context)` - Process event synchronously
- `.processEventAsync(currentState, event, context)` - Process event asynchronously
- `.canTransition(currentState, event, context)` - Check if transition is possible
- `.canTransitionAsync(currentState, event, context)` - Check transition asynchronously
- `.getAvailableEvents(currentState, context?)` - Get available events for state
- `.getInitialState()` - Get the initial state
- `.getAllStates()` - Get all defined states

### Error Handling

The library provides comprehensive error handling with specific error types:

```typescript
import {
  StateMachine,
  InvalidTransitionError,
  GuardConditionError,
  ActionExecutionError,
} from '@jewel998/state-machine';

try {
  machine.sendEventStrict('invalid_event');
} catch (error) {
  if (error instanceof InvalidTransitionError) {
    console.log(`Available events: ${error.availableEvents}`);
  } else if (error instanceof GuardConditionError) {
    console.log(`Guard failed: ${error.fromState} -> ${error.toState}`);
  } else if (error instanceof ActionExecutionError) {
    console.log(`Action failed: ${error.actionType} in ${error.state}`);
  }
}
```

## Use Cases

- **Workflow Management** - Model business processes and approval workflows
- **Game Development** - Manage game states, character states, and UI flows
- **Form Validation** - Handle multi-step forms with complex validation rules
- **API Integration** - Manage request/response cycles and error handling
- **UI Components** - Control component behavior and user interactions

## Development

### Quick Start

```bash
# Setup development environment
npm run setup

# Run tests
npm test

# Run stateless performance tests
npm run perf:quick

# Development workflow
npm run dev help
```

### Scripts

- `npm run setup` - Complete development setup
- `npm run test:all` - Comprehensive test suite
- `npm run perf:quick` - Quick stateless performance tests
- `npm run perf:server` - Server-scale performance tests (millions of ops)
- `npm run ci` - CI/CD pipeline simulation
- `npm run dev <command>` - Development workflow automation

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our
code of conduct and the process for submitting pull requests.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

## Support

- 📖 [Documentation](https://github.com/jewel998/state-machine/wiki)
- 🐛 [Issue Tracker](https://github.com/jewel998/state-machine/issues)
- 💬 [Discussions](https://github.com/jewel998/state-machine/discussions)
