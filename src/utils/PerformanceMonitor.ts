/**
 * Performance monitoring utilities
 */

export interface PerformanceMetrics {
  readonly executionTime: number;
  readonly memoryUsage?: NodeJS.MemoryUsage | undefined;
  readonly timestamp: Date;
}

export class PerformanceMonitor {
  private static readonly measurements: Map<string, number> = new Map();

  public static startMeasurement(id: string): void {
    this.measurements.set(id, performance.now());
  }

  public static endMeasurement(id: string): number {
    const startTime = this.measurements.get(id);
    if (!startTime) {
      throw new Error(`No measurement started for id: ${id}`);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    this.measurements.delete(id);
    return duration;
  }

  public static measureSync<T>(fn: () => T): {
    result: T;
    metrics: PerformanceMetrics;
  } {
    const startTime = performance.now();
    const memoryBefore = this.getMemoryUsage();

    const result = fn();

    const endTime = performance.now();
    const memoryAfter = this.getMemoryUsage();

    return {
      result,
      metrics: {
        executionTime: endTime - startTime,
        memoryUsage: memoryAfter
          ? {
              rss: memoryAfter.rss - (memoryBefore?.rss || 0),
              heapTotal: memoryAfter.heapTotal - (memoryBefore?.heapTotal || 0),
              heapUsed: memoryAfter.heapUsed - (memoryBefore?.heapUsed || 0),
              external: memoryAfter.external - (memoryBefore?.external || 0),
              arrayBuffers:
                memoryAfter.arrayBuffers - (memoryBefore?.arrayBuffers || 0),
            }
          : undefined,
        timestamp: new Date(),
      },
    };
  }

  public static async measureAsync<T>(
    fn: () => Promise<T>
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const startTime = performance.now();
    const memoryBefore = this.getMemoryUsage();

    const result = await fn();

    const endTime = performance.now();
    const memoryAfter = this.getMemoryUsage();

    return {
      result,
      metrics: {
        executionTime: endTime - startTime,
        memoryUsage: memoryAfter
          ? {
              rss: memoryAfter.rss - (memoryBefore?.rss || 0),
              heapTotal: memoryAfter.heapTotal - (memoryBefore?.heapTotal || 0),
              heapUsed: memoryAfter.heapUsed - (memoryBefore?.heapUsed || 0),
              external: memoryAfter.external - (memoryBefore?.external || 0),
              arrayBuffers:
                memoryAfter.arrayBuffers - (memoryBefore?.arrayBuffers || 0),
            }
          : undefined,
        timestamp: new Date(),
      },
    };
  }

  private static getMemoryUsage(): NodeJS.MemoryUsage | undefined {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage();
    }
    return undefined;
  }
}
