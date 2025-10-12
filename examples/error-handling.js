// Error handling example for @jewel998/state-machine
const { StateMachine } = require('../dist/index.js');

console.log('🚨 Error Handling Examples\n');

// Example 1: Invalid Transition Error
console.log('1. Invalid Transition Error:');
try {
  const machine = StateMachine.builder()
    .initialState('IDLE')
    .state('IDLE')
    .state('RUNNING')
    .transition('IDLE', 'RUNNING', 'start')
    .build();

  machine.start();
  machine.sendEventStrict('invalid_event'); // This will throw
} catch (error) {
  console.log(`   ❌ ${error.name}: ${error.message}`);
  console.log(`   📍 Error code: ${error.code}`);
  console.log(`   🔄 Available events: ${error.availableEvents?.join(', ')}\n`);
}

// Example 2: Guard Condition Error
console.log('2. Guard Condition Error:');
try {
  const machine = StateMachine.builder()
    .initialState('IDLE')
    .state('IDLE')
    .state('RUNNING')
    .transition('IDLE', 'RUNNING', 'start')
    .guard((context) => context.allowed)
    .build();

  machine.start();
  machine.sendEventStrict('start', { allowed: false }); // This will throw
} catch (error) {
  console.log(`   ❌ ${error.name}: ${error.message}`);
  console.log(`   📍 Error code: ${error.code}`);
  console.log(`   🔄 From: ${error.fromState} → To: ${error.toState}\n`);
}

// Example 3: Action Execution Error
console.log('3. Action Execution Error:');
try {
  const machine = StateMachine.builder()
    .initialState('IDLE')
    .state('IDLE')
    .state('RUNNING')
    .transition('IDLE', 'RUNNING', 'start')
    .action((context) => {
      if (context.shouldFail) {
        throw new Error('Something went wrong in action');
      }
    })
    .build();

  machine.start();
  machine.sendEvent('start', { shouldFail: true }); // This will throw
} catch (error) {
  console.log(`   ❌ ${error.name}: ${error.message}`);
  console.log(`   📍 Error code: ${error.code}`);
  console.log(`   🎯 Action type: ${error.actionType}`);
  console.log(`   🏷️  State: ${error.state}`);
  console.log(`   🔗 Original error: ${error.originalError.message}\n`);
}

// Example 4: Graceful Error Handling
console.log('4. Graceful Error Handling:');
const machine = StateMachine.builder()
  .initialState('IDLE')
  .state('IDLE')
  .state('RUNNING')
  .state('ERROR')
  .transition('IDLE', 'RUNNING', 'start')
  .transition('RUNNING', 'ERROR', 'error')
  .transition('ERROR', 'IDLE', 'reset')
  .build();

machine.start();
console.log(`   📍 Current state: ${machine.getCurrentState()}`);

// Try invalid transition (returns false instead of throwing)
const success = machine.sendEvent('invalid');
console.log(`   🔄 Invalid transition result: ${success}`);
console.log(`   📍 State unchanged: ${machine.getCurrentState()}`);

// Valid transitions
machine.sendEvent('start');
console.log(`   ✅ Started: ${machine.getCurrentState()}`);

machine.sendEvent('error');
console.log(`   ⚠️  Error occurred: ${machine.getCurrentState()}`);

machine.sendEvent('reset');
console.log(`   🔄 Reset: ${machine.getCurrentState()}`);

console.log('\n✅ Error handling examples completed!');
