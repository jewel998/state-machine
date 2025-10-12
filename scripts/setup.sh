#!/bin/bash

# State Machine Library - Setup Script
# Automates the complete setup process for development

set -e  # Exit on any error

echo "🚀 Setting up State Machine Library..."
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if pnpm is installed, install if not
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

echo "✅ pnpm version: $(pnpm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Run initial build
echo "🔨 Building project..."
npm run build

# Run tests
echo "🧪 Running tests..."
npm test

# Run quick performance test
echo "⚡ Running performance test..."
npm run perf:quick

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Available commands:"
echo "  npm run build         # Build the project"
echo "  npm run build:prod    # Production build"
echo "  npm test              # Run tests"
echo "  npm run perf:quick    # Quick performance test"
echo "  npm run perf:full     # Full performance test"
echo "  npm run lint          # Lint code"
echo "  npm run format        # Format code"
echo ""
echo "Happy coding! 🚀"