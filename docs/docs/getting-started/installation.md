---
sidebar_position: 1
---

# Installation

Get started with @jewel998/state-machine by installing it in your project.

## Package Manager Installation

Choose your preferred package manager:

### npm

```bash
npm install @jewel998/state-machine
```

### pnpm

```bash
pnpm add @jewel998/state-machine
```

### yarn

```bash
yarn add @jewel998/state-machine
```

## Requirements

- **Node.js**: >= 16.0.0
- **TypeScript**: >= 4.3.5 (if using TypeScript)

## Import Methods

### ES Modules (Recommended)

```javascript
import { StateMachine } from '@jewel998/state-machine';
```

### CommonJS

```javascript
const { StateMachine } = require('@jewel998/state-machine');
```

### TypeScript

```typescript
import {
  StateMachine,
  StateMachineBuilder,
  InvalidTransitionError,
  GuardConditionError,
} from '@jewel998/state-machine';
```

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

```html
<script type="module">
  import { StateMachine } from 'https://unpkg.com/@jewel998/state-machine/index.mjs';

  // Your code here
</script>
```

## Verification

Verify your installation by creating a simple state machine:

```javascript
import { StateMachine } from '@jewel998/state-machine';

const machine = StateMachine.builder()
  .initialState('idle')
  .state('idle')
  .state('active')
  .transition('idle', 'active', 'start')
  .build();

machine.start();
console.log(machine.getCurrentState()); // 'idle'

machine.sendEvent('start');
console.log(machine.getCurrentState()); // 'active'

console.log('✅ Installation successful!');
```

## Next Steps

Now that you have the library installed, continue to the [Quick Start](quick-start) guide to learn
the basics.
