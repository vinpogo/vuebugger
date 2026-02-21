# Package Structure

## Quick Reference

| Question | Answer | Rule |
|----------|--------|------|
| Export this from `index.ts`? | Public API? | Yes → Export \| No → Keep private |
| New file needed? | > 100 lines? | Yes → Create new \| No → Extend existing |
| Dependencies? | `@vingy/*`? | Yes → `workspace:^` \| No → `catalog:` |
| Exports config? | Always? | ESM-only with `.d.mts` types |
| File structure? | Always? | Flat `src/`, co-locate tests |

---

## Decision Tree

**Should this go in `src/index.ts` (exported)?**
- Is it part of the public API? → Yes → Export it
- Is it internal infrastructure? → No → Keep private

**Do I need a new file?**
- Implementation + tests > 100 lines? → Yes, create `[feature].ts`
- Adding to existing module? → No, extend existing file
- New public composable/plugin/directive? → Yes, create `[name].ts`

**What dependency protocol to use?**
- Internal package (@vingy/*)? → `workspace:^`
- External package? → `catalog:`

---

## Strict Rules

**Rule 1: Export public API only from `index.ts`**

Internal modules must NEVER be re-exported. Users should not import internals directly.

**vuebugger example:**

```typescript
// ✅ index.ts - Public API only
export { debug } from './debug'
export const DebugPlugin = plugin
export type { PluginOptions } from './types'

// ❌ Do NOT export:
// export { byUid, upsert, remove } from './registry'  // Internal
// export { setupComposableDevtools } from './devtools'  // Internal
```

**vueltip example:**

```typescript
// ✅ index.ts - Public API
export { vueltipPlugin } from './plugin'
export { vueltipDirective } from './directive'
export { useVueltip } from './composables'
export type { Placement, Content, Options } from './types'

// ❌ Do NOT export:
// export { hoveredElement, setContent } from './state'  // Internal
// export { getOption } from './options'  // Internal
// export { onMouseover } from './listeners'  // Internal
```

**Anti-pattern:** Exporting implementation details or intermediate utilities

---

## File Organization

```
packages/*/
  src/
    index.ts               # Public API only
    types.ts               # All exported types + ambient declarations
    [feature].ts           # Feature implementation
    [feature].unit.test.ts
    [feature].browser.test.ts
    constants.ts           # Constants (if needed)
    utils.ts               # Shared utilities (keep internal, don't export)
    options.ts             # Configuration state (internal)
  tsdown.config.ts         # Build config
  package.json             # Package metadata
  README.md
```

**Key constraints:**
- Flat structure: no subdirectories in `src/`
- Co-locate tests adjacent to source files
- One test file per environment (`.unit.test.ts` or `.browser.test.ts`)
- `env.d.ts` for ambient type declarations (module augmentation)

---

## Patterns by File Type

| File Type | Pattern | Export? | Example |
|-----------|---------|---------|---------|
| `index.ts` | Public API | Yes, only public | Composables, plugins, directives, types |
| `types.ts` | All type definitions | Re-export public types from index.ts | `Content`, `Binding`, `Options` |
| `[feature].ts` | Feature logic | Only if public API | `debug.ts`, `directive.ts`, `plugin.ts` |
| `listeners.ts` | Event handlers | No, internal | `onMouseover`, `onMouseout` |
| `utils.ts` | Helper functions | No, internal | `isTruncated`, `isHtmlElement`, `elementContainsText` |
| `options.ts` | Config state | No, internal | `getOption()`, `setOptions()` |
| `constants.ts` | Dev/config constants | No, internal | `INSPECTOR_ID`, `TIMELINE_ID` |
| `state.ts` | Reactive/state | No, internal | `hoveredElement`, `contentMap`, `byUid` |
| `registry.ts` | Entry tracking | No, internal | `byUid`, `byGroupId` maps |

---

## Types (types.ts)

**Pattern:** Define all types in one place, re-export public ones from `index.ts`

```typescript
// src/types.ts
export type Placement = 'top' | 'bottom' | 'left' | 'right'
export interface Content { text?: string }
export interface Options { showDelay: number }

// Keep internal types here too - they stay private unless re-exported
type InternalHelper = { ... }
interface InternalConfig { ... }

// Ambient declarations (module augmentation)
declare module 'vue' {
  export interface GlobalDirectives {
    vTooltip: TooltipDirective
  }
}
```

```typescript
// src/index.ts
export type { Placement, Content, Options } from './types'
// Don't re-export internal types
```

---

## Dependencies

### Internal Packages (workspace:^)

```json
{
  "@vingy/shared": "workspace:^"
}
```

**What it does:**
- Links to local source in monorepo
- Auto-installs and updates instantly
- Publishes as exact version to npm

**When to use:** Any `@vingy/*` package

### External Packages (catalog:)

```json
{
  "vue": "catalog:",
  "@floating-ui/vue": "catalog:"
}
```

**What it does:**
- Centralizes version in `pnpm-workspace.yaml`
- All packages use same version
- Single source of truth

**When to use:** All external npm packages

**Anti-patterns:**
- ❌ Using exact versions or version ranges
- ❌ Mixing `workspace:^` and `catalog:` inconsistently
- ❌ Always use `workspace:^` or `catalog:`

---

## Utility Functions & Type Guards

**Pattern:** Keep utilities in `utils.ts` (internal, don't export)

```typescript
// Type guard for safe casting
export function isHtmlElement(
  el: EventTarget,
): el is HTMLElement {
  return el instanceof HTMLElement
}

// Utility for checking state
export function isTruncated(el: HTMLElement) {
  return el.offsetWidth < el.scrollWidth - 1
}

// Helper for nested checks
export function elementContainsText(
  el: HTMLElement,
  text: string,
) {
  if (isInputElement(el)) {
    return getInputValue(el).includes(text)
  }
  return !!(el.innerText || el.textContent)?.includes(text)
}
```

**Critical:**
- Type guards return `type is X` for narrowing
- Avoid exporting; use in internal files only
- Keep related utilities together in one file

---

## Tree-shaking & Dev-only Code

**Pattern: Guard with `import.meta.env.DEV`**

Entire blocks are stripped in production—zero runtime overhead.

```typescript
// ✅ For functions
export const debug = <T>(state: T): T => {
  if (!import.meta.env.DEV) return state
  // ... dev logic here is completely removed in prod
  return state
}

// ✅ For plugins/initialization
const plugin: Plugin = {
  install: (app, options?) => {
    if (!import.meta.env.DEV) return
    // ... setup stripped in prod
  },
}
```

**Result:**
- Dev mode: Full functionality
- Prod mode: Guard evaluated at build time, entire block removed

**Anti-patterns:**
- ❌ Not guarding dev-only code (leaks code to prod)
- ❌ Unnecessary nesting of `import.meta.env.DEV` checks

---

## Build System

**Tool:** tsdown (ESM-only)

```bash
pnpm build           # Build all packages
tsdown               # Build this package (one-time)
tsdown -w            # Build this package (watch mode)
```

**Output:**
- `dist/index.mjs` - ES module
- `dist/index.d.mts` - TypeScript definitions

**Configuration** (same for all packages):
```typescript
export default defineConfig({
  dts: true,
  entry: 'src/index.ts',
  format: 'esm',
  inlineOnly: false,
})
```

---

## When to Create New Files

| Scenario | Action | Example |
|----------|--------|---------|
| Implementation + tests < 100 lines | Extend existing file | Add to `state.ts` |
| Implementation + tests > 100 lines | Create `[feature].ts` with tests | `composables.ts` with `.unit.test.ts` + `.browser.test.ts` |
| New composable/plugin/directive | New `[name].ts`, export from `index.ts` | `debug.ts` exported as `debug` |
| Config/options | Add to `options.ts` or internal file | Don't export unless part of public API |
| Shared utility | Create `utils.ts` (internal, don't export) | Keep private |
| Public type | Add to `types.ts`, re-export from `index.ts` | `Placement` type |

**Anti-patterns:**
- ❌ Creating small utility files that aren't re-exported
- ❌ Co-locating unrelated logic instead
- ❌ More than 100 lines mixed in one file
