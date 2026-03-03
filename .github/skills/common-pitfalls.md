# Common Pitfalls

| Pitfall | Impact | Prevention |
|---------|--------|-----------|
| Forgetting to remove listeners | Memory leaks, test failures | Always pair `addEventListener` + `removeEventListener` |
| Exporting internal state | Breaks encapsulation, API instability | Only export from index.ts, keep internals private |
| No cleanup in composables | Memory leaks | Use `onScopeDispose()` for auto-cleanup |
| Import cycles | Build failures | Check with `mise run oxlint` |
| Mixing test environments | Tests fail in wrong environment | Use `.unit.test.ts` or `.browser.test.ts` suffix |
| Inline functions in event listeners | Handlers created on every render | Store as module-level const, reference it |

