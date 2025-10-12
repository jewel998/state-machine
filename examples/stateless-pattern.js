// Stateless Pattern: Zero Per-Object Overhead
const { StateMachine } = require('../dist/index.js');

console.log('🚀 Stateless Pattern Demo: Efficient State Management\n');

// 1. Create a STATELESS definition (no current state stored)
const orderWorkflow = StateMachine.definitionBuilder()
  .initialState('PENDING')
  .state('PENDING')
  .state('APPROVED')
  .state('REJECTED')
  .state('SHIPPED')
  .transition('PENDING', 'APPROVED', 'approve')
  .guard((context) => context.amount < 10000)
  .transition('PENDING', 'REJECTED', 'reject')
  .transition('APPROVED', 'SHIPPED', 'ship')
  .buildDefinition(); // Returns definition, not instance

// 2. Objects just track their state
class Order {
  constructor(id, amount) {
    this.id = id;
    this.amount = amount;
    this.state = 'PENDING'; // Just the state value - no state machine instance!
  }

  processEvent(event) {
    // Use the shared definition to compute next state
    const result = orderWorkflow.processEvent(this.state, event, this);
    if (result.success) {
      this.state = result.newState;
      console.log(`📦 Order ${this.id}: ${event} -> ${this.state}`);
    } else {
      console.log(`❌ Order ${this.id}: ${event} failed`);
    }
    return result.success;
  }

  canProcess(event) {
    return orderWorkflow.canTransition(this.state, event, this);
  }

  getAvailableEvents() {
    return orderWorkflow.getAvailableEvents(this.state, this);
  }
}

// 3. Demo: Process multiple orders efficiently
console.log('Creating orders...');
const orders = [
  new Order('ORD-001', 500), // Low amount - auto approve
  new Order('ORD-002', 15000), // High amount - will be rejected by guard
  new Order('ORD-003', 2000), // Medium amount - can approve
];

console.log('\nProcessing orders:');
orders.forEach((order) => {
  console.log(`\n📋 Processing ${order.id} ($${order.amount})`);
  console.log(`Available events: ${order.getAvailableEvents().join(', ')}`);

  if (order.canProcess('approve')) {
    order.processEvent('approve');

    if (order.canProcess('ship')) {
      order.processEvent('ship');
    }
  } else {
    order.processEvent('reject');
  }
});

// 4. Scalability demo: 1M objects with ONE definition
console.log('\n🚀 Scalability Test: 1M orders with shared definition');
const start = Date.now();

const millionOrders = Array.from(
  { length: 1000000 },
  (_, i) => new Order(`ORD-${i}`, Math.random() * 20000)
);

// Process all orders
let processed = 0;
millionOrders.forEach((order) => {
  if (order.canProcess('approve')) {
    if (order.processEvent('approve')) {
      processed++;
    }
  }
});

const end = Date.now();
console.log(
  `✅ Processed ${processed.toLocaleString()} orders in ${end - start}ms`
);
console.log(`📊 Memory efficient: 1M objects share ONE workflow definition`);
console.log(
  `⚡ Performance: ${Math.round((processed / (end - start)) * 1000).toLocaleString()} ops/sec`
);

console.log('\n🎯 Key Benefits:');
console.log('• Zero per-object state machine overhead');
console.log('• Shared workflow definition across all objects');
console.log('• Linear memory scaling: O(n + m) vs O(n × m)');
console.log('• Massive performance improvement for high-volume scenarios');
