/**
 * Performance reporting and analysis utilities
 */

import { BenchmarkSuiteResult } from './BenchmarkSuite';

export interface PerformanceReport {
  readonly timestamp: Date;
  readonly environment: {
    readonly nodeVersion?: string;
    readonly platform: string;
    readonly arch: string;
  };
  readonly benchmarks: BenchmarkSuiteResult;
  readonly analysis: {
    readonly performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    readonly recommendations: readonly string[];
    readonly warnings: readonly string[];
  };
}

export class PerformanceReporter {
  public generateReport(suiteResult: BenchmarkSuiteResult): PerformanceReport {
    const environment = this.getEnvironmentInfo();
    const analysis = this.analyzePerformance(suiteResult);

    return {
      timestamp: new Date(),
      environment,
      benchmarks: suiteResult,
      analysis,
    };
  }

  public formatReport(report: PerformanceReport): string {
    const lines: string[] = [];

    lines.push('='.repeat(80));
    lines.push('STATE MACHINE PERFORMANCE REPORT');
    lines.push('='.repeat(80));
    lines.push(`Generated: ${report.timestamp.toISOString()}`);
    lines.push(
      `Platform: ${report.environment.platform} (${report.environment.arch})`
    );
    if (report.environment.nodeVersion) {
      lines.push(`Node.js: ${report.environment.nodeVersion}`);
    }
    lines.push('');

    // Summary
    lines.push('SUMMARY');
    lines.push('-'.repeat(40));
    lines.push(`Performance Grade: ${report.analysis.performanceGrade}`);
    lines.push(`Total Tests: ${report.benchmarks.summary.totalTests}`);
    lines.push(
      `Total Time: ${report.benchmarks.summary.totalTime.toFixed(2)}ms`
    );
    lines.push(
      `Average Throughput: ${report.benchmarks.summary.averageThroughput.toFixed(0)} ops/sec`
    );
    lines.push('');

    // Individual benchmark results
    lines.push('BENCHMARK RESULTS');
    lines.push('-'.repeat(40));

    report.benchmarks.results.forEach((result) => {
      lines.push(`${result.testName}:`);
      lines.push(`  Iterations: ${result.iterations.toLocaleString()}`);
      lines.push(`  Total Time: ${result.totalTime.toFixed(2)}ms`);
      lines.push(`  Average Time: ${result.averageTime.toFixed(4)}ms`);
      lines.push(`  Min Time: ${result.minTime.toFixed(4)}ms`);
      lines.push(`  Max Time: ${result.maxTime.toFixed(4)}ms`);
      lines.push(`  Throughput: ${result.throughput.toFixed(0)} ops/sec`);
      lines.push(`  Memory Usage:`);
      lines.push(
        `    Initial Heap: ${this.formatBytes(result.memoryUsage.initial.heapUsed)}`
      );
      lines.push(
        `    Final Heap: ${this.formatBytes(result.memoryUsage.final.heapUsed)}`
      );
      lines.push(
        `    Peak Heap: ${this.formatBytes(result.memoryUsage.peak.heapUsed)}`
      );
      lines.push(
        `    Memory Delta: ${this.formatBytes(result.memoryUsage.final.heapUsed - result.memoryUsage.initial.heapUsed)}`
      );
      lines.push('');
    });

    // Analysis
    if (report.analysis.recommendations.length > 0) {
      lines.push('RECOMMENDATIONS');
      lines.push('-'.repeat(40));
      report.analysis.recommendations.forEach((rec) => {
        lines.push(`• ${rec}`);
      });
      lines.push('');
    }

    if (report.analysis.warnings.length > 0) {
      lines.push('WARNINGS');
      lines.push('-'.repeat(40));
      report.analysis.warnings.forEach((warning) => {
        lines.push(`⚠️  ${warning}`);
      });
      lines.push('');
    }

    lines.push('='.repeat(80));

    return lines.join('\n');
  }

  public exportToJson(report: PerformanceReport): string {
    return JSON.stringify(report, null, 2);
  }

  public exportToCsv(report: PerformanceReport): string {
    const headers = [
      'Test Name',
      'Iterations',
      'Total Time (ms)',
      'Average Time (ms)',
      'Min Time (ms)',
      'Max Time (ms)',
      'Throughput (ops/sec)',
      'Initial Heap (bytes)',
      'Final Heap (bytes)',
      'Peak Heap (bytes)',
      'Memory Delta (bytes)',
    ];

    const rows = report.benchmarks.results.map((result) => [
      result.testName,
      result.iterations.toString(),
      result.totalTime.toFixed(2),
      result.averageTime.toFixed(4),
      result.minTime.toFixed(4),
      result.maxTime.toFixed(4),
      result.throughput.toFixed(0),
      result.memoryUsage.initial.heapUsed.toString(),
      result.memoryUsage.final.heapUsed.toString(),
      result.memoryUsage.peak.heapUsed.toString(),
      (
        result.memoryUsage.final.heapUsed - result.memoryUsage.initial.heapUsed
      ).toString(),
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  private analyzePerformance(suiteResult: BenchmarkSuiteResult): {
    performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    recommendations: string[];
    warnings: string[];
  } {
    const recommendations: string[] = [];
    const warnings: string[] = [];
    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'A';

    // Server-scale performance thresholds
    const thresholds = {
      creation: { excellent: 50000, good: 20000, acceptable: 5000, poor: 1000 },
      transitions: {
        excellent: 100000,
        good: 50000,
        acceptable: 10000,
        poor: 1000,
      },
      workflow: { excellent: 20000, good: 10000, acceptable: 2000, poor: 500 },
      concurrent: {
        excellent: 30000,
        good: 15000,
        acceptable: 5000,
        poor: 1000,
      },
      memory: { excellent: 10000, good: 5000, acceptable: 1000, poor: 100 },
    };

    // Analyze each benchmark with server-scale expectations
    suiteResult.results.forEach((result) => {
      const testType = this.getTestType(result.testName);
      const threshold = thresholds[testType] || thresholds.transitions;

      // Throughput analysis
      if (result.throughput >= threshold.excellent) {
        recommendations.push(
          `${result.testName}: Excellent performance (${result.throughput.toFixed(0)} ops/sec)`
        );
      } else if (result.throughput >= threshold.good) {
        recommendations.push(
          `${result.testName}: Good performance (${result.throughput.toFixed(0)} ops/sec)`
        );
      } else if (result.throughput >= threshold.acceptable) {
        warnings.push(
          `${result.testName}: Acceptable performance but could be improved (${result.throughput.toFixed(0)} ops/sec)`
        );
        grade = grade === 'A' ? 'B' : grade;
      } else if (result.throughput >= threshold.poor) {
        warnings.push(
          `${result.testName}: Poor performance for server-scale operations (${result.throughput.toFixed(0)} ops/sec)`
        );
        grade = grade === 'A' || grade === 'B' ? 'C' : grade;
      } else {
        warnings.push(
          `${result.testName}: Critically low performance (${result.throughput.toFixed(0)} ops/sec)`
        );
        grade = 'D';
      }

      // Execution time analysis (more lenient for high-iteration tests)
      const maxAcceptableTime =
        result.iterations > 100000
          ? 0.1
          : result.iterations > 10000
            ? 0.5
            : 1.0;
      if (result.averageTime > maxAcceptableTime * 5) {
        warnings.push(
          `${result.testName}: Very high average execution time (${result.averageTime.toFixed(4)}ms)`
        );
        grade = 'D';
      } else if (result.averageTime > maxAcceptableTime * 2) {
        warnings.push(
          `${result.testName}: High average execution time (${result.averageTime.toFixed(4)}ms)`
        );
        grade = grade === 'A' ? 'B' : grade;
      }

      // Memory analysis (scaled for server operations)
      const memoryDelta =
        result.memoryUsage.final.heapUsed - result.memoryUsage.initial.heapUsed;
      const memoryPerOp = memoryDelta / result.iterations;

      if (memoryPerOp > 1024) {
        // More than 1KB per operation
        warnings.push(
          `${result.testName}: High memory usage per operation (${this.formatBytes(memoryPerOp)})`
        );
        grade = grade === 'A' ? 'B' : grade;
      }

      if (memoryDelta > 100 * 1024 * 1024) {
        // More than 100MB total
        warnings.push(
          `${result.testName}: Very high total memory usage (${this.formatBytes(memoryDelta)})`
        );
        grade = grade === 'A' || grade === 'B' ? 'C' : grade;
      }

      // Performance consistency analysis
      const timeVariance = result.maxTime - result.minTime;
      if (timeVariance > result.averageTime * 10) {
        warnings.push(
          `${result.testName}: High performance variance detected (${timeVariance.toFixed(4)}ms range)`
        );
        grade = grade === 'A' ? 'B' : grade;
      }
    });

    // Overall system recommendations
    const avgThroughput = suiteResult.summary.averageThroughput;
    if (avgThroughput >= 50000) {
      recommendations.push(
        '🚀 System is ready for high-scale server operations'
      );
    } else if (avgThroughput >= 20000) {
      recommendations.push(
        '✅ System performs well for typical server workloads'
      );
    } else if (avgThroughput >= 5000) {
      recommendations.push(
        '⚠️ System may need optimization for high-traffic scenarios'
      );
      grade = grade === 'A' ? 'B' : grade;
    } else {
      warnings.push(
        '❌ System requires significant optimization for server deployment'
      );
      grade = 'C';
    }

    // Server-scale specific recommendations
    if (suiteResult.results.length >= 4) {
      const concurrentTest = suiteResult.results.find((r) =>
        r.testName.includes('Concurrent')
      );
      if (concurrentTest && concurrentTest.throughput < 10000) {
        recommendations.push(
          'Consider implementing connection pooling and async processing for better concurrency'
        );
      }
    }

    if (recommendations.length === 0 && warnings.length === 0) {
      recommendations.push(
        '🎯 Performance analysis complete - system ready for deployment'
      );
    }

    return { performanceGrade: grade, recommendations, warnings };
  }

  private getTestType(
    testName: string
  ): 'creation' | 'transitions' | 'workflow' | 'concurrent' | 'memory' {
    if (testName.toLowerCase().includes('creation')) return 'creation';
    if (testName.toLowerCase().includes('transition')) return 'transitions';
    if (testName.toLowerCase().includes('workflow')) return 'workflow';
    if (testName.toLowerCase().includes('concurrent')) return 'concurrent';
    if (testName.toLowerCase().includes('memory')) return 'memory';
    return 'transitions';
  }

  private getEnvironmentInfo(): {
    nodeVersion?: string;
    platform: string;
    arch: string;
  } {
    const result: {
      nodeVersion?: string;
      platform: string;
      arch: string;
    } = {
      platform: typeof process !== 'undefined' ? process.platform : 'unknown',
      arch: typeof process !== 'undefined' ? process.arch : 'unknown',
    };

    if (typeof process !== 'undefined' && process.version) {
      result.nodeVersion = process.version;
    }

    return result;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
