#!/bin/bash

# State Machine Library - CI/CD Script
# Optimized for continuous integration environments

set -e  # Exit on any error

echo "🤖 CI/CD Pipeline for State Machine Library"
echo "==========================================="

# Environment setup
export NODE_ENV=test
export CI=true

# Function to print with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check command success with timing
check_with_timing() {
    local start_time=$(date +%s)
    local command_name="$1"
    
    if [ $? -eq 0 ]; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        log "✅ $command_name completed in ${duration}s"
    else
        log "❌ $command_name failed"
        exit 1
    fi
}

# Start pipeline
log "🚀 Starting CI/CD pipeline..."

# 1. Environment Info
log "📋 Environment Information"
log "   Node.js: $(node -v)"
log "   npm: $(npm -v)"
log "   OS: $(uname -s)"
log "   Architecture: $(uname -m)"

# 2. Install dependencies
log "📦 Installing dependencies..."
npm ci --silent
check_with_timing "Dependency installation"

# 3. Type checking
log "🔍 Type checking..."
npm run type-check --silent
check_with_timing "Type checking"

# 4. Linting
log "🔍 Linting..."
npm run lint --silent
check_with_timing "Linting"

# 5. Unit tests with coverage
log "🧪 Running tests with coverage..."
npm run test:coverage --silent
check_with_timing "Unit tests"

# 6. Build validation
log "🔨 Building project..."
npm run build --silent
check_with_timing "Build"

# 7. Production build
log "🔨 Production build..."
npm run build:prod --silent
check_with_timing "Production build"

# 8. Bundle size check
log "📦 Checking bundle size..."
BUNDLE_SIZE_BYTES=$(stat -f%z dist/index.js 2>/dev/null || stat -c%s dist/index.js)
BUNDLE_SIZE_KB=$((BUNDLE_SIZE_BYTES / 1024))

if [ $BUNDLE_SIZE_KB -gt 100 ]; then
    log "❌ Bundle size too large: ${BUNDLE_SIZE_KB}KB (max: 100KB)"
    exit 1
else
    log "✅ Bundle size OK: ${BUNDLE_SIZE_KB}KB"
fi

# 9. Performance regression test
log "⚡ Performance regression test..."
npm run perf:quick --silent
check_with_timing "Performance test"

# 10. Package validation
log "📦 Package validation..."
npm run validate --silent
check_with_timing "Package validation"

# Success
log "🎉 CI/CD pipeline completed successfully!"
log "📊 Summary:"
log "   ✅ All quality checks passed"
log "   ✅ All unit tests passed"
log "   ✅ Bundle size: ${BUNDLE_SIZE_KB}KB"
log "   ✅ Performance: PASSED"
log "🚀 Ready for deployment!"