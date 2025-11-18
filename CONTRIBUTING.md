# Contributing to CSV Phone Validator

First off, thank you for considering contributing to CSV Phone Validator! 🎉

## Code of Conduct

This project follows a simple code of conduct:
- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- Clear and descriptive title
- Exact steps to reproduce the problem
- Expected vs actual behavior
- Sample CSV data (anonymized if sensitive)
- Browser and OS information
- Screenshots if applicable

### Suggesting Features

Feature suggestions are welcome! Please:

- Use a clear and descriptive title
- Provide a detailed description of the feature
- Explain why this feature would be useful
- Include examples of how it would work

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Follow the commit conventions** (see below)
3. **Update documentation** if you change functionality
4. **Add tests** if applicable
5. **Ensure linting passes**: `bun run lint`
6. **Test thoroughly** before submitting

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/csv-phone-validator.git
cd csv-phone-validator

# Install dependencies
bun install

# Start dev server
bun run dev

# Run tests
bun run test-validation.ts

# Run linter
bun run lint
```

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
feat(validation): add Tanzania phone number support

- Add +255 country code handling
- Update validation rules for Tanzania prefixes
- Add tests for Tanzania numbers

Closes #42
```

```bash
fix(parser): handle edge case with empty cells

Fix crash when CSV contains empty mobile number cells
```

## Code Style

- **TypeScript**: Use strict mode, avoid `any` types
- **Vue**: Script first, then template, then style
- **Formatting**: Run `bun run lint:fix` before committing
- **Naming**: Use descriptive variable and function names
- **Comments**: Add comments for complex logic

## Project Structure

```
app/
├── components/     # Vue components (organized by feature)
├── composables/    # Reusable composition functions
├── stores/         # Pinia stores
├── utils/          # Utility functions
└── types/          # TypeScript type definitions
```

## Adding New Features

### Adding Support for New Country

1. Update `phoneFormatter.ts`:
   - Add country code constant
   - Add mobile prefixes
   - Update validation logic

2. Update types in `types/index.ts` if needed

3. Add tests in `test-validation.ts`

4. Update documentation

### Adding New Validation Rules

1. Modify `utils/phoneFormatter.ts`
2. Update `ValidationResult` interface if needed
3. Add tests
4. Update README with new rules

## Testing

- Write tests for new features
- Ensure all existing tests pass
- Test with various CSV formats
- Test edge cases

## Documentation

- Update README.md for user-facing changes
- Update code comments for complex logic
- Add JSDoc comments for new functions
- Update DEPLOYMENT.md if deployment process changes

## Questions?

Feel free to open an issue with the `question` label or reach out directly.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🙌

