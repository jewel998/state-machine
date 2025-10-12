// Basic usage example for @jewel998/state-machine
const { StateMachine } = require('../dist/index.js');

console.log('🚀 Basic State Machine Example');

// Create a simple traffic light state machine
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
console.log('🔴 Initial state:', trafficLight.getCurrentState());

// Cycle through states
console.log('🟢 Going green...');
trafficLight.sendEvent('go');
console.log('Current state:', trafficLight.getCurrentState());

console.log('🟡 Caution...');
trafficLight.sendEvent('caution');
console.log('Current state:', trafficLight.getCurrentState());

console.log('🔴 Stop...');
trafficLight.sendEvent('stop');
console.log('Current state:', trafficLight.getCurrentState());

console.log('✅ Example completed!');
