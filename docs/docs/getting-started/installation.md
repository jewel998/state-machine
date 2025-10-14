---
title: Installation
description:
  Complete installation guide for the state machine library. Install via npm, pnpm, or yarn.
  Includes TypeScript setup, browser support, CDN usage, and verification steps.
keywords:
  [
    state machine installation,
    npm install,
    typescript setup,
    browser support,
    CDN,
    package manager,
    node.js,
    javascript library,
  ]
sidebar_position: 1
---

import Tabs from '@theme/Tabs'; import TabItem from '@theme/TabItem';

# Installation

Get started with @jewel998/state-machine by installing it in your project.

## Package Manager Installation

Choose your preferred package manager:

<Tabs groupId="package-managers" queryString="packageManager">
  <TabItem value="npm" label="npm">
```bash
npm install @jewel998/state-machine
```
  </TabItem>
  <TabItem value="pnpm" label="pnpm">
```bash
pnpm add @jewel998/state-machine
```
  </TabItem>
  <TabItem value="yarn" label="yarn">
```bash
yarn add @jewel998/state-machine
```
  </TabItem>
</Tabs>

## Requirements

- **Node.js**: >= 16.0.0
- **TypeScript**: >= 4.3.5 (if using TypeScript)

## Import Methods

<Tabs groupId="import-methods" queryString="import">
  <TabItem value="es" label="ES Module">
```javascript showLineNumbers
import { StateMachine } from '@jewel998/state-machine';
```
  </TabItem>
  <TabItem value="commonjs" label="CommonJS">
```javascript showLineNumbers
const { StateMachine } = require('@jewel998/state-machine');
```
  </TabItem>
  <TabItem value="typescript" label="TypeScript">
```typescript showLineNumbers
import {
  StateMachine,
  IStateMachineDefinition,
  InvalidTransitionError,
  GuardConditionError,
} from '@jewel998/state-machine';
```
  </TabItem>
</Tabs>

## Bundle Information

The library is optimized for modern bundlers:

- **Bundle Size**: ~45KB minified
- **Tree Shaking**: Fully supported
- **Side Effects**: None
- **Dependencies**: Zero runtime dependencies

## Browser Support

The library supports all modern browsers:

- Chrome >= 60
- Firefox >= 60
- Safari >= 12
- Edge >= 79

For older browser support, you may need to include polyfills for:

- `Map` and `Set`
- `Object.assign`
- `Array.from`

## CDN Usage

For quick prototyping, you can use the library via CDN:

```html showLineNumbers
<script type="module">
  import { StateMachine } from 'https://unpkg.com/@jewel998/state-machine/index.mjs';

  // Your code here
</script>
```

## Verification

Verify your installation by creating a simple state machine:

```javascript showLineNumbers
import { StateMachine } from '@jewel998/state-machine';

// Create a stateless definition
const definition = StateMachine.definitionBuilder()
  .initialState('idle')
  .state('idle')
  .state('active')
  .transition('idle', 'active', 'start')
  .buildDefinition();

// Create a simple wrapper to manage state
class SimpleStateMachine {
  constructor(definition) {
    this.definition = definition;
    this.currentState = definition.getInitialState();
  }

  processEvent(event) {
    const result = this.definition.processEvent(this.currentState, event, {});
    if (result.success) {
      this.currentState = result.newState;
      return true;
    }
    return false;
  }

  getCurrentState() {
    return this.currentState;
  }
}

// Test the state machine
const machine = new SimpleStateMachine(definition);
console.log(machine.getCurrentState()); // 'idle'

machine.processEvent('start');
console.log(machine.getCurrentState()); // 'active'

console.log('✅ Installation successful!');
```

## Next Steps

Now that you have the library installed, continue to the [Quick Start](quick-start) guide to learn
the basics.
