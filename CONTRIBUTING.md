# Contributing to @vingy/vue-utilities

Thank you for contributing! This monorepo uses pnpm workspaces and changesets for version management.

## Development Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run dev mode (watches for changes)
pnpm dev

# Lint and format code
pnpm run lint
pnpm run lint:fix
pnpm run format
```

## Making Changes

1. Create a branch from `main`
2. Make your changes in the relevant package under `packages/`
3. Add tests if applicable
4. Ensure code passes linting: `pnpm run lint`
5. Run tests: `pnpm test`

## Versioning with Changesets

This monorepo uses [changesets](https://github.com/changesets/changesets) for managing independent package versions and changelogs.

### Creating a Changeset

After making changes, create a changeset:

```bash
pnpm changeset
```

This will prompt you to:

1. **Select affected packages** - Choose which packages were modified
2. **Select version bump** - Choose between:
   - `patch` - Bug fixes (0.0.X)
   - `minor` - Features (0.X.0)
   - `major` - Breaking changes (X.0.0)
3. **Write summary** - Describe your changes for the changelog

Example:

```
✔ Which packages would you like to include? … @vingy/vuebugger
✔ Which packages should have a MAJOR bump? … no
✔ Which packages should have a MINOR bump? … @vingy/vuebugger
✔ Write a summary for this change: Added support for custom options

Summary: Added support for custom options
```

This creates a file in `.changeset/` (e.g., `.changeset/brave-lions-enjoy.md`). Commit this file with your changes.

### Before Publishing

The maintainers will handle versioning and publishing:

```bash
# Update package versions based on changesets
pnpm changeset:version

# This will:
# - Update all package.json versions
# - Create/update CHANGELOG.md files
# - Consume all changesets
# - Create a version commit

# Review the changes, then publish
pnpm changeset:publish

# This will:
# - Build all packages
# - Publish to npm
# - Create git tags (e.g., @vingy/vuebugger@1.0.0)
# - Push tags to GitHub
```

## Package Structure

```
packages/
├── vuebugger/          # Vue devtools plugin
├── vueltip/            # Headless tooltip component
└── [your-package]/     # New packages follow the same structure
    ├── src/
    ├── package.json
    ├── tsconfig.json
    └── tsdown.config.ts
```

Each package:

- Has independent versioning via changesets
- Uses the shared tooling (TypeScript, vitest, oxlint, oxfmt)
- Publishes to npm with `@vingy` scope
- Is linked in the workspace via `pnpm` for local development

## Publishing New Packages

Initial publish (manual):

```bash
pnpm --filter @vingy/your-package publish --access public
```

Future updates use changesets (see "Before Publishing" section above).

## Guidelines

- **No changesets needed for:**
  - Documentation changes
  - CI/CD workflow updates
  - README changes
  - Dependency updates (these auto-bump if a package changes)

- **Always create changesets for:**
  - Code changes affecting any package
  - API additions or changes
  - Bug fixes

## Code Quality

All code is checked with:

- **oxlint** - JavaScript/TypeScript linting
- **oxfmt** - Code formatting
- **vitest** - Unit tests
- **TypeScript** - Type checking

Run before committing:

```bash
pnpm run lint       # Check for issues
pnpm run lint:fix   # Fix formatting
pnpm test           # Run tests
```

## Questions?

See the [main README](./README.md) or open an issue for questions!
