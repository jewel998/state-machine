---
sidebar_position: 1
---

# Builder Pattern

The StateMachine library uses the **Builder Pattern** to provide a fluent, chainable API for
constructing state machines. This approach makes the code more readable and helps prevent
configuration errors.

## Basic Builder Usage

The builder pattern allows you to chain method calls to configure your state machine:

```javascript
import { StateMachine } from '@jewel998/state-machine';

const machine = StateMachine.builder()
  .initialState('IDLE')
  .state('IDLE')
  .state('RUNNING')
  .state('COMPLETE')
  .transition('IDLE', 'RUNNING', 'start')
  .transition('RUNNING', 'COMPLETE', 'finish')
  .build(); // Creates the actual StateMachine instance
```

## Builder Methods

### State Definition

```javascript
// Define states explicitly
.state('STATE_NAME')

// States are automatically added from transitions
.transition('FROM_STATE', 'TO_STATE', 'EVENT') // Both states auto-added
```

### Initial State

```javascript
// Set the starting state (required)
.initialState('IDLE')
```

### Transitions

```javascript
// Basic transition
.transition('FROM_STATE', 'TO_STATE', 'EVENT')

// The last defined transition can have guards and actions added
.transition('IDLE', 'RUNNING', 'start')
.guard((context) => context.isReady)
.action((context) => console.log('Starting...'))
```

### Guards and Actions

Guards and actions are applied to the **last defined transition**:

```javascript
const machine = StateMachine.builder()
  .initialState('IDLE')

  // First transition with guard and action
  .transition('IDLE', 'RUNNING', 'start')
  .guard((context) => context.hasPermission)
  .action((context) => (context.startTime = Date.now()))

  // Second transition with different guard and action
  .transition('RUNNING', 'COMPLETE', 'finish')
  .guard((context) => context.isValid)
  .action((context) => (context.endTime = Date.now()))

  .build();
```

### State Entry and Exit Actions

```javascript
const machine = StateMachine.builder()
  .initialState('IDLE')
  .state('IDLE')
  .state('PROCESSING')
  .state('COMPLETE')

  // Actions when entering/exiting states
  .onStateEntry('PROCESSING', (context) => {
    console.log('Started processing');
    context.processingStart = Date.now();
  })

  .onStateExit('PROCESSING', (context) => {
    const duration = Date.now() - context.processingStart;
    console.log(`Processing took ${duration}ms`);
  })

  .transition('IDLE', 'PROCESSING', 'start')
  .transition('PROCESSING', 'COMPLETE', 'finish')
  .build();
```

## Method Chaining Rules

### Order Independence

Most builder methods can be called in any order:

```javascript
// These are equivalent
const machine1 = StateMachine.builder()
  .initialState('A')
  .state('A')
  .state('B')
  .transition('A', 'B', 'go')
  .build();

const machine2 = StateMachine.builder()
  .state('B')
  .transition('A', 'B', 'go')
  .state('A')
  .initialState('A')
  .build();
```

### Guard and Action Placement

Guards and actions must come **immediately after** the transition they apply to:

```javascript
// ✅ Correct - guard applies to the transition above it
.transition('A', 'B', 'event1')
.guard((context) => context.isValid)

.transition('B', 'C', 'event2')
.action((context) => console.log('Moving to C'))

// ❌ Incorrect - guard has no transition to apply to
.guard((context) => context.isValid) // Error: no preceding transition
.transition('A', 'B', 'event1')
```

### Multiple Guards and Actions

You can add multiple guards and actions to the same transition:

```javascript
.transition('A', 'B', 'proceed')
.guard((context) => context.hasPermission)    // First guard
.guard((context) => context.isValid)          // Second guard (AND logic)
.action((context) => console.log('First'))    // First action
.action((context) => console.log('Second'))   // Second action
```

## Advanced Builder Patterns

### Conditional Building

Build different state machines based on conditions:

```javascript
function createMachine(hasAdvancedFeatures) {
  const builder = StateMachine.builder()
    .initialState('START')
    .state('START')
    .state('BASIC')
    .transition('START', 'BASIC', 'begin');

  if (hasAdvancedFeatures) {
    builder
      .state('ADVANCED')
      .transition('BASIC', 'ADVANCED', 'upgrade')
      .transition('ADVANCED', 'BASIC', 'downgrade');
  }

  return builder.build();
}
```

### Builder Composition

Break complex machines into smaller, composable parts:

```javascript
function addAuthenticationStates(builder) {
  return builder
    .state('LOGGED_OUT')
    .state('LOGGING_IN')
    .state('LOGGED_IN')
    .transition('LOGGED_OUT', 'LOGGING_IN', 'login')
    .transition('LOGGING_IN', 'LOGGED_IN', 'success')
    .transition('LOGGING_IN', 'LOGGED_OUT', 'failure');
}

function addDataStates(builder) {
  return builder
    .state('LOADING')
    .state('LOADED')
    .state('ERROR')
    .transition('LOGGED_IN', 'LOADING', 'fetchData')
    .transition('LOADING', 'LOADED', 'success')
    .transition('LOADING', 'ERROR', 'failure');
}

const machine = addDataStates(
  addAuthenticationStates(StateMachine.builder().initialState('LOGGED_OUT'))
).build();
```

### Configuration Objects

Use configuration objects for complex setups:

```javascript
const config = {
  initialState: 'IDLE',
  states: ['IDLE', 'PROCESSING', 'COMPLETE', 'ERROR'],
  transitions: [
    { from: 'IDLE', to: 'PROCESSING', event: 'start' },
    { from: 'PROCESSING', to: 'COMPLETE', event: 'success' },
    { from: 'PROCESSING', to: 'ERROR', event: 'failure' },
    { from: 'ERROR', to: 'IDLE', event: 'retry' },
  ],
};

function buildFromConfig(config) {
  let builder = StateMachine.builder().initialState(config.initialState);

  // Add states
  config.states.forEach((state) => {
    builder = builder.state(state);
  });

  // Add transitions
  config.transitions.forEach(({ from, to, event }) => {
    builder = builder.transition(from, to, event);
  });

  return builder.build();
}

const machine = buildFromConfig(config);
```

## TypeScript Builder

The builder provides full TypeScript support with generic types:

```typescript
interface MyContext {
  userId: string;
  data: any[];
}

type MyState = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';
type MyEvent = 'start' | 'success' | 'failure' | 'retry';

const machine = StateMachine.builder<MyContext, MyState, MyEvent>()
  .initialState('IDLE')
  .state('IDLE')
  .state('LOADING')
  .state('SUCCESS')
  .state('ERROR')

  .transition('IDLE', 'LOADING', 'start')
  .guard((context: MyContext) => context.userId.length > 0) // Typed context

  .transition('LOADING', 'SUCCESS', 'success')
  .action((context: MyContext) => {
    context.data.push('result'); // Type-safe operations
  })

  .build();
```

## Validation and Error Handling

The builder validates your configuration and provides helpful error messages:

```javascript
// Missing initial state
try {
  StateMachine.builder().state('A').transition('A', 'B', 'go').build(); // Throws: "Initial state must be set"
} catch (error) {
  console.error(error.message);
}

// Guard without transition
try {
  StateMachine.builder()
    .initialState('A')
    .guard((context) => true) // Error: no transition to apply guard to
    .build();
} catch (error) {
  console.error(error.message);
}

// Unreachable states warning
const machine = StateMachine.builder()
  .initialState('A')
  .state('A')
  .state('B')
  .state('C') // Warning: C is unreachable (no transitions to it)
  .transition('A', 'B', 'go')
  .build();
```

## Best Practices

### Use Descriptive Names

```javascript
// ✅ Good - clear, descriptive names
.transition('PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'processPayment')
.guard((context) => context.hasValidPaymentMethod)
.action((context) => context.logPaymentStart())

// ❌ Poor - unclear names
.transition('S1', 'S2', 'e1')
.guard((context) => context.x)
.action((context) => context.y())
```

### Group Related Configuration

```javascript
const machine = StateMachine.builder()
  .initialState('IDLE')

  // Define all states first
  .state('IDLE')
  .state('LOADING')
  .state('SUCCESS')
  .state('ERROR')

  // Then define transitions with their guards/actions
  .transition('IDLE', 'LOADING', 'start')
  .guard((context) => context.isReady)
  .action((context) => context.startLoading())

  .transition('LOADING', 'SUCCESS', 'complete')
  .action((context) => context.handleSuccess())

  .transition('LOADING', 'ERROR', 'fail')
  .action((context) => context.handleError())

  // Finally, state entry/exit actions
  .onStateEntry('LOADING', (context) => context.showSpinner())
  .onStateExit('LOADING', (context) => context.hideSpinner())

  .build();
```

### Validate Early

```javascript
// Check configuration before building
const builder = StateMachine.builder().initialState('START');

// Add states conditionally with validation
const requiredStates = ['START', 'MIDDLE', 'END'];
requiredStates.forEach((state) => {
  if (state) {
    // Validate state name
    builder.state(state);
  }
});

const machine = builder.build();
```

## Next Steps

- [Guards and Actions](guards-and-actions) - Add logic to your state machines
