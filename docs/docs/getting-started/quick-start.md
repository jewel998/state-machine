---
sidebar_position: 2
---

# Quick Start

This guide will walk you through creating your first state machine in just a few minutes.

## Basic State Machine

Let's create a simple traffic light state machine:

```javascript
import { StateMachine } from '@jewel998/state-machine';

const trafficLight = StateMachine.builder()
  .initialState('RED')
  .state('RED')
  .state('YELLOW')
  .state('GREEN')
  .transition('RED', 'GREEN', 'go')
  .transition('GREEN', 'YELLOW', 'caution')
  .transition('YELLOW', 'RED', 'stop')
  .build();

// Start the state machine
trafficLight.start();
console.log(trafficLight.getCurrentState()); // 'RED'

// Change states
trafficLight.sendEvent('go');
console.log(trafficLight.getCurrentState()); // 'GREEN'

trafficLight.sendEvent('caution');
console.log(trafficLight.getCurrentState()); // 'YELLOW'

trafficLight.sendEvent('stop');
console.log(trafficLight.getCurrentState()); // 'RED'
```

## State Machine with Context

Add context data to track additional information:

```javascript
const doorMachine = StateMachine.builder()
  .initialState('CLOSED')
  .state('CLOSED')
  .state('OPEN')
  .state('LOCKED')
  .transition('CLOSED', 'OPEN', 'open')
  .transition('OPEN', 'CLOSED', 'close')
  .transition('CLOSED', 'LOCKED', 'lock')
  .transition('LOCKED', 'CLOSED', 'unlock')
  .build();

// Start with context
const context = {
  hasKey: true,
  attempts: 0,
};

doorMachine.start();

// Check available events
console.log(doorMachine.getAvailableEvents()); // ['open', 'lock']

// Try to open the door
if (doorMachine.canTransition('open', context)) {
  doorMachine.sendEvent('open', context);
  console.log('Door opened!');
}
```

## Adding Guards

Guards control when transitions can occur:

```javascript
const atmMachine = StateMachine.builder()
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

  .build();

const context = {
  pin: '1234',
  correctPin: '1234',
  balance: 100,
};

atmMachine.start();
atmMachine.sendEvent('insertCard', context);
atmMachine.sendEvent('enterPin', context); // Will succeed
atmMachine.sendEvent('selectTransaction', context); // Will succeed
```

## Adding Actions

Actions execute code during transitions and state changes:

```javascript
const orderMachine = StateMachine.builder()
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

  .build();

const orderContext = {
  orderId: 'ORD-001',
  items: ['item1', 'item2'],
};

orderMachine.start();
orderMachine.sendEvent('process', orderContext);
orderMachine.sendEvent('complete', orderContext);
```

## Error Handling

Handle errors gracefully with try-catch or boolean returns:

```javascript
// Method 1: Boolean return (safe)
const success = machine.sendEvent('invalidEvent');
if (!success) {
  console.log('Transition failed');
  console.log('Available events:', machine.getAvailableEvents());
}

// Method 2: Exception handling (strict)
try {
  machine.sendEventStrict('invalidEvent');
} catch (error) {
  if (error instanceof InvalidTransitionError) {
    console.log('Invalid transition:', error.message);
    console.log('Available events:', error.availableEvents);
  }
}
```

## TypeScript Support

Get full type safety with TypeScript:

```typescript
interface UserContext {
  userId: string;
  isAdmin: boolean;
  loginAttempts: number;
}

type UserState = 'LOGGED_OUT' | 'LOGGING_IN' | 'LOGGED_IN' | 'LOCKED';
type UserEvent = 'login' | 'logout' | 'lock' | 'unlock';

const userMachine = StateMachine.builder<UserContext, UserState, UserEvent>()
  .initialState('LOGGED_OUT')
  .state('LOGGED_OUT')
  .state('LOGGING_IN')
  .state('LOGGED_IN')
  .state('LOCKED')

  .transition('LOGGED_OUT', 'LOGGING_IN', 'login')
  .guard((context) => context.loginAttempts < 3)

  .transition('LOGGING_IN', 'LOGGED_IN', 'login')
  .guard((context) => context.userId && context.userId.length > 0)

  .build();
```

## Common Patterns

### State Reset

```javascript
// Reset to initial state
machine.reset();
console.log(machine.getCurrentState()); // Back to initial state
```

### Checking Transitions

```javascript
// Check if transition is possible
if (machine.canTransition('nextEvent', context)) {
  machine.sendEvent('nextEvent', context);
}

// Get all available events
const events = machine.getAvailableEvents();
console.log('Can trigger:', events);
```

### Multiple Guards and Actions

```javascript
const machine = StateMachine.builder()
  .initialState('START')
  .state('START')
  .state('MIDDLE')
  .state('END')

  .transition('START', 'MIDDLE', 'proceed')
  .guard((ctx) => ctx.hasPermission)
  .guard((ctx) => ctx.isValid)
  .action((ctx) => console.log('First action'))
  .action((ctx) => console.log('Second action'))

  .build();
```

## Next Steps

Now that you understand the basics, explore:

- [Basic Concepts](basic-concepts) - Deeper understanding of state machine principles
- [Builder Pattern](../guides/builder-pattern) - Advanced builder usage
- [Guards and Actions](../guides/guards-and-actions) - Detailed guide on guards and actions
