# Contributing to DeltaMemory SDKs

Thank you for your interest in contributing! This document provides guidelines for contributing to the DeltaMemory SDK ecosystem.

## How to Contribute

### Reporting Issues

If you find a bug or have a feature request:

1. Check if the issue already exists
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - SDK version and environment details
   - Code samples if applicable

### Documentation Improvements

Documentation contributions are highly valued:

- Fix typos or unclear explanations
- Add examples or use cases
- Improve API documentation
- Translate documentation

### Code Contributions

We welcome code contributions for:

- Bug fixes
- New features (discuss first via issue)
- Performance improvements
- Test coverage improvements

## Development Setup

### TypeScript SDK

```bash
cd typescript
npm install
npm run build
npm test
```

### Python SDK

```bash
cd python
pip install -e ".[dev]"
pytest
```

### Documentation Site

```bash
cd docs
npm install
npm run dev
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Follow existing code style
- Add JSDoc comments for public APIs
- Include unit tests for new features
- Run linter: `npm run lint`
- Format code: `npm run format`

### Python

- Follow PEP 8 style guide
- Use type hints
- Add docstrings for public APIs
- Include unit tests for new features
- Run linter: `ruff check`
- Format code: `black .`

## Testing

### Writing Tests

- Test all new features
- Test edge cases
- Test error handling
- Maintain or improve coverage

### Running Tests

```bash
# TypeScript
npm test

# Python
pytest

# With coverage
npm run test:coverage
pytest --cov
```

## Pull Request Process

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write code
   - Add tests
   - Update documentation

4. **Commit your changes**
   ```bash
   git commit -m "feat: add new feature"
   ```
   
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `test:` Test changes
   - `refactor:` Code refactoring
   - `chore:` Maintenance tasks

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Describe your changes
   - Reference related issues
   - Ensure CI passes

## Code Review

All submissions require review. We'll:

- Review code quality
- Check test coverage
- Verify documentation
- Test functionality
- Provide feedback

Please be patient and responsive to feedback.

## Release Process

Releases are managed by maintainers:

1. Version bump following [Semantic Versioning](https://semver.org/)
2. Update CHANGELOG.md
3. Create release tag
4. Publish to npm/PyPI
5. Update documentation

## Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow our Code of Conduct

## Questions?

- Documentation: https://docs.deltamemory.com
- Support: support@deltamemory.com
- Discussions: GitHub Discussions (if available)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

## Recognition

Contributors will be recognized in:
- CHANGELOG.md
- GitHub contributors page
- Release notes

Thank you for contributing to DeltaMemory! 🎉
