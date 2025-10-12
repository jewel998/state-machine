# @jewel998/state-machine

A lightweight, type-safe state machine library for JavaScript/TypeScript with production-ready
performance and clean architecture. Features declarative state management, comprehensive error
handling, and server-scale performance testing.

## Features

- 🎯 **Declarative API** - Clean, intuitive syntax for state definitions
- 🔒 **Type Safety** - Full TypeScript support with strict type checking
- 🏗️ **Builder Pattern** - Fluent API with method chaining
- ⚡ **Production Ready** - Optimized bundle (~45KB) with tree-shaking support
- 🛡️ **Guard Conditions** - Conditional transition logic
- 📝 **Actions** - State entry, exit, and transition actions
- 🚨 **Error Handling** - Comprehensive error types with automatic rollback
- 🔍 **Observability** - Built-in statistics, history, and event tracking
- 🚀 **Performance** - Server-scale tested (millions of operations)
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

// Define a simple order processing state machine
const orderMachine = StateMachine.builder()
  .initialState('PENDING')
  .state('PENDING')
  .state('APPROVED')
  .state('REJECTED')
  .state('SHIPPED')
  .transition('PENDING', 'APPROVED', 'approve')
  .transition('PENDING', 'REJECTED', 'reject')
  .transition('APPROVED', 'SHIPPED', 'ship')
  .build();

// Use the state machine
orderMachine.start();
console.log(orderMachine.getCurrentState()); // 'PENDING'

orderMachine.sendEvent('approve');
console.log(orderMachine.getCurrentState()); // 'APPROVED'

orderMachine.sendEvent('ship');
console.log(orderMachine.getCurrentState()); // 'SHIPPED'
```

## Advanced Usage

### With Guards and Actions

```javascript
const machine = StateMachine.builder()
  .initialState('IDLE')
  .state('IDLE')
  .state('PROCESSING')
  .state('COMPLETED')
  .state('ERROR')

  .transition('IDLE', 'PROCESSING', 'start')
  .guard((context) => context.hasPermission)
  .action((context) => console.log('Starting process...'))

  .transition('PROCESSING', 'COMPLETED', 'finish')
  .action((context) => context.cleanup())

  .transition('PROCESSING', 'ERROR', 'error')

  .onStateEntry('PROCESSING', (context) => {
    context.startTimer();
  })

  .onStateExit('PROCESSING', (context) => {
    context.stopTimer();
  })

  .build();
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

## API Reference

### StateMachine.builder()

Creates a new state machine builder instance.

### Builder Methods

- `.initialState(state)` - Set the initial state
- `.state(state)` - Define a state
- `.transition(from, to, event)` - Define a transition
- `.guard(condition)` - Add guard condition to last transition
- `.action(callback)` - Add action to last transition
- `.onStateEntry(state, callback)` - Add state entry action
- `.onStateExit(state, callback)` - Add state exit action
- `.build()` - Create the state machine instance

### State Machine Methods

- `.start()` - Start the state machine
- `.sendEvent(event, context?)` - Send an event to trigger transitions (returns boolean)
- `.sendEventStrict(event, context?)` - Send an event with strict error handling (throws on failure)
- `.getCurrentState()` - Get current state
- `.canTransition(event, context?)` - Check if transition is possible
- `.getAvailableEvents()` - Get available events from current state
- `.reset()` - Reset to initial state

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

# Run performance tests
npm run perf:quick

# Development workflow
npm run dev help
```

### Scripts

- `npm run setup` - Complete development setup
- `npm run test:all` - Comprehensive test suite
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
