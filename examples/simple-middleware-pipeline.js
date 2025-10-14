// Simple State Machine Middleware Pipeline Example
const {
  StateMachine,
  createLoggingMiddleware,
  createValidationMiddleware,
  ValidationRules,
  BaseMiddleware,
  logger,
  LogLevel,
} = require('../dist/index.js');

console.log('🔗 Simple State Machine Middleware Pipeline Demo\n');

// Configure logging
logger.setLevel(LogLevel.INFO);
logger.setEnabled(true);

// Define context interface
const createContext = (userId, amount) => ({
  userId,
  amount,
  processed: false,
  logs: [],
});

// Custom Authentication Middleware
class AuthMiddleware extends BaseMiddleware {
  constructor() {
    super('auth', { priority: -100 }); // Run early
  }

  async onGuard(context, next) {
    console.log('🔐 Auth: Checking user permissions');

    if (!context.currentContext.userId) {
      console.log('❌ Auth failed: No user ID');
      return false;
    }

    console.log('✅ Auth passed');
    return await next();
  }

  async onAction(context, next) {
    console.log('🔐 Auth: Logging action');
    const result = await next();

    return this.createResult(
      result.context,
      result.shouldContinue,
      this.mergeMetadata(result.metadata || {}, { authenticated: true })
    );
  }
}

// Create middleware instances
const authMiddleware = new AuthMiddleware();

const validationMiddleware = createValidationMiddleware({
  priority: -50,
  rules: [
    ValidationRules.required('userId', (ctx) => ctx.userId),
    ValidationRules.range('amount', 1, 1000, (ctx) => ctx.amount),
  ],
  validateOnAction: true,
});

const loggingMiddleware = createLoggingMiddleware({
  priority: 100,
  logLevel: 'info',
  logTiming: true,
});

// Create state machine definition
const definition = StateMachine.definitionBuilder()
  .initialState('IDLE')
  .state('IDLE')
  .state('PROCESSING')
  .state('COMPLETED')

  .transition('IDLE', 'PROCESSING', 'process')
  .guard((context) => {
    console.log(`🔍 Guard: Can process ${context.userId}?`);
    return context.amount > 0;
  })
  .action((context) => {
    console.log(`📝 Action: Processing for ${context.userId}`);
    context.processed = true;
    context.logs.push('Processing started');
  })

  .transition('PROCESSING', 'COMPLETED', 'complete')
  .action((context) => {
    console.log(`✅ Action: Completed for ${context.userId}`);
    context.logs.push('Processing completed');
  })

  // Add middleware in priority order
  .addMiddleware(authMiddleware) // Priority: -100
  .addMiddleware(validationMiddleware) // Priority: -50
  .addMiddleware(loggingMiddleware) // Priority: 100

  .buildDefinition();

console.log(
  '📊 Middleware Pipeline Order:',
  definition.getPipelineOrder?.() || definition.getChainOrder()
);
console.log('');

async function runDemo() {
  // Demo 1: Successful processing
  console.log('--- Demo 1: Successful Processing ---');
  const context1 = createContext('user-123', 500);

  let result = await definition.processEventAsync('IDLE', 'process', context1);
  console.log(`Result: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  if (result.success) {
    console.log(`New state: ${result.newState}`);

    result = await definition.processEventAsync(
      result.newState,
      'complete',
      result.context
    );
    console.log(`Final result: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Final state: ${result.newState}`);
    console.log(`Context logs: ${result.context.logs.join(', ')}`);
  }

  console.log('\n--- Demo 2: Authentication Failure ---');
  const context2 = createContext(null, 500); // No user ID

  result = await definition.processEventAsync('IDLE', 'process', context2);
  console.log(`Result: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  if (!result.success) {
    console.log(`Error: ${result.error?.message || 'Unknown error'}`);
  }

  console.log('\n--- Demo 3: Validation Failure ---');
  const context3 = createContext('user-456', 2000); // Amount too high

  result = await definition.processEventAsync('IDLE', 'process', context3);
  console.log(`Result: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  if (!result.success) {
    console.log(`Error: ${result.error?.message || 'Unknown error'}`);
  }

  console.log('\n✅ Simple middleware demo completed!');
}

// Run the demo
runDemo().catch(console.error);
