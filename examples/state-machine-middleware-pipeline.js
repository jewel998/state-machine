// State Machine Middleware Pipeline Example
const {
  StateMachine,
  createLoggingMiddleware,
  createValidationMiddleware,
  createMetricsMiddleware,
  BaseMiddleware,
  ValidationRules,
  InMemoryMetricsCollector,
  logger,
  LogLevel,
} = require('../dist/index.js');

console.log('🔗 State Machine Middleware Pipeline Demo\n');

// Configure logging
logger.setLevel(LogLevel.DEBUG);
logger.setEnabled(true);

// Define context interface
const createOrderContext = (
  orderId,
  amount,
  customerType = 'regular',
  userId = null
) => ({
  orderId,
  amount,
  customerType,
  userId,
  processedAt: new Date(),
  validationErrors: [],
  auditLog: [],

  addAuditEntry: function (action, details) {
    this.auditLog.push({
      action,
      details,
      timestamp: new Date(),
      userId: this.userId,
    });
  },
});

// Custom Authentication Middleware using BaseMiddleware
class AuthenticationMiddleware extends BaseMiddleware {
  constructor() {
    super('authentication', { priority: -1000 }); // Run first
  }

  async onGuard(context, next, _originalGuard) {
    console.log('🔐 Authentication: Checking user permissions');

    if (!context.currentContext.userId) {
      console.log('❌ Authentication failed: No user ID');
      return false;
    }

    // Simulate user permission check
    const hasPermission = context.currentContext.userId !== 'blocked-user';
    if (!hasPermission) {
      console.log('❌ Authentication failed: User blocked');
      return false;
    }

    console.log('✅ Authentication passed');
    context.currentContext.addAuditEntry('auth_check', 'User authenticated');

    return await next();
  }

  async onAction(context, next, _originalAction) {
    console.log('🔐 Authentication: Logging action execution');

    const startTime = Date.now();
    const result = await next();
    const duration = Date.now() - startTime;

    context.currentContext.addAuditEntry('action_executed', {
      duration: `${duration}ms`,
      user: context.currentContext.userId,
    });

    return this.createResult(
      result.context,
      result.shouldContinue,
      this.mergeMetadata(result.metadata || {}, {
        authenticated: true,
        executionTime: duration,
      })
    );
  }
}

// Custom Business Rules Middleware
class BusinessRulesMiddleware extends BaseMiddleware {
  constructor() {
    super('business-rules', { priority: -200 }); // Run after auth, before validation
  }

  async onAction(context, next, _originalAction) {
    console.log('📋 Business Rules: Applying business logic');

    const ctx = context.currentContext;

    // Apply VIP customer discount
    if (ctx.customerType === 'vip' && ctx.amount > 500) {
      const discount = ctx.amount * 0.1;
      ctx.amount = ctx.amount - discount;
      ctx.addAuditEntry('discount_applied', {
        discount,
        newAmount: ctx.amount,
      });
      console.log(`💰 VIP discount applied: $${discount.toFixed(2)}`);
    }

    // Apply business hour surcharge
    const hour = new Date().getHours();
    if (hour < 9 || hour > 17) {
      const surcharge = ctx.amount * 0.05;
      ctx.amount = ctx.amount + surcharge;
      ctx.addAuditEntry('surcharge_applied', {
        surcharge,
        newAmount: ctx.amount,
      });
      console.log(`⏰ After-hours surcharge applied: $${surcharge.toFixed(2)}`);
    }

    const result = await next();

    return this.createResult(
      result.context,
      result.shouldContinue,
      this.mergeMetadata(result.metadata || {}, {
        businessRulesApplied: true,
        finalAmount: ctx.amount,
      })
    );
  }
}

// Create middleware instances
const authMiddleware = new AuthenticationMiddleware();

const validationMiddleware = createValidationMiddleware({
  priority: -100,
  rules: [
    ValidationRules.required('orderId', (ctx) => ctx.orderId),
    ValidationRules.required('userId', (ctx) => ctx.userId),
    ValidationRules.type('amount', 'number', (ctx) => ctx.amount),
    ValidationRules.range('amount', 1, 10000, (ctx) => ctx.amount),
    ValidationRules.custom('valid-customer-type', (ctx) =>
      ['regular', 'vip', 'premium'].includes(ctx.customerType)
    ),
  ],
  stopOnFirstError: false,
  validateOnGuard: true,
  validateOnAction: true,
});

const businessRulesMiddleware = new BusinessRulesMiddleware();

const metricsCollector = new InMemoryMetricsCollector();
const metricsMiddleware = createMetricsMiddleware({
  priority: 800,
  collector: metricsCollector,
  prefix: 'order_system',
  collectTimingMetrics: true,
  collectErrorMetrics: true,
  defaultTags: { service: 'order-processing' },
});

const loggingMiddleware = createLoggingMiddleware({
  priority: 900,
  logLevel: 'info',
  includeContext: false,
  includeMetadata: true,
  logTiming: true,
});

// Create state machine with middleware pipeline
const orderDefinition = StateMachine.definitionBuilder()
  .initialState('DRAFT')

  .state('DRAFT')
  .state('VALIDATING')
  .state('PROCESSING')
  .state('COMPLETED')
  .state('REJECTED')

  .transition('DRAFT', 'VALIDATING', 'validate')
  .guard((context) => {
    console.log(
      `🔍 Guard: Checking if order ${context.orderId} can be validated`
    );
    return context.amount > 0;
  })
  .action((context) => {
    console.log(`📝 Action: Starting validation for order ${context.orderId}`);
    context.addAuditEntry('validation_started', { orderId: context.orderId });
  })

  .transition('VALIDATING', 'PROCESSING', 'approve')
  .action((context) => {
    console.log(`✅ Action: Order ${context.orderId} approved for processing`);
    context.addAuditEntry('order_approved', { amount: context.amount });
  })

  .transition('VALIDATING', 'REJECTED', 'reject')
  .action((context) => {
    console.log(`❌ Action: Order ${context.orderId} rejected`);
    context.addAuditEntry('order_rejected', { reason: 'validation_failed' });
  })

  .transition('PROCESSING', 'COMPLETED', 'complete')
  .action((context) => {
    console.log(`🎉 Action: Order ${context.orderId} completed`);
    context.addAuditEntry('order_completed', { finalAmount: context.amount });
  })

  // Add middleware in priority order (they will be sorted automatically)
  .addMiddleware(loggingMiddleware) // Priority: 900
  .addMiddleware(metricsMiddleware) // Priority: 800
  .addMiddleware(businessRulesMiddleware) // Priority: -200
  .addMiddleware(validationMiddleware) // Priority: -100
  .addMiddleware(authMiddleware) // Priority: -1000

  .buildDefinition();

// Create a stateful machine from the definition
const orderMachine = {
  definition: orderDefinition,
  currentState: 'DRAFT',

  start() {
    this.currentState = this.definition.getInitialState();
  },

  getCurrentState() {
    return this.currentState;
  },

  async sendEventAsync(event, context) {
    const result = await this.definition.processEventAsync(
      this.currentState,
      event,
      context
    );
    if (result.success) {
      this.currentState = result.newState;
      if (result.context) {
        Object.assign(context, result.context);
      }
    }
    return result;
  },

  reset() {
    this.currentState = this.definition.getInitialState();
  },

  getDefinition() {
    return this.definition;
  },
};

console.log(
  '📊 Middleware Pipeline Order:',
  orderMachine.getDefinition().getPipelineOrder?.() ||
    orderMachine.getDefinition().getChainOrder?.() ||
    'Not available'
);
console.log('');

async function runDemo() {
  // Demo 1: Successful order processing
  console.log('--- Demo 1: Successful VIP Order ---');
  const vipOrder = createOrderContext('ORD-001', 1000, 'vip', 'user-123');

  orderMachine.start();
  console.log(`Initial state: ${orderMachine.getCurrentState()}`);

  try {
    await orderMachine.sendEventAsync('validate', vipOrder);
    console.log(`After validation: ${orderMachine.getCurrentState()}`);

    await orderMachine.sendEventAsync('approve', vipOrder);
    console.log(`After approval: ${orderMachine.getCurrentState()}`);

    await orderMachine.sendEventAsync('complete', vipOrder);
    console.log(`Final state: ${orderMachine.getCurrentState()}`);

    console.log('\n📋 Audit Log:');
    vipOrder.auditLog.forEach((entry, i) => {
      console.log(
        `  ${i + 1}. ${entry.action}: ${JSON.stringify(entry.details)} (${entry.timestamp.toISOString()})`
      );
    });
  } catch (error) {
    console.error('❌ Order processing failed:', error.message);
  }

  console.log('\n');

  // Demo 2: Failed authentication
  console.log('--- Demo 2: Authentication Failure ---');
  orderMachine.reset();
  const blockedOrder = createOrderContext(
    'ORD-002',
    500,
    'regular',
    'blocked-user'
  );

  try {
    await orderMachine.sendEventAsync('validate', blockedOrder);
  } catch (error) {
    console.log('❌ Expected authentication failure:', error.message);
  }

  console.log('\n');

  // Demo 3: Validation failure
  console.log('--- Demo 3: Validation Failure ---');
  orderMachine.reset();
  const invalidOrder = createOrderContext(
    'ORD-003',
    -100,
    'invalid-type',
    'user-456'
  );

  try {
    await orderMachine.sendEventAsync('validate', invalidOrder);
  } catch (error) {
    console.log('❌ Expected validation failure:', error.message);
  }

  console.log('\n');

  // Demo 4: Business rules application
  console.log('--- Demo 4: After-Hours Order with Business Rules ---');
  orderMachine.reset();

  // Simulate after-hours order
  const afterHoursOrder = createOrderContext(
    'ORD-004',
    600,
    'regular',
    'user-789'
  );

  try {
    await orderMachine.sendEventAsync('validate', afterHoursOrder);
    await orderMachine.sendEventAsync('approve', afterHoursOrder);
    await orderMachine.sendEventAsync('complete', afterHoursOrder);

    console.log(
      `Final amount after business rules: $${afterHoursOrder.amount}`
    );
  } catch (error) {
    console.error('❌ Order processing failed:', error.message);
  }

  console.log('\n');

  // Show collected metrics
  console.log('--- Collected Metrics ---');
  const metrics = metricsMiddleware.getCollectedMetrics();
  if (metrics) {
    metrics.forEach((data, metric) => {
      if (data.count > 0) {
        console.log(
          `${metric}: count=${data.count}, avg=${data.values.length > 0 ? (data.values.reduce((a, b) => a + b, 0) / data.values.length).toFixed(2) : 'N/A'}ms`
        );
      }
    });
  } else {
    console.log('No metrics available (using external collector)');
  }

  console.log('\n✅ State machine middleware pipeline demo completed!');
}

// Run the demo
runDemo().catch(console.error);
