#!/bin/bash

# State Machine Library - Comprehensive Testing Script
# Runs all tests, builds, and performance checks

set -e  # Exit on any error

echo "🧪 Running Comprehensive Test Suite..."
echo "====================================="

# Function to print section headers
print_section() {
    echo ""
    echo "📋 $1"
    echo "$(printf '%.0s-' {1..50})"
}

# Function to check command success
check_success() {
    if [ $? -eq 0 ]; then
        echo "✅ $1 passed"
    else
        echo "❌ $1 failed"
        exit 1
    fi
}

# Start timing
START_TIME=$(date +%s)

# 1. Code Quality Checks
print_section "Code Quality Checks"

echo "🔍 Running TypeScript type checking..."
npm run type-check
check_success "TypeScript type checking"

echo "🔍 Running ESLint..."
npm run lint
check_success "ESLint"

echo "🔍 Checking code formatting..."
npm run format:check
check_success "Code formatting"

# 2. Unit Tests
print_section "Unit Tests"

echo "🧪 Running unit tests..."
npm test
check_success "Unit tests"

echo "🧪 Running tests with coverage..."
npm run test:coverage
check_success "Test coverage"

# 3. Build Tests
print_section "Build Tests"

echo "🔨 Testing development build..."
npm run build
check_success "Development build"

echo "🔨 Testing production build..."
npm run build:prod
check_success "Production build"

echo "🔨 Testing TypeScript build..."
npm run build:tsc
check_success "TypeScript build"

# 4. Bundle Analysis
print_section "Bundle Analysis"

echo "📦 Analyzing bundle size..."
BUNDLE_SIZE=$(ls -lh dist/index.js | awk '{print $5}')
echo "   CommonJS bundle: $BUNDLE_SIZE"

BUNDLE_SIZE_ESM=$(ls -lh dist/index.mjs | awk '{print $5}')
echo "   ESM bundle: $BUNDLE_SIZE_ESM"

# Check if performance code is in bundle
if grep -q "BenchmarkSuite\|PerformanceReporter" dist/index.js; then
    echo "❌ Performance code found in bundle!"
    exit 1
else
    echo "✅ Bundle is clean (no performance code)"
fi

# 5. Performance Tests
print_section "Performance Tests"

echo "⚡ Running quick performance test..."
npm run perf:quick
check_success "Quick performance test"

echo "⚡ Running memory test..."
npm run perf:memory
check_success "Memory test"

# 6. Package Validation
print_section "Package Validation"

echo "📦 Validating package.json..."
npm run validate
check_success "Package validation"

# Calculate total time
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Summary
print_section "Test Summary"

echo "🎉 All tests passed successfully!"
echo ""
echo "📊 Test Results:"
echo "   ✅ Code quality checks: PASSED"
echo "   ✅ Unit tests: PASSED"
echo "   ✅ Build tests: PASSED"
echo "   ✅ Bundle analysis: PASSED"
echo "   ✅ Performance tests: PASSED"
echo "   ✅ Package validation: PASSED"
echo ""
echo "⏱️  Total execution time: ${DURATION}s"
echo "📦 Bundle size: $BUNDLE_SIZE (CommonJS), $BUNDLE_SIZE_ESM (ESM)"
echo ""
echo "🚀 Ready for production deployment!"