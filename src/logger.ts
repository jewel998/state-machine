/**
 * Logger utility with production-safe logging controls
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LoggerConfig {
  level: LogLevel;
  enabled: boolean;
  prefix?: string;
}

export interface ILogger {
  error(message: string, ...args: readonly unknown[]): void;
  warn(message: string, ...args: readonly unknown[]): void;
  info(message: string, ...args: readonly unknown[]): void;
  debug(message: string, ...args: readonly unknown[]): void;
  setLevel(level: LogLevel): void;
  setEnabled(enabled: boolean): void;
}

/**
 * Production-safe logger implementation
 * Uses Singleton pattern to ensure consistent logging configuration
 */
export class Logger implements ILogger {
  private static instance: Logger;
  private config: LoggerConfig;

  private constructor() {
    this.config = {
      level: this.getDefaultLogLevel(),
      enabled: this.isLoggingEnabled(),
      prefix: '[StateMachine]',
    };
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private getDefaultLogLevel(): LogLevel {
    if (typeof process !== 'undefined' && process.env) {
      const envLevel = process.env['STATE_MACHINE_LOG_LEVEL']?.toUpperCase();
      switch (envLevel) {
        case 'ERROR':
          return LogLevel.ERROR;
        case 'WARN':
          return LogLevel.WARN;
        case 'INFO':
          return LogLevel.INFO;
        case 'DEBUG':
          return LogLevel.DEBUG;
        default:
          return LogLevel.WARN;
      }
    }
    return LogLevel.WARN;
  }

  private isLoggingEnabled(): boolean {
    if (typeof process !== 'undefined' && process.env) {
      const nodeEnv = process.env['NODE_ENV'];
      const explicitlyEnabled = process.env['STATE_MACHINE_LOGGING'] === 'true';

      // Disable logging in production unless explicitly enabled
      if (nodeEnv === 'production' && !explicitlyEnabled) {
        return false;
      }

      // Disable if explicitly disabled
      if (process.env['STATE_MACHINE_LOGGING'] === 'false') {
        return false;
      }
    }

    // Default to enabled in development
    return true;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enabled && level <= this.config.level;
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `${timestamp} ${this.config.prefix} [${level}] ${message}`;
  }

  public error(message: string, ...args: readonly unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message), ...args);
    }
  }

  public warn(message: string, ...args: readonly unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }

  public info(message: string, ...args: readonly unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message), ...args);
    }
  }

  public debug(message: string, ...args: readonly unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('DEBUG', message), ...args);
    }
  }

  public setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
