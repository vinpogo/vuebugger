# Type Patterns

## Quick Reference

| Pattern | Use Case | Example |
|---------|----------|---------|
| Type guard | Narrow type safely | `el is HTMLElement` |
| Branded type | Create distinct types | `uid` brand prevents mixing IDs |
| Ambient declaration | Extend Vue globally | `declare module 'vue'` |
| Generic constraint | Bind getter/setter types | `getOption<T extends keyof Options>` |
| Conditional type | Compute types | `T extends string ? string[] : T[]` |

---

## Decision Tree

**Do you need to safely narrow a type?**
- Yes → **Type guard** (`type is X`) with `instanceof` or property check
- No → Continue

**Do you need to prevent mixing similar types?**
- Yes → **Branded type** (opaque type with unique brand)
- No → Continue

**Do you need to extend Vue's type system?**
- Yes → **Ambient declaration** (`declare module 'vue'`)
- No → Continue

**Do you need generic type safety?**
- Yes → **Generic constraint** (`<T extends Keyof X>`)
- No → Use `any` only if absolutely necessary

---

## Type Guards

**Pattern: Safely narrow types at runtime**

```typescript
// Type guard returns true and narrows type
export function isHtmlElement(
  el: EventTarget,
): el is HTMLElement {
  return el instanceof HTMLElement
}

// Use with type narrowing
const event = new MouseEvent('mouseenter')
const target = event.target

if (isHtmlElement(target)) {
  // target is now HTMLElement, not EventTarget
  target.addEventListener('click', () => {})
}

// For properties
export function isInputElement(
  el: HTMLElement,
): el is HTMLInputElement {
  return el instanceof HTMLInputElement
}

// For interface checks
export function hasContent(
  value: any,
): value is { text?: string } {
  return 'text' in value
}
```

**Critical:**
- Always return `type is X` (not boolean)
- Use `instanceof` for classes
- Use `in` operator for properties
- Guard evaluated at runtime; assertion removed by TypeScript

**Anti-patterns:**
- ❌ Type guard returning `boolean` (no narrowing)
- ❌ Guard that doesn't match returned type
- ❌ Overly complex guards (break into smaller functions)

---

## Branded Types (Opaque Types)

**Pattern: Create distinct types from the same underlying type**

**Example:** [Vuebugger types.ts](../../packages/vuebugger/src/types.ts)

```typescript
// Prevent mixing different ID types
export type uid = string & { readonly __brand: 'uid' }
export type groupId = string & { readonly __brand: 'groupId' }

// Helper to create branded values
const uid = (value: string): uid => value as uid
const groupId = (value: string): groupId => value as groupId

// Now these are distinct types - can't mix them
const entry: VuebuggerEntry = {
  uid: uid('component/state-1'),
  groupId: groupId('module-state'),
}

// TypeScript prevents mixing:
// ❌ entry.uid = groupId('foo')  // Error: Type 'groupId' is not assignable to type 'uid'
// ✅ entry.uid = uid('component/state-2')
```

**Benefits:**
- Prevents accidental mixing of similar IDs
- Self-documenting code
- Zero runtime overhead
- Compiler catches errors

**When to use:**
- Multiple ID types in same module
- Distinguishing UIDs from groupIds
- Domain-specific identifiers

---

## Ambient Type Declarations

**Pattern: Extend Vue's global types**

**Example:** [Vueltip types.ts](../../packages/vueltip/src/types.ts)

```typescript
// Extend Vue's GlobalDirectives
declare module 'vue' {
  export interface GlobalDirectives {
    vTooltip: TooltipDirective
  }
}

// Now v-tooltip is recognized in templates:
// <div v-tooltip="'text'"></div>
```

**Use cases:**
- Register custom directives in global type system
- Extend component props
- Add module augmentation

**Vueltip custom data augmentation:**

```typescript
declare module '@vingy/vueltip' {
  interface CustomVueltipData {
    userId?: number
    severity?: 'info' | 'warning' | 'error'
  }
}

// Now content.custom is strongly typed:
// v-tooltip="{ text: 'Profile', custom: { userId: 1 } }"
```

**Anti-patterns:**
- ❌ Ambient declarations for private types
- ❌ Multiple ambient declarations in different files (consolidate in types.ts)

---

## Generic Constraints

**Pattern: Type-safe configuration getters/setters**

**Example:** [Vueltip options.ts](../../packages/vueltip/src/options.ts)

```typescript
// Define options interface
export interface Options {
  showDelay: number
  hideDelay: number
  keyAttribute: string
  placementAttribute: string
}

// Generic getter with constraint - return type is inferred!
export const getOption = <T extends keyof Options>(
  key: T,
): Options[T] => options[key]

// Usage - TypeScript knows return type:
const delay: number = getOption('showDelay')  // ✅ Correct
const attr: string = getOption('keyAttribute')  // ✅ Correct
// const bad = getOption('invalid')  // ❌ Error at compile time!
```

**Benefits:**
- Autocomplete for option keys
- Return type inferred from key parameter
- Compile-time validation

**Pattern:**
```typescript
// Generic setter with partial override
export const setOptions = (opts?: Partial<Options>) => {
  options = { ...options, ...opts }
}
```

---

## Conditional Types

**Pattern: Compute types based on conditions**

```typescript
// Simple conditional
type Maybe<T> = T | null | undefined

// Checks at compile time:
type A = Maybe<string>  // string | null | undefined
type B = Maybe<number>  // number | null | undefined

// More complex
type ExtractEvent<T> = T extends HTMLElement ? Event : never

// Use with generics
export function ensureKey<T>(
  el: HTMLElement,
  fn: (key: string) => T,
): T | undefined {
  const key = el.getAttribute(getOption('keyAttribute'))
  if (!key) return undefined
  return fn(key)
}
```

---

## Anti-patterns

- ❌ Exporting `any` instead of proper types
- ❌ Type assertions with `as` when type guard would work
- ❌ Overly complex types that confuse developers
- ❌ Mixing branded and unbranded versions of same type
- ❌ Not using `Readonly<T>` for immutable refs
- ❌ Generic constraints that are too loose (`extends any`)
