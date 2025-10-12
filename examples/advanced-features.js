// Advanced features example for @jewel998/state-machine
const { StateMachine, logger, LogLevel } = require('../dist/index.js');

console.log('🚀 Advanced State Machine Features Demo\n');

// Configure logging for development
logger.setLevel(LogLevel.DEBUG);
logger.setEnabled(true);

// Define a complex order processing context
const createOrderContext = (orderId, amount, customerType = 'regular') => ({
  orderId,
  amount,
  customerType,
  approvals: [],
  notifications: [],
  processedAt: new Date(),

  // Helper methods
  addApproval: function (approver) {
    this.approvals.push({ approver, timestamp: new Date() });
  },

  addNotification: function (message) {
    this.notifications.push({ message, timestamp: new Date() });
  },

  requiresManagerApproval: function () {
    return this.amount > 1000;
  },

  isVipCustomer: function () {
    return this.customerType === 'vip';
  },
});

// Create an advanced state machine with observers and history
const orderMachine = StateMachine.builder()
  .initialState('DRAFT')

  // Define all states
  .state('DRAFT')
  .state('PENDING_REVIEW')
  .state('PENDING_MANAGER_APPROVAL')
  .state('APPROVED')
  .state('REJECTED')
  .state('PROCESSING')
  .state('SHIPPED')
  .state('DELIVERED')
  .state('CANCELLED')

  // Basic workflow transitions
  .transition('DRAFT', 'PENDING_REVIEW', 'submit')
  .action((context) => {
    context.addNotification('Order submitted for review');
    console.log(`📝 Order ${context.orderId} submitted for review`);
  })

  // Conditional transitions based on amount
  .transition('PENDING_REVIEW', 'PENDING_MANAGER_APPROVAL', 'review_high_value')
  .guard((context) => context.requiresManagerApproval())
  .action((context) => {
    context.addNotification('Requires manager approval due to high amount');
    console.log(
      `⚠️  Order ${context.orderId} requires manager approval (amount: $${context.amount})`
    );
  })

  .transition('PENDING_REVIEW', 'APPROVED', 'review_auto_approve')
  .guard((context) => !context.requiresManagerApproval())
  .action((context) => {
    context.addApproval('system');
    context.addNotification('Automatically approved');
    console.log(`✅ Order ${context.orderId} automatically approved`);
  })

  // Manager approval flow
  .transition('PENDING_MANAGER_APPROVAL', 'APPROVED', 'manager_approve')
  .action((context) => {
    context.addApproval('manager');
    context.addNotification('Manager approved');
    console.log(`👨‍💼 Manager approved order ${context.orderId}`);
  })

  .transition('PENDING_MANAGER_APPROVAL', 'REJECTED', 'manager_reject')
  .action((context) => {
    context.addNotification('Manager rejected');
    console.log(`❌ Manager rejected order ${context.orderId}`);
  })

  // Processing flow
  .transition('APPROVED', 'PROCESSING', 'start_processing')
  .action((context) => {
    context.addNotification('Processing started');
    console.log(`🔄 Started processing order ${context.orderId}`);
  })

  // VIP customers get priority shipping
  .transition('PROCESSING', 'SHIPPED', 'ship_vip')
  .guard((context) => context.isVipCustomer())
  .action((context) => {
    context.addNotification('VIP priority shipping');
    console.log(`🚚 VIP order ${context.orderId} shipped with priority`);
  })

  .transition('PROCESSING', 'SHIPPED', 'ship_standard')
  .guard((context) => !context.isVipCustomer())
  .action((context) => {
    context.addNotification('Standard shipping');
    console.log(`📦 Order ${context.orderId} shipped`);
  })

  .transition('SHIPPED', 'DELIVERED', 'deliver')
  .action((context) => {
    context.addNotification('Order delivered');
    console.log(`🎉 Order ${context.orderId} delivered successfully`);
  })

  // Cancellation flow (available from multiple states)
  .transition('DRAFT', 'CANCELLED', 'cancel')
  .transition('PENDING_REVIEW', 'CANCELLED', 'cancel')
  .transition('PENDING_MANAGER_APPROVAL', 'CANCELLED', 'cancel')
  .transition('APPROVED', 'CANCELLED', 'cancel')

  // State entry/exit actions
  .onStateEntry('PENDING_REVIEW', (context) => {
    context.addNotification('Entered review queue');
    console.log(`📋 Order ${context.orderId} entered review queue`);
  })

  .onStateEntry('PROCESSING', (context) => {
    context.addNotification('Processing started');
    console.log(`⚙️  Order ${context.orderId} processing started`);
  })

  .onStateExit('PROCESSING', (context) => {
    context.addNotification('Processing completed');
    console.log(`✅ Order ${context.orderId} processing completed`);
  })

  // Configure with advanced options
  .withOptions({
    enableLogging: true,
    enableObservers: true,
    enableHistory: true,
    maxHistorySize: 100,
    strictMode: false,
  })

  .build();

// Create an observer to track state changes
const orderObserver = {
  onStateChange: (event) => {
    console.log(
      `🔄 State changed: ${event.fromState} → ${event.toState} (event: ${event.event})`
    );
    console.log(`   📊 Notifications: ${event.context.notifications.length}`);
    console.log(`   👥 Approvals: ${event.context.approvals.length}`);
  },

  onTransitionAttempt: (event) => {
    if (!event.success) {
      console.log(
        `❌ Transition attempt failed: ${event.currentState} + ${event.event}`
      );
    }
  },
};

// Subscribe to state changes
orderMachine.subscribe(orderObserver);

console.log('🎬 Starting order processing demo...\n');

// Demo 1: Regular order (auto-approved)
console.log('--- Demo 1: Regular Order ($500) ---');
const regularOrder = createOrderContext('ORD-001', 500, 'regular');

orderMachine.start();
console.log(`Initial state: ${orderMachine.getCurrentState()}`);

orderMachine.sendEvent('submit', regularOrder);
orderMachine.sendEvent('review_auto_approve', regularOrder);
orderMachine.sendEvent('start_processing', regularOrder);
orderMachine.sendEvent('ship_standard', regularOrder);
orderMachine.sendEvent('deliver', regularOrder);

console.log(`Final state: ${orderMachine.getCurrentState()}`);
console.log(`Order notifications: ${regularOrder.notifications.length}`);
console.log('\n');

// Demo 2: High-value order requiring manager approval
console.log('--- Demo 2: High-Value Order ($2000) ---');
orderMachine.reset();
const highValueOrder = createOrderContext('ORD-002', 2000, 'regular');

orderMachine.sendEvent('submit', highValueOrder);
orderMachine.sendEvent('review_high_value', highValueOrder);
console.log(`Current state: ${orderMachine.getCurrentState()}`);
console.log('Available events:', orderMachine.getAvailableEvents());

orderMachine.sendEvent('manager_approve', highValueOrder);
orderMachine.sendEvent('start_processing', highValueOrder);
orderMachine.sendEvent('ship_standard', highValueOrder);
orderMachine.sendEvent('deliver', highValueOrder);

console.log(`Final state: ${orderMachine.getCurrentState()}`);
console.log('\n');

// Demo 3: VIP customer order
console.log('--- Demo 3: VIP Customer Order ($1500) ---');
orderMachine.reset();
const vipOrder = createOrderContext('ORD-003', 1500, 'vip');

orderMachine.sendEvent('submit', vipOrder);
orderMachine.sendEvent('review_high_value', vipOrder);
orderMachine.sendEvent('manager_approve', vipOrder);
orderMachine.sendEvent('start_processing', vipOrder);
orderMachine.sendEvent('ship_vip', vipOrder); // Should use VIP shipping
orderMachine.sendEvent('deliver', vipOrder);

console.log(`Final state: ${orderMachine.getCurrentState()}`);
console.log('\n');

// Demo 4: Order cancellation
console.log('--- Demo 4: Order Cancellation ---');
orderMachine.reset();
const cancelledOrder = createOrderContext('ORD-004', 800, 'regular');

orderMachine.sendEvent('submit', cancelledOrder);
orderMachine.sendEvent('cancel', cancelledOrder);

console.log(`Final state: ${orderMachine.getCurrentState()}`);
console.log('\n');

// Show statistics and history
console.log('--- Statistics ---');
const stats = orderMachine.getStatistics();
console.log(`Total transitions: ${stats.totalTransitions}`);
console.log(`Successful transitions: ${stats.successfulTransitions}`);
console.log(`Failed transitions: ${stats.failedTransitions}`);
console.log(
  `Average transition time: ${stats.averageTransitionTime.toFixed(2)}ms`
);
console.log(`State visit counts:`, stats.stateVisitCounts);
console.log(`Event counts:`, stats.eventCounts);

console.log('\n--- History (last 5 events) ---');
const history = orderMachine.getHistory();
history.slice(-5).forEach((event, index) => {
  console.log(
    `${index + 1}. ${event.fromState} → ${event.toState} (${event.event}) at ${event.timestamp.toISOString()}`
  );
});

console.log('\n✅ Advanced features demo completed!');

// Cleanup
orderMachine.unsubscribe(orderObserver);
