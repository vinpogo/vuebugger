# Common Workflows

## Quick Reference: When to Use Which Workflow

| Task | Workflow |
|------|----------|
| Add new feature to package | [Adding a Feature](#adding-a-feature) |
| Create new package in monorepo | [Creating a New Package](#creating-a-new-package) |
| Tests aren't passing | [Debugging Test Failures](#debugging-test-failures) |
| Code formatting issues | [Code Style & Linting](#code-style--linting) |

---

## Adding a Feature

### Step 1: Write tests first

Decide test type using [testing-decisions.md](./testing-decisions.md):
- DOM logic? → `.browser.test.ts`
- State/logic? → `.unit.test.ts`

```bash
# Example: Add state feature to vueltip
# Create: src/new-feature.unit.test.ts
# Write: Test what it should do
```

### Step 2: Implement the feature

```bash
# src/new-feature.ts
# Implement to make tests pass
```

Check state management patterns in [state-management.md](./state-management.md):
- Using refs? Follow `state.ts` pattern
- Singleton tracking? Follow `registry.ts` pattern
- Need cleanup? Use `onScopeDispose` or directive hooks

### Step 3: Export from index.ts

If public API, add to [index.ts](../../packages/vueltip/src/index.ts):

```typescript
export { useNewFeature } from './new-feature'
export type { NewFeatureOptions } from './types'
```

Internal utilities stay private (not exported).

### Step 4: Verify tests pass

```bash
pnpm test                # All tests
pnpm vitest --ui       # Interactive UI for debugging
```

### Step 5: Demo in dev app

Add example to [demo/src/](../../demo/src/):

```vue
<script setup>
import { useNewFeature } from '@vingy/package-name'
const feature = useNewFeature()
</script>
```

Start demo server:
```bash
cd demo && pnpm dev
```

### Step 6: Create changeset

**Option 1: Use CLI**
```bash
pnpm changeset
# Select affected packages (e.g., vueltip)
# Choose: patch (fix), minor (feature), major (breaking)
# Write summary: "Add new feature: description"
```

**Option 2: Create manually**
Create `.changeset/[name].md`:
```markdown
---
"@vingy/vueltip": minor
"@vingy/vuebugger": patch
---

Add new feature: description of what changed
```

Commit the generated `.changeset/*.md` file.

## Creating a Vue Plugin + Directive

**Pattern:** Vueltip combines plugin + directive + composable for full integration

### Plugin Structure

**plugin.ts:** Installs options and mounts component if provided

```typescript
export const vueltipPlugin = {
  install: (app: App, options: Partial<Options & { component: Component }>) => {
    const { component, ...rest } = options
    setOptions(rest)  // Store config in module-level state
    if (!component) return

    // Mount component to DOM if provided
    const container = document.createElement('div')
    container.id = '__vueltip_root__'
    document.body.appendChild(container)
    const tooltipApp = createApp(component)
    tooltipApp._context = app._context  // Share parent plugin context
    tooltipApp.mount(container)
  },
}
```

### Directive Structure

**directive.ts:** Handles lifecycle + event listener setup/teardown

```typescript
const LISTENERS: [
  event: string,
  handler: EventListener,
][] = [
  ['eventA', onEnter],
  ['eventB', onLeave],
]

export const vueltipDirective = {
  created: (el, binding) => {
    const key = generateKey()
    setContent(key, toContent(binding.value))
    el.setAttribute(getOption('keyAttribute'), key)
    for (const [event, handler] of LISTENERS) {
      el.addEventListener(event, handler)
    }
  },
  updated: (el, binding) => {
    // Re-sync state/attributes on binding change
  },
  beforeUnmount: (el) => {
    ensureKey(el, (key) => deleteContent(key))
    for (const [event, handler] of LISTENERS) {
      el.removeEventListener(event, handler)
    }
  },
}
```

**Durability note:** Keep this as a lifecycle template.
Event names and attribute defaults can evolve.

### Composable Structure

**composables.ts:** Exposes floating UI + state binding for template

```typescript
export const useVueltip = ({ tooltipElement, arrowElement, ... }) => {
  // Use @floating-ui/vue for positioning
  const { x, y } = useFloating(...)

  // Watch module-level state changes
  watch(() => debouncedHoveredElement.value, () => {
    // Compute positioning
  })

  // Return styles for template
  return { x, y, show: computed(() => !!tooltipContent.value) }
}
```

### Usage in Demo

```vue
<script setup>
import { vueltipDirective, useVueltip } from '@vingy/vueltip'
import TooltipComponent from './Tooltip.vue'

// 1. Install plugin with component
app.use(vueltipPlugin, { component: TooltipComponent })

// 2. Use directive in template
// v-tooltip="'text'"
// v-tooltip.x.y="'text'"

// 3. Use composable in tooltip component
const { x, y, show } = useVueltip({ tooltipElement, ... })
</script>
```

**Key insight:** Plugin manages app-level setup, directive manages element-level listeners, composable binds state to template.

## Creating a New Package

### 1. Directory structure

```bash
mkdir packages/new-package
cd packages/new-package
```

### 2. Create essential files

**package.json:**
```json
{
  "name": "@vingy/new-package",
  "version": "0.0.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.mts",
      "import": "./dist/index.mjs"
    }
  },
  "dependencies": {
    "@vingy/shared": "workspace:^",
    "vue": "catalog:"
  },
  "devDependencies": {
    "tsdown": "catalog:",
    "vitest": "catalog:"
  },
  "scripts": {
    "build": "tsdown",
    "dev": "tsdown -w"
  }
}
```

**tsdown.config.ts:**
```typescript
import { defineConfig } from 'tsdown'

export default defineConfig({
  dts: true,
  entry: 'src/index.ts',
  format: 'esm',
  inlineOnly: false,
})
```

**src/index.ts:** (empty or minimal)
```typescript
export {}
```

**src/types.ts:** (if needed)
```typescript
// Type definitions
```

### 3. Add to pnpm workspaces

Update [pnpm-workspace.yaml](../../pnpm-workspace.yaml):
```yaml
packages:
  - packages/*      # Already includes new-package
  - demo
```

(Auto-included by glob pattern)

### 4. Create changeset

```bash
pnpm changeset
# Select your new package
# Choose major (0.1.0 for new packages)
```

## Debugging Test Failures

### Browser tests failing?

1. Check test suffix: `.browser.test.ts` required
2. Verify file creates/manipulates DOM:
   ```bash
   # Should have: document, HTMLElement
   # Should NOT run in: Node environment
   ```

3. Run with UI:
   ```bash
   pnpm vitest --ui
   ```

4. Check [vitest.config.ts](../../vitest.config.ts) projects

### Unit tests failing?

1. Check suffix: `.unit.test.ts`
2. Verify no DOM operations:
   ```typescript
   // ❌ Don't do this in unit tests
   document.createElement('div')
   el.addEventListener(...)

   // ✅ Do this instead
   vi.spyOn(element, 'addEventListener')
   ```

3. Run specific test:
   ```bash
   pnpm vitest --run src/registry.unit.test.ts
   ```

## Code Style & Linting

### Format with oxfmt

```bash
pnpm format
```

Rules:
- Single quotes: `'string'`
- No semicolons: `const x = 1`
- Print width: 60 chars
- See [.oxfmtrc.json](../../.oxfmtrc.json)

### Lint with oxlint

```bash
pnpm lint
```

Enforces:
- No import cycles: `import/no-cycle: error`
- No unused exports: `import/no-unused-modules: warn`
- See [.oxlintrc.json](../../.oxlintrc.json)

### Pre-commit checklist

- [ ] `pnpm test` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm format` run
- [ ] `pnpm typecheck` passes
- [ ] Tests added for new code
- [ ] `pnpm changeset` created
- [ ] Demo updated (if user-facing)

## Adding Workspace Dependencies

To add `@vingy/shared` to `vueltip`:

```json
{
  "dependencies": {
    "@vingy/shared": "workspace:^"
  }
}
```

Then install:
```bash
pnpm install
```

Imports work naturally:
```typescript
import type { Maybe } from '@vingy/shared/types'
```

The `workspace:^` protocol:
- Links to local source
- No npm registry lookup
- Updates instantly during dev
- Publishes as exact version in released package
