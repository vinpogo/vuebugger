# Copilot Instructions for @vingy/vue-utilities

## Project Overview

Vue utilities monorepo with independently-versioned packages:
- **vuebugger**: Vue devtools plugin for debugging composables and reactive state
- **vueltip**: Headless tooltip component with smart visibility detection
- **shared**: Internal shared types/utilities (`@vingy/shared`)

## Monorepo Stack

- **pnpm workspaces** with catalog protocol for centralized versions
- **tsdown** for ESM-only builds with `.d.mts` types
- **Vitest** with dual projects: unit tests (Node) + browser tests (Browser/Playwright)
- **oxlint** + **oxfmt**: single quotes, no semis, 60 char width

## Skills Guide

**When you need to...**
- **Write tests**: Read [Testing Decisions](./skills/testing-decisions.md) - decision tree for test type, anti-patterns, implementations
- **Manage state**: Read [State Management](./skills/state-management.md) - singleton patterns, cleanup strategies, scope awareness
- **Organize files**: Read [Package Structure](./skills/package-structure.md) - exports, dependencies, file creation rules
- **Build features**: Read [Common Workflows](./skills/common-workflows.md) - step-by-step guides, debugging, code style
- **Use types safely**: Read [Type Patterns](./skills/type-patterns.md) - type guards, branded types, generics, ambient declarations
- **Avoid common mistakes**: Read [Common Pitfalls](./skills/common-pitfalls.md) - listener cleanup, export rules, test environments
- **Debug issues**: Read [Debugging Strategies](./skills/debugging-strategies.md) - Vitest UI, spies, state inspection, linting errors
- **Improve instructions**: Read [Instruction Validation & Refinement](./skills/instruction-validation.md) - validate patterns, cross-check skills, self-improvement workflow

## Available Scripts

| Command | Purpose |
|---------|---------|
| `pnpm test` | Run all tests (unit + browser) |
| `pnpm build` | Build all packages |
| `pnpm dev` | Watch mode for all packages |
| `pnpm lint` | Run oxlint |
| `pnpm format` | Format with oxfmt |
| `pnpm changeset` | Create changelog entry after changes |

## Before Committing

- [ ] Tests pass: `pnpm test`
- [ ] No lint errors: `pnpm lint`
- [ ] Code formatted: `pnpm format`
- [ ] Changeset created: `pnpm changeset` or manually in `.changeset/*.md` (if not docs-only)
- [ ] Demo updated (if user-facing feature)

## Key Files to Follow

**Testing:** [registry.unit.test.ts](../packages/vuebugger/src/registry.unit.test.ts), [directive.browser.test.ts](../packages/vueltip/src/directive.browser.test.ts)

**State:** [registry.ts](../packages/vuebugger/src/registry.ts), [state.ts](../packages/vueltip/src/state.ts)

**Package exports:** [vuebugger/index.ts](../packages/vuebugger/src/index.ts), [vueltip/index.ts](../packages/vueltip/src/index.ts)

## Core Patterns

- **Dev-only code**: Guard with `import.meta.env.DEV` (stripped in prod)
- **Module singletons**: Maps for tracking, refs for reactive state
- **Cleanup**: `onScopeDispose()` in composables, directive hooks for listeners
- **Tree-shaking**: ESM-only, flat package structure, no subdirectories in src/

