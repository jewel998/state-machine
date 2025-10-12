#!/bin/bash

# State Machine Library - Development Script
# Quick development workflow automation

set -e

echo "🛠️  Development Workflow"
echo "======================="

# Function to run command with error handling
run_cmd() {
    echo "▶️  $1"
    if eval "$2"; then
        echo "✅ $1 completed"
    else
        echo "❌ $1 failed"
        exit 1
    fi
    echo ""
}

# Parse command line arguments
COMMAND=${1:-"help"}

case $COMMAND in
    "setup")
        echo "🚀 Setting up development environment..."
        run_cmd "Installing dependencies" "pnpm install"
        run_cmd "Initial build" "npm run build"
        run_cmd "Running tests" "npm test"
        echo "🎉 Development environment ready!"
        ;;
    
    "test")
        echo "🧪 Running development tests..."
        run_cmd "Type checking" "npm run type-check"
        run_cmd "Linting" "npm run lint"
        run_cmd "Unit tests" "npm test"
        echo "🎉 All tests passed!"
        ;;
    
    "build")
        echo "🔨 Building project..."
        run_cmd "Development build" "npm run build"
        run_cmd "Production build" "npm run build:prod"
        echo "🎉 Build completed!"
        ;;
    
    "perf")
        echo "⚡ Running performance tests..."
        run_cmd "Quick performance test" "npm run perf:quick"
        echo "🎉 Performance test completed!"
        ;;
    
    "format")
        echo "🎨 Formatting code..."
        run_cmd "Code formatting" "npm run format"
        run_cmd "Linting" "npm run lint:fix"
        echo "🎉 Code formatted!"
        ;;
    
    "clean")
        echo "🧹 Cleaning project..."
        run_cmd "Cleaning build artifacts" "npm run clean"
        run_cmd "Removing node_modules" "rm -rf node_modules"
        run_cmd "Reinstalling dependencies" "pnpm install"
        echo "🎉 Project cleaned!"
        ;;
    
    "validate")
        echo "✅ Validating project..."
        run_cmd "Type checking" "npm run type-check"
        run_cmd "Linting" "npm run lint"
        run_cmd "Format checking" "npm run format:check"
        run_cmd "Unit tests" "npm test"
        run_cmd "Build test" "npm run build"
        echo "🎉 Project validation completed!"
        ;;
    
    "help"|*)
        echo "Available commands:"
        echo ""
        echo "  setup     - Set up development environment"
        echo "  test      - Run development tests"
        echo "  build     - Build the project"
        echo "  perf      - Run performance tests"
        echo "  format    - Format and fix code"
        echo "  clean     - Clean and reinstall"
        echo "  validate  - Full project validation"
        echo "  help      - Show this help"
        echo ""
        echo "Usage: ./scripts/dev.sh <command>"
        echo "Example: ./scripts/dev.sh test"
        ;;
esac