# Contributing to @jewel998/state-machine

Thank you for your interest in contributing to this project! We welcome contributions from the
community and are pleased to have you join us.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating,
you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you are
creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what behavior you expected**
- **Include code samples and error messages**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion,
please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the enhancement**
- **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repository
2. Create a new branch from `main` for your feature or bug fix
3. Make your changes
4. Add or update tests as necessary
5. Ensure all tests pass
6. Update documentation if needed
7. Commit your changes with a clear commit message
8. Push to your fork and submit a pull request

#### Pull Request Guidelines

- **Follow the existing code style**
- **Write clear, concise commit messages**
- **Include tests for new functionality**
- **Update documentation for API changes**
- **Keep pull requests focused on a single feature or bug fix**

## Development Setup

### Automated Setup

```bash
git clone https://github.com/jewel998/state-machine.git
cd state-machine
npm run setup  # Automated setup with validation
```

### Manual Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/jewel998/state-machine.git
   cd state-machine
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Run initial build and tests:
   ```bash
   npm run build
   npm test
   ```

### Development Scripts

- `npm run setup` - Complete automated setup
- `npm run dev <command>` - Development workflow automation
- `npm run test:all` - Comprehensive test suite
- `npm run ci` - Simulate CI/CD pipeline locally

## Coding Standards

- Use TypeScript for all new code
- Follow the existing code formatting (we use Prettier)
- Write meaningful variable and function names
- Add JSDoc comments for public APIs
- Ensure all code is properly tested

## Testing

### Test Requirements

- Write unit tests for all new functionality
- Ensure existing tests continue to pass
- Maintain high test coverage
- Use descriptive test names that explain what is being tested
- **No performance tests in main test suite** - use separate performance scripts

### Test Commands

```bash
npm test                    # Unit tests only
npm run test:coverage       # Tests with coverage report
npm run test:all           # Comprehensive test suite
npm run perf:quick         # Performance tests (development only)
```

### Test Guidelines

- Keep tests focused on core functionality
- Performance testing is isolated from main bundle
- Tests should run in under 3 seconds
- Use proper TypeScript types in tests

## Documentation

- Update README.md for user-facing changes
- Update API documentation for new features
- Include code examples in documentation
- Keep CHANGELOG.md updated

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding or updating tests
- `chore:` for maintenance tasks

Example:

```
feat: add support for hierarchical states

- Implement nested state functionality
- Add tests for hierarchical state transitions
- Update documentation with examples
```

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md` with new version
3. Create a pull request with the version bump
4. After merge, create a GitHub release
5. Publish to npm

## Questions?

If you have questions about contributing, please open an issue or start a discussion on GitHub.

Thank you for contributing!
