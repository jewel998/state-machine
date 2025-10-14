# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.5] - 2025-10-14

### Added

- **GitHub Issue Templates** - Comprehensive issue templates for better bug reporting and feature
  requests
  - Bug report template with detailed sections for reproduction steps
  - Feature request template with use cases and examples
  - Question template for usage inquiries
  - Issue template configuration with helpful links
- **Pull Request Template** - Structured PR template with checklists and guidelines for contributors
- **Enhanced Build Configuration** - Improved production build process and npm package optimization
  - Comprehensive `.npmignore` to exclude development files from npm package
  - Source maps excluded from production releases for smaller package size
  - Updated publish script to use production build configuration
- **Middleware Pipeline System** - Complete middleware system with pipeline pattern for extensible
  state machine functionality
- **BaseMiddleware Class** - Abstract base class for easy custom middleware creation with lifecycle
  hooks
- **Middleware Context Information** - Rich context with pipeline ID, execution order, and previous
  results
- **Pipeline Execution Methods** - Full implementation of `executeActionPipeline`,
  `executeEntryPipeline`, and `executeExitPipeline`
- **Type-Safe Middleware** - Full TypeScript support with proper generic constraints and type safety
- **Immutability Middleware** - Built-in immutability middleware with support for native, Immer, and
  Immutable.js providers
- **Error Handling** - Comprehensive error handling in middleware pipeline with recovery mechanisms
- **Lifecycle Hooks** - Before/after pipeline hooks for setup and cleanup operations

### Changed

- **Package Configuration** - Optimized npm package files array to exclude source maps
- **Build Process** - Enhanced production build workflow for better distribution

### Security

- **Production Optimization** - Source maps excluded from production releases
- **Package Security** - Development files properly excluded from npm distribution

## [0.0.4] - 2025-10-12

### Added

- **StateMachineDefinition** - Stateless behavior definitions with zero per-object overhead
- **StateMachineDefinitionBuilder** - Fluent builder pattern for creating efficient definitions
- **StateMachine.definitionBuilder()** - Primary API for creating stateless definitions
- **StateMachine.createDefinition()** - Factory method for definition creation
- **Async transaction support** - Database transactions with automatic rollback mechanisms
- **Async guards and actions** - Non-blocking conditional logic and state operations
- **processEvent()** - Synchronous state transition processing
- **processEventAsync()** - Asynchronous state transitions with rollback support
- **canTransition()** - Synchronous transition validation
- **canTransitionAsync()** - Asynchronous transition validation
- **Transaction rollback system** - Automatic rollback on database operation failures
- **TypeScript support** - Full type safety with strict generics and constraints
- **Performance benchmarking** - Built-in performance testing and validation tools
- **Comprehensive examples** - Real-world usage patterns and demonstrations
- **Complete documentation** - API reference, architecture guide, and migration examples

### Performance

- **Memory efficiency** - 98% reduction in per-object memory usage (100 bytes vs 6KB)
- **High throughput** - 80,000+ operations per second for stateless transitions
- **Concurrent processing** - 86,000+ operations per second across multiple workers
- **Linear scalability** - Scales to millions of objects with O(n+m) memory usage
- **Bundle optimization** - ~45KB optimized bundle with tree-shaking support

### Security

- **Transaction safety** - Automatic rollback mechanisms for failed operations
- **Error isolation** - Comprehensive error handling with proper error types
- **Type safety** - Strict TypeScript validation preventing runtime errors
