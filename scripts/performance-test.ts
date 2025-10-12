#!/usr/bin/env node

/**
 * Performance testing script for state machine
 * This script is not included in the production build
 */

import { BenchmarkSuite } from '@/performance/BenchmarkSuite';
import { PerformanceReporter } from '@/performance/PerformanceReporter';
import * as fs from 'fs';
import * as path from 'path';

async function runPerformanceTests() {
  console.log('🚀 Starting State Machine Performance Tests...\n');

  const suite = new BenchmarkSuite();
  const reporter = new PerformanceReporter();

  try {
    // Run benchmarks based on configuration
    await runBenchmarks(suite, config, memoryOnly);

    // Generate report
    const suiteResults = suite.getSuiteResults();
    const report = reporter.generateReport(suiteResults);

    // Output results
    console.log('\n' + reporter.formatReport(report));

    // Save results to files
    await saveResults(reporter, report, noSave);

    // Exit with appropriate code based on performance grade
    const grade = report.analysis.performanceGrade;
    if (grade === 'F' || grade === 'D') {
      console.log(`\n❌ Performance tests failed with grade: ${grade}`);
      process.exit(1);
    } else if (grade === 'C') {
      console.log(
        `\n⚠️  Performance tests passed with warnings (grade: ${grade})`
      );
      process.exit(0);
    } else {
      console.log(`\n✅ Performance tests passed with grade: ${grade}`);
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Performance tests failed:', error);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const helpText = `
Usage: node scripts/performance-test.js [options]

Options:
  --help, -h          Show this help message
  --quick, -q         Run quick tests (thousands of iterations)
  --full, -f          Run full test suite (hundreds of thousands)
  --server-scale, -s  Run server-scale tests (millions of iterations)
  --memory-only, -m   Run only memory tests
  --no-save           Don't save results to files

Scale Examples:
  --quick:       1K-10K iterations (development testing)
  --full:        50K-1M iterations (CI/CD testing)
  --server-scale: 200K-5M iterations (production readiness)

Examples:
  node scripts/performance-test.js --quick
  node scripts/performance-test.js --full --no-save
  node scripts/performance-test.js --server-scale
`;

if (args.includes('--help') || args.includes('-h')) {
  console.log(helpText);
  process.exit(0);
}

// Configure test parameters based on arguments
const isQuick = args.includes('--quick') || args.includes('-q');
const isFull = args.includes('--full') || args.includes('-f');
const isServerScale = args.includes('--server-scale') || args.includes('-s');
const memoryOnly = args.includes('--memory-only') || args.includes('-m');
const noSave = args.includes('--no-save');

const config = {
  creation: isQuick ? 1000 : isFull ? 100000 : isServerScale ? 500000 : 50000,
  transitions: isQuick
    ? 10000
    : isFull
      ? 1000000
      : isServerScale
        ? 5000000
        : 500000,
  workflow: isQuick ? 1000 : isFull ? 50000 : isServerScale ? 200000 : 25000,
  memory: isQuick ? 5000 : isFull ? 100000 : isServerScale ? 500000 : 50000,
  concurrent: isQuick ? 1000 : isFull ? 10000 : isServerScale ? 50000 : 5000,
  concurrency: isQuick ? 10 : isFull ? 100 : isServerScale ? 500 : 50,
};

async function runBenchmarks(suite, config, memoryOnly) {
  if (!memoryOnly) {
    console.log(
      `📊 Running StateMachine Creation Benchmark (${config.creation.toLocaleString()} iterations)...`
    );
    await suite.runStateMachineCreationBenchmark(config.creation);

    console.log(
      `📊 Running Transition Benchmark (${config.transitions.toLocaleString()} iterations)...`
    );
    await suite.runTransitionBenchmark(config.transitions);

    console.log(
      `📊 Running Complex Workflow Benchmark (${config.workflow.toLocaleString()} iterations)...`
    );
    await suite.runComplexWorkflowBenchmark(config.workflow);

    console.log(
      `📊 Running Concurrent Operations Benchmark (${config.concurrent.toLocaleString()} iterations, ${config.concurrency} workers)...`
    );
    await suite.runConcurrentOperationsBenchmark(
      config.concurrent,
      config.concurrency
    );
  }

  console.log(
    `📊 Running Memory Leak Test (${config.memory.toLocaleString()} iterations)...`
  );
  await suite.runMemoryLeakTest(config.memory);
}

async function saveResults(reporter, report, noSave) {
  if (noSave) {
    console.log('\n📄 Results not saved (--no-save flag used)');
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsDir = path.join(__dirname, '..', 'performance-results');

  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Save JSON report
  const jsonPath = path.join(resultsDir, `performance-${timestamp}.json`);
  fs.writeFileSync(jsonPath, reporter.exportToJson(report));
  console.log(`📄 JSON report saved to: ${jsonPath}`);

  // Save CSV report
  const csvPath = path.join(resultsDir, `performance-${timestamp}.csv`);
  fs.writeFileSync(csvPath, reporter.exportToCsv(report));
  console.log(`📊 CSV report saved to: ${csvPath}`);

  // Save text report
  const txtPath = path.join(resultsDir, `performance-${timestamp}.txt`);
  fs.writeFileSync(txtPath, reporter.formatReport(report));
  console.log(`📝 Text report saved to: ${txtPath}`);
}

// Main execution
runPerformanceTests().catch(console.error);
