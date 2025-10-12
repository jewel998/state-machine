# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.4] - 2024-12-10

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
