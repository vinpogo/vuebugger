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
- **Avoid common mistakes**: Read [Common Pitfalls](./skills/common-pitfalls.md) - listener cleanup, export rules, test environments


