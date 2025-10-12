// Async Transactions and Database Rollback Example
const { StateMachine } = require('../dist/index.js');

// Simulate database operations
class OrderDatabase {
  constructor() {
    this.orders = new Map();
    this.inventory = new Map([
      ['ITEM-001', 100],
      ['ITEM-002', 50],
    ]);
  }

  async reserveInventory(orderId, itemId, quantity) {
    console.log(
      `🔒 Reserving ${quantity} units of ${itemId} for order ${orderId}`
    );

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const available = this.inventory.get(itemId) || 0;
    if (available < quantity) {
      throw new Error(`Insufficient inventory: ${available} < ${quantity}`);
    }

    this.inventory.set(itemId, available - quantity);
    console.log(
      `✅ Reserved ${quantity} units. Remaining: ${this.inventory.get(itemId)}`
    );
  }

  async rollbackInventory(orderId, itemId, quantity, error) {
    console.log(
      `🔄 Rolling back inventory reservation for order ${orderId}: ${error.message}`
    );

    const current = this.inventory.get(itemId) || 0;
    this.inventory.set(itemId, current + quantity);
    console.log(
      `↩️  Restored ${quantity} units. New total: ${this.inventory.get(itemId)}`
    );
  }

  async chargePayment(orderId, amount) {
    console.log(`💳 Charging $${amount} for order ${orderId}`);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Simulate random payment failures
    if (Math.random() < 0.3) {
      throw new Error('Payment declined by bank');
    }

    console.log(`✅ Payment of $${amount} processed successfully`);
  }

  async rollbackPayment(orderId, amount, error) {
    console.log(
      `🔄 Rolling back payment for order ${orderId}: ${error.message}`
    );
    console.log(`↩️  Refunded $${amount}`);
  }

  async updateOrderStatus(orderId, status) {
    console.log(`📝 Updating order ${orderId} status to ${status}`);

    // Simulate database update
    await new Promise((resolve) => setTimeout(resolve, 50));

    this.orders.set(orderId, { status, updatedAt: new Date() });
    console.log(`✅ Order status updated to ${status}`);
  }
}

// Create database instance
const db = new OrderDatabase();

// Create async workflow with transactions and rollbacks
const orderWorkflow = StateMachine.definitionBuilder()
  .initialState('DRAFT')
  .state('DRAFT')
  .state('INVENTORY_RESERVED')
  .state('PAYMENT_PROCESSED')
  .state('CONFIRMED')
  .state('FAILED')

  // Reserve inventory with rollback
  .transition('DRAFT', 'INVENTORY_RESERVED', 'reserve_inventory')
  .transaction(
    async (context) => {
      await db.reserveInventory(
        context.orderId,
        context.itemId,
        context.quantity
      );
      await db.updateOrderStatus(context.orderId, 'INVENTORY_RESERVED');
    },
    async (context, error) => {
      await db.rollbackInventory(
        context.orderId,
        context.itemId,
        context.quantity,
        error
      );
    }
  )

  // Process payment with rollback
  .transition('INVENTORY_RESERVED', 'PAYMENT_PROCESSED', 'process_payment')
  .transaction(
    async (context) => {
      await db.chargePayment(context.orderId, context.amount);
      await db.updateOrderStatus(context.orderId, 'PAYMENT_PROCESSED');
    },
    async (context, error) => {
      // Rollback both payment and inventory
      await db.rollbackPayment(context.orderId, context.amount, error);
      await db.rollbackInventory(
        context.orderId,
        context.itemId,
        context.quantity,
        error
      );
    }
  )

  // Confirm order
  .transition('PAYMENT_PROCESSED', 'CONFIRMED', 'confirm')
  .action(async (context) => {
    await db.updateOrderStatus(context.orderId, 'CONFIRMED');
    console.log(`🎉 Order ${context.orderId} confirmed successfully!`);
  })

  // Failure transitions
  .transition('DRAFT', 'FAILED', 'fail')
  .transition('INVENTORY_RESERVED', 'FAILED', 'fail')
  .transition('PAYMENT_PROCESSED', 'FAILED', 'fail')

  .buildDefinition();

// Order class using async workflow
class AsyncOrder {
  constructor(id, itemId, quantity, amount) {
    this.orderId = id;
    this.itemId = itemId;
    this.quantity = quantity;
    this.amount = amount;
    this.state = 'DRAFT';
    this.history = [];
  }

  async processEvent(event) {
    console.log(
      `\n📋 Processing event '${event}' for order ${this.orderId} (current state: ${this.state})`
    );

    const result = await orderWorkflow.processEventAsync(
      this.state,
      event,
      this
    );

    if (result.success) {
      this.state = result.newState;
      this.history.push({
        event,
        fromState: this.state,
        toState: result.newState,
        timestamp: new Date(),
        transactionId: result.transactionId,
      });
      console.log(
        `✅ Transition successful: ${this.state} -> ${result.newState}`
      );
    } else {
      console.log(`❌ Transition failed: ${result.error?.message}`);
      if (result.rollbackExecuted) {
        console.log(`🔄 Rollback was executed`);
      }
    }

    return result.success;
  }

  async canProcess(event) {
    return await orderWorkflow.canTransitionAsync(this.state, event, this);
  }

  getAvailableEvents() {
    return orderWorkflow.getAvailableEvents(this.state, this);
  }
}

// Demo: Process multiple orders with async transactions
async function runAsyncDemo() {
  console.log('🚀 Starting Async Transaction Demo\n');

  // Create test orders
  const orders = [
    new AsyncOrder('ORD-001', 'ITEM-001', 5, 299.99),
    new AsyncOrder('ORD-002', 'ITEM-001', 10, 599.99),
    new AsyncOrder('ORD-003', 'ITEM-002', 3, 149.99),
    new AsyncOrder('ORD-004', 'ITEM-001', 200, 9999.99), // This will fail - insufficient inventory
  ];

  // Process orders concurrently
  const results = await Promise.allSettled(
    orders.map(async (order) => {
      console.log(`\n=== Processing Order ${order.orderId} ===`);

      try {
        // Reserve inventory
        let success = await order.processEvent('reserve_inventory');
        if (!success)
          return { orderId: order.orderId, status: 'failed_inventory' };

        // Process payment
        success = await order.processEvent('process_payment');
        if (!success)
          return { orderId: order.orderId, status: 'failed_payment' };

        // Confirm order
        success = await order.processEvent('confirm');
        if (!success)
          return { orderId: order.orderId, status: 'failed_confirm' };

        return { orderId: order.orderId, status: 'confirmed' };
      } catch (error) {
        console.log(
          `💥 Unexpected error processing ${order.orderId}: ${error.message}`
        );
        return {
          orderId: order.orderId,
          status: 'error',
          error: error.message,
        };
      }
    })
  );

  // Summary
  console.log('\n📊 Processing Summary:');
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const { orderId, status } = result.value;
      console.log(`${orderId}: ${status}`);
    } else {
      console.log(`Order ${index + 1}: rejected - ${result.reason}`);
    }
  });

  console.log('\n📦 Final Inventory Status:');
  console.log(`ITEM-001: ${db.inventory.get('ITEM-001')} units`);
  console.log(`ITEM-002: ${db.inventory.get('ITEM-002')} units`);

  console.log('\n✅ Async Transaction Demo completed!');
}

// Run the demo
runAsyncDemo().catch(console.error);
