/**
 * Example logging middleware demonstrating state machine middleware pipeline pattern
 */

const { BaseMiddleware } = require('../dist/middleware/BaseMiddleware');

class LoggingMiddleware extends BaseMiddleware {
  constructor(options = {}) {
    super('logging', {
      priority: options.priority ?? 1000, // Run late to capture all changes
      enabled: options.enabled ?? true,
    });

    this.options = {
      logLevel: options.logLevel ?? 'info',
      includeContext: options.includeContext ?? false,
      includeMetadata: options.includeMetadata ?? true,
      logGuards: options.logGuards ?? true,
      logActions: options.logActions ?? true,
      logStateChanges: options.logStateChanges ?? true,
      logTiming: options.logTiming ?? true,
    };
  }

  async onGuard(context, next, _originalGuard) {
    if (!this.options.logGuards) {
      return await next();
    }

    const startTime = this.options.logTiming ? Date.now() : 0;

    this.log('Guard evaluation starting', {
      chainId: context.chainId,
      executionOrder: context.executionOrder,
      context: this.options.includeContext ? context.currentContext : undefined,
    });

    try {
      const result = await next();

      const duration = this.options.logTiming ? Date.now() - startTime : 0;

      this.log(`Guard evaluation completed: ${result}`, {
        chainId: context.chainId,
        result,
        duration: this.options.logTiming ? `${duration}ms` : undefined,
      });

      return result;
    } catch (error) {
      const duration = this.options.logTiming ? Date.now() - startTime : 0;

      console.error('Guard evaluation failed', {
        chainId: context.chainId,
        error: error instanceof Error ? error.message : String(error),
        duration: this.options.logTiming ? `${duration}ms` : undefined,
      });

      throw error;
    }
  }

  async onAction(context, next, originalAction) {
    if (!this.options.logActions) {
      return await next();
    }

    const startTime = this.options.logTiming ? Date.now() : 0;

    this.log('Action execution starting', {
      chainId: context.chainId,
      executionOrder: context.executionOrder,
      hasOriginalAction: !!originalAction,
      context: this.options.includeContext ? context.currentContext : undefined,
    });

    try {
      const result = await next();

      const duration = this.options.logTiming ? Date.now() - startTime : 0;

      this.log('Action execution completed', {
        chainId: context.chainId,
        shouldContinue: result.shouldContinue,
        duration: this.options.logTiming ? `${duration}ms` : undefined,
        metadata: this.options.includeMetadata ? result.metadata : undefined,
      });

      return result;
    } catch (error) {
      const duration = this.options.logTiming ? Date.now() - startTime : 0;

      console.error('Action execution failed', {
        chainId: context.chainId,
        error: error instanceof Error ? error.message : String(error),
        duration: this.options.logTiming ? `${duration}ms` : undefined,
      });

      throw error;
    }
  }

  async onStateEntry(context, next, state, originalAction) {
    if (!this.options.logStateChanges) {
      return await next();
    }

    const startTime = this.options.logTiming ? Date.now() : 0;

    this.log(`Entering state: ${String(state)}`, {
      chainId: context.chainId,
      state: String(state),
      executionOrder: context.executionOrder,
      hasEntryAction: !!originalAction,
    });

    try {
      const result = await next();

      const duration = this.options.logTiming ? Date.now() - startTime : 0;

      this.log(`State entry completed: ${String(state)}`, {
        chainId: context.chainId,
        state: String(state),
        duration: this.options.logTiming ? `${duration}ms` : undefined,
      });

      return result;
    } catch (error) {
      const duration = this.options.logTiming ? Date.now() - startTime : 0;

      console.error(`State entry failed: ${String(state)}`, {
        chainId: context.chainId,
        state: String(state),
        error: error instanceof Error ? error.message : String(error),
        duration: this.options.logTiming ? `${duration}ms` : undefined,
      });

      throw error;
    }
  }

  async onStateExit(context, next, state, originalAction) {
    if (!this.options.logStateChanges) {
      return await next();
    }

    const startTime = this.options.logTiming ? Date.now() : 0;

    this.log(`Exiting state: ${String(state)}`, {
      chainId: context.chainId,
      state: String(state),
      executionOrder: context.executionOrder,
      hasExitAction: !!originalAction,
    });

    try {
      const result = await next();

      const duration = this.options.logTiming ? Date.now() - startTime : 0;

      this.log(`State exit completed: ${String(state)}`, {
        chainId: context.chainId,
        state: String(state),
        duration: this.options.logTiming ? `${duration}ms` : undefined,
      });

      return result;
    } catch (error) {
      const duration = this.options.logTiming ? Date.now() - startTime : 0;

      console.error(`State exit failed: ${String(state)}`, {
        chainId: context.chainId,
        state: String(state),
        error: error instanceof Error ? error.message : String(error),
        duration: this.options.logTiming ? `${duration}ms` : undefined,
      });

      throw error;
    }
  }

  log(message, data) {
    const logData = {
      middleware: this.name,
      ...data,
    };

    switch (this.options.logLevel) {
      case 'debug':
        console.debug(message, logData);
        break;
      case 'info':
        console.info(message, logData);
        break;
      case 'warn':
        console.warn(message, logData);
        break;
      case 'error':
        console.error(message, logData);
        break;
    }
  }
}

module.exports = { LoggingMiddleware };
