/**
 * Comprehensive benchmark suite for stateless state machine performance testing
 */

import { StateMachine } from '@/core/StateMachine';
import { PerformanceMonitor } from '@/utils/PerformanceMonitor';

export interface BenchmarkResult {
  readonly testName: string;
  readonly iterations: number;
  readonly totalTime: number;
  readonly averageTime: number;
  readonly minTime: number;
  readonly maxTime: number;
  readonly memoryUsage: {
    readonly initial: NodeJS.MemoryUsage;
    readonly final: NodeJS.MemoryUsage;
    readonly peak: NodeJS.MemoryUsage;
  };
  readonly throughput: number; // operations per second
}

export interface BenchmarkSuiteResult {
  readonly results: readonly BenchmarkResult[];
  readonly summary: {
    readonly totalTests: number;
    readonly totalTime: number;
    readonly averageThroughput: number;
  };
}

export class BenchmarkSuite {
  private readonly results: BenchmarkResult[] = [];

  public async runStateMachineCreationBenchmark(
    iterations = 100000
  ): Promise<BenchmarkResult> {
    const testName = 'StateMachine Definition Creation';
    const initialMemory = this.getMemoryUsage();
    let peakMemory = initialMemory;

    console.log(
      `Running StateMachine Definition Creation benchmark with ${iterations.toLocaleString()} iterations...`
    );
    const batchSize = Math.min(10000, iterations);

    // Use sampling for large tests
    const useSampling = iterations > 50000;
    const sampleSize = useSampling
      ? Math.min(5000, Math.floor(iterations / 20))
      : iterations;
    const sampleInterval = useSampling
      ? Math.floor(iterations / sampleSize)
      : 1;

    const times: number[] = [];
    let totalTime = 0;

    for (let batch = 0; batch < Math.ceil(iterations / batchSize); batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, iterations);

      for (let i = batchStart; i < batchEnd; i++) {
        const { metrics } = PerformanceMonitor.measureSync(() => {
          return StateMachine.definitionBuilder()
            .initialState('IDLE')
            .state('IDLE')
            .state('RUNNING')
            .state('COMPLETED')
            .state('ERROR')
            .transition('IDLE', 'RUNNING', 'start')
            .transition('RUNNING', 'COMPLETED', 'finish')
            .transition('RUNNING', 'ERROR', 'error')
            .transition('ERROR', 'IDLE', 'reset')
            .guard((context: any) => context?.isValid !== false)
            .action((context: any) => {
              if (context) context.processed = true;
            })
            .buildDefinition();
        });

        totalTime += metrics.executionTime;

        // Sample timing data for large tests
        if (!useSampling || i % sampleInterval === 0) {
          times.push(metrics.executionTime);
        }
      }

      // Check memory every batch to avoid excessive memory usage tracking
      const currentMemory = this.getMemoryUsage();
      if (currentMemory.heapUsed > peakMemory.heapUsed) {
        peakMemory = currentMemory;
      }

      // Progress indicator for large benchmarks
      if (batch % 10 === 0 && batch > 0) {
        const progress = (((batch * batchSize) / iterations) * 100).toFixed(1);
        console.log(
          `  Progress: ${progress}% (${(batch * batchSize).toLocaleString()}/${iterations.toLocaleString()})`
        );
      }
    }

    const finalMemory = this.getMemoryUsage();
    const result = this.calculateBenchmarkResultOptimized(
      testName,
      iterations,
      times,
      totalTime,
      initialMemory,
      finalMemory,
      peakMemory
    );
    this.results.push(result);
    return result;
  }

  public async runTransitionBenchmark(
    iterations = 1000000
  ): Promise<BenchmarkResult> {
    const testName = 'Stateless Transitions';
    const initialMemory = this.getMemoryUsage();
    let peakMemory = initialMemory;

    console.log(
      `Running Stateless Transitions benchmark with ${iterations.toLocaleString()} iterations...`
    );

    // Create a stateless definition for realistic server testing
    const definition = StateMachine.definitionBuilder()
      .initialState('IDLE')
      .state('IDLE')
      .state('PROCESSING')
      .state('VALIDATING')
      .state('COMPLETED')
      .state('ERROR')
      .state('RETRY')
      .transition('IDLE', 'PROCESSING', 'start')
      .transition('PROCESSING', 'VALIDATING', 'validate')
      .transition('VALIDATING', 'COMPLETED', 'approve')
      .guard((context: any) => context.isValid)
      .transition('VALIDATING', 'ERROR', 'reject')
      .guard((context: any) => !context.isValid)
      .transition('ERROR', 'RETRY', 'retry')
      .transition('RETRY', 'PROCESSING', 'restart')
      .transition('COMPLETED', 'IDLE', 'reset')
      .action((context: any) => {
        context.counter++;
      })
      .buildDefinition();

    const batchSize = Math.min(100000, iterations);

    // For large tests, use statistical sampling instead of storing all times
    const useSampling = iterations > 100000;
    const sampleSize = useSampling
      ? Math.min(10000, Math.floor(iterations / 100))
      : iterations;
    const sampleInterval = useSampling
      ? Math.floor(iterations / sampleSize)
      : 1;

    const times: number[] = [];
    let totalTime = 0;

    for (let batch = 0; batch < Math.ceil(iterations / batchSize); batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, iterations);

      for (let i = batchStart; i < batchEnd; i++) {
        // Create context for this iteration
        const context = {
          counter: 0,
          isValid: i % 10 !== 0, // 10% failure rate
          objectId: `obj_${i}`,
        };
        let currentState: string = 'IDLE';

        const { metrics } = PerformanceMonitor.measureSync(() => {
          let event: string;

          switch (currentState) {
            case 'IDLE':
              event = 'start';
              break;
            case 'PROCESSING':
              event = 'validate';
              break;
            case 'VALIDATING':
              event = context.isValid ? 'approve' : 'reject';
              break;
            case 'COMPLETED':
              event = 'reset';
              break;
            case 'ERROR':
              event = 'retry';
              break;
            case 'RETRY':
              event = 'restart';
              break;
            default:
              event = 'reset';
          }

          const result = definition.processEvent(currentState, event, context);
          if (result.success) {
            currentState = result.newState as string;
          }
          return result.success;
        });

        totalTime += metrics.executionTime;

        // Sample timing data for large tests
        if (!useSampling || i % sampleInterval === 0) {
          times.push(metrics.executionTime);
        }
      }

      // Check memory periodically
      if (batch % 10 === 0) {
        const currentMemory = this.getMemoryUsage();
        if (currentMemory.heapUsed > peakMemory.heapUsed) {
          peakMemory = currentMemory;
        }

        if (batch > 0) {
          const progress = (((batch * batchSize) / iterations) * 100).toFixed(
            1
          );
          console.log(
            `  Progress: ${progress}% (${(batch * batchSize).toLocaleString()}/${iterations.toLocaleString()})`
          );
        }
      }
    }

    const finalMemory = this.getMemoryUsage();
    const result = this.calculateBenchmarkResultOptimized(
      testName,
      iterations,
      times,
      totalTime,
      initialMemory,
      finalMemory,
      peakMemory
    );
    this.results.push(result);
    return result;
  }

  public async runComplexWorkflowBenchmark(
    iterations = 50000
  ): Promise<BenchmarkResult> {
    const testName = 'Complex Stateless Workflow';
    const times: number[] = [];
    const initialMemory = this.getMemoryUsage();
    let peakMemory = initialMemory;

    console.log(
      `Running Complex Stateless Workflow benchmark with ${iterations.toLocaleString()} iterations...`
    );
    const batchSize = Math.min(5000, iterations);

    // Create ONE shared definition for all iterations
    const orderDefinition = StateMachine.definitionBuilder()
      .initialState('ORDER_RECEIVED')
      .state('ORDER_RECEIVED')
      .state('PAYMENT_PROCESSING')
      .state('PAYMENT_VERIFIED')
      .state('INVENTORY_CHECK')
      .state('INVENTORY_RESERVED')
      .state('SHIPPING_PREPARED')
      .state('SHIPPED')
      .state('DELIVERED')
      .state('PAYMENT_FAILED')
      .state('OUT_OF_STOCK')
      .state('CANCELLED')
      .state('REFUNDED')
      // Happy path
      .transition('ORDER_RECEIVED', 'PAYMENT_PROCESSING', 'process_payment')
      .transition('PAYMENT_PROCESSING', 'PAYMENT_VERIFIED', 'payment_success')
      .guard((context: any) => context.paymentValid)
      .transition('PAYMENT_PROCESSING', 'PAYMENT_FAILED', 'payment_failure')
      .guard((context: any) => !context.paymentValid)
      .transition('PAYMENT_VERIFIED', 'INVENTORY_CHECK', 'check_inventory')
      .transition('INVENTORY_CHECK', 'INVENTORY_RESERVED', 'reserve_items')
      .guard((context: any) => context.inStock)
      .transition('INVENTORY_CHECK', 'OUT_OF_STOCK', 'out_of_stock')
      .guard((context: any) => !context.inStock)
      .transition('INVENTORY_RESERVED', 'SHIPPING_PREPARED', 'prepare_shipping')
      .transition('SHIPPING_PREPARED', 'SHIPPED', 'ship_order')
      .transition('SHIPPED', 'DELIVERED', 'confirm_delivery')
      // Error handling
      .transition('PAYMENT_FAILED', 'CANCELLED', 'cancel_order')
      .transition('OUT_OF_STOCK', 'CANCELLED', 'cancel_order')
      .transition('CANCELLED', 'REFUNDED', 'process_refund')
      // Actions
      .action((context: any) => {
        context.stepCount = (context.stepCount || 0) + 1;
        context.lastTransition = Date.now();
      })
      .onStateEntry('DELIVERED', (context: any) => {
        context.completedAt = Date.now();
      })
      .onStateEntry('REFUNDED', (context: any) => {
        context.refundedAt = Date.now();
      })
      .buildDefinition();

    for (let batch = 0; batch < Math.ceil(iterations / batchSize); batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, iterations);

      for (let i = batchStart; i < batchEnd; i++) {
        const { metrics } = PerformanceMonitor.measureSync(() => {
          // Simulate different scenarios
          const scenario = i % 10;
          const context = {
            orderId: `ORDER_${i}`,
            paymentValid: scenario < 8, // 80% success rate
            inStock: scenario < 7, // 70% in stock
            stepCount: 0,
            lastTransition: 0,
            completedAt: 0,
            refundedAt: 0,
          };

          // Execute the workflow using stateless pattern
          let currentState: string = 'ORDER_RECEIVED';

          // Process payment
          let result = orderDefinition.processEvent(
            currentState,
            'process_payment',
            context
          );
          if (result.success) currentState = result.newState as string;

          if (currentState === 'PAYMENT_VERIFIED') {
            // Check inventory
            result = orderDefinition.processEvent(
              currentState,
              'check_inventory',
              context
            );
            if (result.success) currentState = result.newState as string;

            if (currentState === 'INVENTORY_RESERVED') {
              // Happy path: prepare shipping -> ship -> deliver
              result = orderDefinition.processEvent(
                currentState,
                'prepare_shipping',
                context
              );
              if (result.success) currentState = result.newState as string;

              result = orderDefinition.processEvent(
                currentState,
                'ship_order',
                context
              );
              if (result.success) currentState = result.newState as string;

              result = orderDefinition.processEvent(
                currentState,
                'confirm_delivery',
                context
              );
              if (result.success) currentState = result.newState as string;
            } else {
              // Out of stock: cancel and refund
              result = orderDefinition.processEvent(
                currentState,
                'cancel_order',
                context
              );
              if (result.success) currentState = result.newState as string;

              result = orderDefinition.processEvent(
                currentState,
                'process_refund',
                context
              );
              if (result.success) currentState = result.newState as string;
            }
          } else {
            // Payment failed: cancel and refund
            result = orderDefinition.processEvent(
              currentState,
              'cancel_order',
              context
            );
            if (result.success) currentState = result.newState as string;

            result = orderDefinition.processEvent(
              currentState,
              'process_refund',
              context
            );
            if (result.success) currentState = result.newState as string;
          }

          return currentState;
        });

        times.push(metrics.executionTime);
      }

      // Check memory periodically
      if (batch % 5 === 0) {
        const currentMemory = this.getMemoryUsage();
        if (currentMemory.heapUsed > peakMemory.heapUsed) {
          peakMemory = currentMemory;
        }

        if (batch > 0) {
          const progress = (((batch * batchSize) / iterations) * 100).toFixed(
            1
          );
          console.log(
            `  Progress: ${progress}% (${(batch * batchSize).toLocaleString()}/${iterations.toLocaleString()})`
          );
        }
      }
    }

    const finalMemory = this.getMemoryUsage();
    const result = this.calculateBenchmarkResult(
      testName,
      iterations,
      times,
      initialMemory,
      finalMemory,
      peakMemory
    );
    this.results.push(result);
    return result;
  }

  public async runMemoryLeakTest(
    iterations = 100000
  ): Promise<BenchmarkResult> {
    const testName = 'Stateless Memory Efficiency Test';
    const times: number[] = [];
    const initialMemory = this.getMemoryUsage();
    let peakMemory = initialMemory;

    console.log(
      `Running Stateless Memory Efficiency Test with ${iterations.toLocaleString()} iterations...`
    );

    // Create ONE shared definition for all objects
    const definition = StateMachine.definitionBuilder()
      .initialState('INIT')
      .state('INIT')
      .state('ACTIVE')
      .state('PROCESSING')
      .state('COMPLETED')
      .state('ERROR')
      .transition('INIT', 'ACTIVE', 'activate')
      .transition('ACTIVE', 'PROCESSING', 'process')
      .transition('PROCESSING', 'COMPLETED', 'complete')
      .transition('PROCESSING', 'ERROR', 'error')
      .transition('ERROR', 'INIT', 'reset')
      .transition('COMPLETED', 'INIT', 'restart')
      .guard((context: any) => context?.shouldProcess !== false)
      .action((context: any) => {
        if (context) {
          context.processedAt = Date.now();
        }
      })
      .buildDefinition();

    const objects: any[] = [];
    const batchSize = Math.min(10000, iterations);

    for (let batch = 0; batch < Math.ceil(iterations / batchSize); batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, iterations);

      for (let i = batchStart; i < batchEnd; i++) {
        const { metrics } = PerformanceMonitor.measureSync(() => {
          // Create lightweight object that just stores state
          const obj = {
            id: `obj_${i}`,
            state: 'INIT',
            shouldProcess: i % 20 !== 0, // 5% error rate
            data: new Array(10).fill(i), // Some data payload
            processedAt: 0,
          };

          // Keep a subset of objects to test memory management
          if (i % 100 === 0) {
            objects.push(obj);
          }

          // Simulate realistic usage patterns using stateless definition
          let result = definition.processEvent(obj.state, 'activate', obj);
          if (result.success) obj.state = result.newState as string;

          result = definition.processEvent(obj.state, 'process', obj);
          if (result.success) obj.state = result.newState as string;

          if (obj.state === 'COMPLETED') {
            result = definition.processEvent(obj.state, 'restart', obj);
            if (result.success) obj.state = result.newState as string;
          } else if (obj.state === 'ERROR') {
            result = definition.processEvent(obj.state, 'reset', obj);
            if (result.success) obj.state = result.newState as string;
          }

          return obj;
        });

        times.push(metrics.executionTime);
      }

      // Check memory every batch and clean up old objects
      if (batch % 10 === 0) {
        const currentMemory = this.getMemoryUsage();
        if (currentMemory.heapUsed > peakMemory.heapUsed) {
          peakMemory = currentMemory;
        }

        // Clean up old objects to prevent excessive memory usage
        if (objects.length > 1000) {
          objects.splice(0, 500);
        }

        if (batch > 0) {
          const progress = (((batch * batchSize) / iterations) * 100).toFixed(
            1
          );
          const memoryUsage = (currentMemory.heapUsed / 1024 / 1024).toFixed(2);
          console.log(
            `  Progress: ${progress}% (${(batch * batchSize).toLocaleString()}/${iterations.toLocaleString()}) - Memory: ${memoryUsage}MB`
          );
        }
      }
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      // Wait a bit for GC to complete
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const finalMemory = this.getMemoryUsage();
    const result = this.calculateBenchmarkResult(
      testName,
      iterations,
      times,
      initialMemory,
      finalMemory,
      peakMemory
    );
    this.results.push(result);
    return result;
  }

  /**
   * Benchmark for concurrent stateless operations (server-scale)
   */
  public async runConcurrentOperationsBenchmark(
    iterations = 10000,
    concurrency = 100
  ): Promise<BenchmarkResult> {
    const testName = 'Concurrent Stateless Operations';
    const times: number[] = [];
    const initialMemory = this.getMemoryUsage();
    let peakMemory = initialMemory;

    console.log(
      `Running Concurrent Stateless Operations benchmark with ${iterations.toLocaleString()} iterations across ${concurrency} concurrent workers...`
    );

    // Create ONE shared definition for all workers
    const definition = StateMachine.definitionBuilder()
      .initialState('IDLE')
      .state('IDLE')
      .state('WORKING')
      .state('COMPLETED')
      .state('FAILED')
      .transition('IDLE', 'WORKING', 'start')
      .transition('WORKING', 'COMPLETED', 'finish')
      .guard((context: any) => context.shouldSucceed)
      .transition('WORKING', 'FAILED', 'fail')
      .guard((context: any) => !context.shouldSucceed)
      .transition('FAILED', 'IDLE', 'retry')
      .transition('COMPLETED', 'IDLE', 'reset')
      .action((context: any) => {
        context.processedAt = Date.now();
      })
      .buildDefinition();

    const { metrics } = await PerformanceMonitor.measureAsync(async () => {
      const workers = Array.from(
        { length: concurrency },
        async (_, workerId) => {
          const iterationsPerWorker = Math.floor(iterations / concurrency);

          for (let i = 0; i < iterationsPerWorker; i++) {
            // Each worker processes objects with just state values
            const obj = {
              taskId: `${workerId}_${i}`,
              state: 'IDLE',
              shouldSucceed: i % 10 !== 0, // 10% failure rate
              workerId,
              processedAt: 0,
            };

            // Use shared definition for all operations
            let result = definition.processEvent(obj.state, 'start', obj);
            if (result.success) obj.state = result.newState as string;

            if (obj.state === 'COMPLETED') {
              result = definition.processEvent(obj.state, 'reset', obj);
              if (result.success) obj.state = result.newState as string;
            } else if (obj.state === 'FAILED') {
              result = definition.processEvent(obj.state, 'retry', obj);
              if (result.success) obj.state = result.newState as string;

              obj.shouldSucceed = true; // Retry succeeds
              result = definition.processEvent(obj.state, 'start', obj);
              if (result.success) obj.state = result.newState as string;

              result = definition.processEvent(obj.state, 'finish', obj);
              if (result.success) obj.state = result.newState as string;

              result = definition.processEvent(obj.state, 'reset', obj);
              if (result.success) obj.state = result.newState as string;
            }
          }

          return iterationsPerWorker;
        }
      );

      const results = await Promise.all(workers);
      return results.reduce((sum, count) => sum + count, 0);
    });

    times.push(metrics.executionTime);

    const finalMemory = this.getMemoryUsage();
    if (finalMemory.heapUsed > peakMemory.heapUsed) {
      peakMemory = finalMemory;
    }

    const result = this.calculateBenchmarkResult(
      testName,
      iterations,
      times,
      initialMemory,
      finalMemory,
      peakMemory
    );
    this.results.push(result);
    return result;
  }

  public getSuiteResults(): BenchmarkSuiteResult {
    const totalTime = this.results.reduce(
      (sum, result) => sum + result.totalTime,
      0
    );
    const averageThroughput =
      this.results.reduce((sum, result) => sum + result.throughput, 0) /
      this.results.length;

    return {
      results: [...this.results],
      summary: {
        totalTests: this.results.length,
        totalTime,
        averageThroughput,
      },
    };
  }

  public clearResults(): void {
    this.results.length = 0;
  }

  private calculateBenchmarkResult(
    testName: string,
    iterations: number,
    times: number[],
    initialMemory: NodeJS.MemoryUsage,
    finalMemory: NodeJS.MemoryUsage,
    peakMemory: NodeJS.MemoryUsage
  ): BenchmarkResult {
    // Use iterative approach to avoid stack overflow with large arrays
    let totalTime = 0;
    let minTime = Number.MAX_VALUE;
    let maxTime = Number.MIN_VALUE;

    for (let i = 0; i < times.length; i++) {
      const time = times[i];
      if (time !== undefined) {
        totalTime += time;
        if (time < minTime) minTime = time;
        if (time > maxTime) maxTime = time;
      }
    }

    const averageTime = totalTime / iterations;
    const throughput = 1000 / averageTime; // operations per second

    return {
      testName,
      iterations,
      totalTime,
      averageTime,
      minTime,
      maxTime,
      memoryUsage: {
        initial: initialMemory,
        final: finalMemory,
        peak: peakMemory,
      },
      throughput,
    };
  }

  private calculateBenchmarkResultOptimized(
    testName: string,
    iterations: number,
    sampleTimes: number[],
    totalTime: number,
    initialMemory: NodeJS.MemoryUsage,
    finalMemory: NodeJS.MemoryUsage,
    peakMemory: NodeJS.MemoryUsage
  ): BenchmarkResult {
    const averageTime = totalTime / iterations;
    let minTime = Number.MAX_VALUE;
    let maxTime = Number.MIN_VALUE;

    // Calculate min/max from sample
    for (let i = 0; i < sampleTimes.length; i++) {
      const time = sampleTimes[i];
      if (time !== undefined) {
        if (time < minTime) minTime = time;
        if (time > maxTime) maxTime = time;
      }
    }

    const throughput = 1000 / averageTime; // operations per second

    return {
      testName,
      iterations,
      totalTime,
      averageTime,
      minTime,
      maxTime,
      memoryUsage: {
        initial: initialMemory,
        final: finalMemory,
        peak: peakMemory,
      },
      throughput,
    };
  }

  private getMemoryUsage(): NodeJS.MemoryUsage {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage();
    }

    // Fallback for non-Node environments
    return {
      rss: 0,
      heapTotal: 0,
      heapUsed: 0,
      external: 0,
      arrayBuffers: 0,
    };
  }
}
