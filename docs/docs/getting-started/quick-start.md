---
title: Quick Start
description:
  Learn to create state machines in minutes with practical examples. Covers basic transitions,
  context data, guards, actions, error handling, and TypeScript integration with real-world
  examples.
keywords:
  [
    state machine tutorial,
    quick start,
    javascript state machine,
    typescript state machine,
    guards,
    actions,
    transitions,
    context,
    error handling,
    examples,
  ]
sidebar_position: 2
---

# Quick Start

This guide will walk you through creating your first state machine in just a few minutes.

## Basic State Machine

Let's create a simple traffic light state machine using the stateless pattern:

```javascript showLineNumbers
import { StateMachine } from '@jewel998/state-machine';

// Create a stateless definition (shared behavior, no instance state)
const trafficLightDefinition = StateMachine.definitionBuilder()
  .initialState('RED')
  .state('RED')
  .state('YELLOW')
  .state('GREEN')
  .transition('RED', 'GREEN', 'go')
  .transition('GREEN', 'YELLOW', 'caution')
  .transition('YELLOW', 'RED', 'stop')
  .buildDefinition();

// Objects just track their current state
class TrafficLight {
  constructor() {
    this.currentState = trafficLightDefinition.getInitialState(); // 'RED'
  }

  processEvent(event) {
    const result = trafficLightDefinition.processEvent(this.currentState, event, {});
    if (result.success) {
      this.currentState = result.newState;
      console.log(`Traffic light: ${event} -> ${this.currentState}`);
      return true;
    } else {
      console.log(`Invalid transition: ${event} from ${this.currentState}`);
      return false;
    }
  }

  getCurrentState() {
    return this.currentState;
  }

  getAvailableEvents() {
    return trafficLightDefinition.getAvailableEvents(this.currentState);
  }
}

// Usage
const light = new TrafficLight();
console.log(light.getCurrentState()); // 'RED'

light.processEvent('go');
console.log(light.getCurrentState()); // 'GREEN'

light.processEvent('caution');
console.log(light.getCurrentState()); // 'YELLOW'

light.processEvent('stop');
console.log(light.getCurrentState()); // 'RED'
```

## State Machine with Context

Add context data to track additional information:

```javascript showLineNumbers
const doorDefinition = StateMachine.definitionBuilder()
  .initialState('CLOSED')
  .state('CLOSED')
  .state('OPEN')
  .state('LOCKED')
  .transition('CLOSED', 'OPEN', 'open')
  .transition('OPEN', 'CLOSED', 'close')
  .transition('CLOSED', 'LOCKED', 'lock')
  .transition('LOCKED', 'CLOSED', 'unlock')
  .buildDefinition();

class Door {
  constructor() {
    this.state = doorDefinition.getInitialState(); // 'CLOSED'
    this.context = {
      hasKey: true,
      attempts: 0,
    };
  }

  processEvent(event) {
    // Check if transition is possible
    if (doorDefinition.canTransition(this.state, event, this.context)) {
      const result = doorDefinition.processEvent(this.state, event, this.context);
      if (result.success) {
        this.state = result.newState;
        console.log(`Door: ${event} -> ${this.state}`);
        return true;
      }
    }
    console.log(`Cannot ${event} door from ${this.state}`);
    return false;
  }

  getAvailableEvents() {
    return doorDefinition.getAvailableEvents(this.state, this.context);
  }
}

// Usage
const door = new Door();
console.log(door.getAvailableEvents()); // ['open', 'lock']

if (door.processEvent('open')) {
  console.log('Door opened!');
}
```

## Adding Guards

Guards control when transitions can occur:

```javascript showLineNumbers
const atmDefinition = StateMachine.definitionBuilder()
  .initialState('IDLE')
  .state('IDLE')
  .state('CARD_INSERTED')
  .state('AUTHENTICATED')
  .state('TRANSACTION')

  .transition('IDLE', 'CARD_INSERTED', 'insertCard')

  .transition('CARD_INSERTED', 'AUTHENTICATED', 'enterPin')
  .guard((context) => context.pin === context.correctPin)

  .transition('AUTHENTICATED', 'TRANSACTION', 'selectTransaction')
  .guard((context) => context.balance > 0)

  .buildDefinition();

class ATM {
  constructor() {
    this.state = atmDefinition.getInitialState(); // 'IDLE'
    this.context = {
      pin: '',
      correctPin: '1234',
      balance: 100,
    };
  }

  processEvent(event, inputPin = null) {
    if (inputPin) this.context.pin = inputPin;

    const result = atmDefinition.processEvent(this.state, event, this.context);
    if (result.success) {
      this.state = result.newState;
      console.log(`ATM: ${event} -> ${this.state}`);
      return true;
    } else {
      console.log(`ATM: ${event} failed - ${result.error?.message || 'Guard condition not met'}`);
      return false;
    }
  }
}

// Usage
const atm = new ATM();
atm.processEvent('insertCard'); // Success
atm.processEvent('enterPin', '1234'); // Success (correct PIN)
atm.processEvent('selectTransaction'); // Success (has balance)
```

## Adding Actions

Actions execute code during transitions and state changes:

```javascript showLineNumbers
const orderDefinition = StateMachine.definitionBuilder()
  .initialState('PENDING')
  .state('PENDING')
  .state('PROCESSING')
  .state('COMPLETED')
  .state('CANCELLED')

  .transition('PENDING', 'PROCESSING', 'process')
  .action((context) => {
    console.log(`Processing order ${context.orderId}`);
    context.processedAt = new Date();
  })

  .transition('PROCESSING', 'COMPLETED', 'complete')
  .action((context) => {
    console.log(`Order ${context.orderId} completed`);
    context.completedAt = new Date();
  })

  .onStateEntry('PROCESSING', (context) => {
    console.log('Started processing...');
    context.startTime = Date.now();
  })

  .onStateExit('PROCESSING', (context) => {
    const duration = Date.now() - context.startTime;
    console.log(`Processing took ${duration}ms`);
  })

  .buildDefinition();

class Order {
  constructor(orderId, items) {
    this.state = orderDefinition.getInitialState(); // 'PENDING'
    this.context = {
      orderId,
      items,
      processedAt: null,
      completedAt: null,
      startTime: null,
    };
  }

  processEvent(event) {
    const result = orderDefinition.processEvent(this.state, event, this.context);
    if (result.success) {
      this.state = result.newState;
      // Context is modified by actions
      return true;
    }
    return false;
  }
}

// Usage
const order = new Order('ORD-001', ['item1', 'item2']);
order.processEvent('process'); // Logs: "Processing order ORD-001", "Started processing..."
order.processEvent('complete'); // Logs: "Order ORD-001 completed", "Processing took Xms"
```

## Error Handling

Handle errors gracefully with result objects:

```javascript showLineNumbers
class StateMachineWrapper {
  constructor(definition) {
    this.definition = definition;
    this.state = definition.getInitialState();
    this.context = {};
  }

  processEvent(event) {
    const result = this.definition.processEvent(this.state, event, this.context);

    if (result.success) {
      this.state = result.newState;
      console.log(`Transition successful: ${event} -> ${this.state}`);
      return true;
    } else {
      console.log('Transition failed:', result.error?.message);
      console.log('Available events:', this.definition.getAvailableEvents(this.state));
      return false;
    }
  }

  // For stricter error handling, you can throw on failure
  processEventStrict(event) {
    const result = this.definition.processEvent(this.state, event, this.context);

    if (!result.success) {
      throw result.error;
    }

    this.state = result.newState;
    return result;
  }
}

// Usage
const wrapper = new StateMachineWrapper(someDefinition);

// Safe method
if (!wrapper.processEvent('invalidEvent')) {
  console.log('Handle failure gracefully');
}

// Strict method
try {
  wrapper.processEventStrict('invalidEvent');
} catch (error) {
  console.log('Error:', error.message);
}
```

## TypeScript Support

Get full type safety with TypeScript:

```typescript showLineNumbers
interface UserContext {
  userId: string;
  isAdmin: boolean;
  loginAttempts: number;
}

type UserState = 'LOGGED_OUT' | 'LOGGING_IN' | 'LOGGED_IN' | 'LOCKED';
type UserEvent = 'login' | 'logout' | 'lock' | 'unlock';

const userDefinition = StateMachine.definitionBuilder<UserContext, UserState, UserEvent>()
  .initialState('LOGGED_OUT')
  .state('LOGGED_OUT')
  .state('LOGGING_IN')
  .state('LOGGED_IN')
  .state('LOCKED')

  .transition('LOGGED_OUT', 'LOGGING_IN', 'login')
  .guard((context) => context.loginAttempts < 3)

  .transition('LOGGING_IN', 'LOGGED_IN', 'login')
  .guard((context) => context.userId && context.userId.length > 0)

  .buildDefinition();

class User {
  private state: UserState;
  private context: UserContext;

  constructor(userId: string) {
    this.state = userDefinition.getInitialState();
    this.context = {
      userId,
      isAdmin: false,
      loginAttempts: 0,
    };
  }

  login(): boolean {
    const result = userDefinition.processEvent(this.state, 'login', this.context);
    if (result.success) {
      this.state = result.newState;
      return true;
    }
    this.context.loginAttempts++;
    return false;
  }

  getCurrentState(): UserState {
    return this.state;
  }
}
```

## Common Patterns

### State Reset

```javascript showLineNumbers
class StateMachineWrapper {
  constructor(definition) {
    this.definition = definition;
    this.reset();
  }

  reset() {
    this.state = this.definition.getInitialState();
    console.log('Reset to initial state:', this.state);
  }
}
```

### Checking Transitions

```javascript showLineNumbers
class StateMachineWrapper {
  // ... constructor code ...

  tryTransition(event) {
    // Check if transition is possible
    if (this.definition.canTransition(this.state, event, this.context)) {
      const result = this.definition.processEvent(this.state, event, this.context);
      if (result.success) {
        this.state = result.newState;
        return true;
      }
    }
    return false;
  }

  getAvailableEvents() {
    return this.definition.getAvailableEvents(this.state, this.context);
  }
}
```

### Multiple Guards and Actions

Note: The current API supports one guard and one action per transition. For multiple conditions,
combine them in a single guard function:

```javascript showLineNumbers
const definition = StateMachine.definitionBuilder()
  .initialState('START')
  .state('START')
  .state('MIDDLE')
  .state('END')

  .transition('START', 'MIDDLE', 'proceed')
  .guard((ctx) => ctx.hasPermission && ctx.isValid) // Combined guards
  .action((ctx) => {
    // Combined actions
    console.log('First action');
    console.log('Second action');
    ctx.processed = true;
  })

  .buildDefinition();
```

## Async Operations and Middleware

For async operations and middleware support, use the async API:

```typescript showLineNumbers
import { StateMachine, BaseMiddleware } from '@jewel998/state-machine';

// Create custom middleware
class LoggingMiddleware extends BaseMiddleware {
  constructor() {
    super('logging', { priority: 100 });
  }

  async onAction(context, next) {
    console.log('Action starting...');
    const result = await next();
    console.log('Action completed');
    return result;
  }
}

const definition = StateMachine.definitionBuilder()
  .initialState('IDLE')
  .state('IDLE')
  .state('PROCESSING')
  .state('COMPLETED')

  .transition('IDLE', 'PROCESSING', 'start')
  .action(async (context) => {
    context.startTime = Date.now();
    // Simulate async work
    await new Promise((resolve) => setTimeout(resolve, 100));
  })

  .transition('PROCESSING', 'COMPLETED', 'finish')
  .action(async (context) => {
    context.duration = Date.now() - context.startTime;
  })

  // Add middleware pipeline
  .addMiddleware(new LoggingMiddleware())
  .buildDefinition();

// Async usage
class AsyncStateMachine {
  constructor(definition) {
    this.definition = definition;
    this.state = definition.getInitialState();
    this.context = {};
  }

  async processEventAsync(event) {
    const result = await this.definition.processEventAsync(this.state, event, this.context);
    if (result.success) {
      this.state = result.newState;
      this.context = result.context || this.context;
      console.log(`Async transition: ${event} -> ${this.state}`);
      return true;
    }
    return false;
  }
}

// Usage
const asyncMachine = new AsyncStateMachine(definition);
await asyncMachine.processEventAsync('start');
await asyncMachine.processEventAsync('finish');
```

## Next Steps

Now that you understand the basics, explore:

- [Basic Concepts](basic-concepts) - Deeper understanding of state machine principles
- [Builder Pattern](../guides/builder-pattern) - Advanced builder usage
- [Guards and Actions](../guides/guards-and-actions) - Detailed guide on guards and actions
- [Middleware System](../guides/middleware-system) - Powerful middleware pipeline architecture
- [Architecture Overview](../architecture) - Complete system architecture documentation
