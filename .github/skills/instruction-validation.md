# Instruction Validation & Refinement

## Quick Reference: Validation Checklist

| Check | How to Verify | Fix If Failed |
|-------|---------------|---------------|
| Instructions match codebase | Read source files, compare patterns | Update instructions with real code examples |
| Examples are current | Check file links still exist | Update links or remove outdated examples |
| Patterns are cohesive | Cross-reference skills for consistency | Consolidate or clarify conflicting advice |
| Instructions overfit internals | Scan for exact literals and private names | Replace with stable pattern + one concrete reference |
| Anti-patterns are clear | Scan all ❌ marked items | Ensure each has explanation and correct approach |
| Decision trees are accurate | Follow trees on real tasks | Add missing branches, remove irrelevant ones |
| Completeness coverage | Map all file types and workflows | Add missing patterns, remove duplicates |
| Practical applicability | Use instruction in real task | Simplify if too complex, add examples if unclear |

---

## Decision Tree: When to Validate

**Are you about to commit code?**
- Yes → Run validation before commit
- No → Continue

**Did you make significant changes?**
- Yes → Validate affected skills
- No → Continue

**Are you uncertain if instructions match reality?**
- Yes → Run full validation
- No → Continue

**Do instructions feel incomplete for a common task?**
- Yes → Add missing skill or pattern
- No → Done

---

## Validation Workflow

### Step 1: Identify What to Validate

**Questions to ask:**
1. What file did I just modify or create?
2. Does an instruction skill cover this pattern?
3. Are examples in instructions pointing to this file?
4. Would the instructions have made this task faster?

**Example workflow:**
```
Modified: packages/vueltip/src/listeners.ts
↓
Skills covering this:
- Common Pitfalls (inline listeners, handler references)
- State Management (event handler wrapper pattern)
↓
Check: Do examples match current implementation?
```

### Step 2: Read Actual Implementation

**Always verify against real code, not memory:**

```bash
# Check if example pattern still exists
grep -n "export const onMouseover" packages/vueltip/src/listeners.ts

# Read the full implementation
cat packages/vueltip/src/listeners.ts | head -50

# Compare with instructions
cat .github/skills/state-management.md | grep -A 10 "Event Handler Wrapper"
```

**Critical:** Instructions are only valuable if examples are accurate and current.

### Step 3: Cross-Reference Skills for Consistency

**Common inconsistencies to catch:**

| Conflict | How to Find | How to Fix |
|----------|-------------|-----------|
| Same pattern explained differently | Search both skills for same keyword | Pick clearer explanation, remove duplicate |
| Contradictory advice | Search for opposing ❌ markings | Determine which is correct, remove error |
| Different terminology | Search for synonyms across skills | Standardize term usage everywhere |
| Over-specific literals | Search defaults/attribute names in docs | Keep literals only when part of public API |
| Missing links | Grep for file references | Verify all links exist, update if moved |
| Outdated examples | Check line counts match | Update example code to match current file |

**Example validation:**

```bash
# Find all references to "state.ts" across skills
grep -r "state.ts" .github/skills/ | wc -l

# Check if file actually exists and at correct location
ls -la packages/vueltip/src/state.ts

# Verify line numbers in examples are still valid
wc -l packages/vueltip/src/state.ts  # Should match any line ranges in examples
```

### Step 4: Verify Examples Are Real

**For each code example in instructions:**

1. Does the code block actually exist in the codebase?
2. Are line numbers accurate if provided?
3. Would copying the code work as-is?
4. Are imports complete and correct?
5. Is this showing a durable pattern, not an unstable literal?

**Example check:**

```typescript
// From common-pitfalls.md:
// "Example: [listeners.ts](../../packages/vueltip/src/listeners.ts)"

// Verify file exists and has example:
grep -A 5 "export const onMouseenter" packages/vueltip/src/listeners.ts
```

If example doesn't match, update instructions.

### Step 5: Test Instructions Against Real Work

**Before committing updates to skills:**

1. **Pick a real task** - "Add a new feature to vueltip"
2. **Use instructions as guide** - Read through relevant skills
3. **Verify they help** - Did they guide you correctly?
4. **Note gaps** - Did you need info not in instructions?
5. **Update or add** - Fill gaps immediately

**Red flags during use:**
- ❌ Searching for pattern that should be in instructions
- ❌ Example doesn't match your file
- ❌ Instruction contradicts what you're doing
- ❌ Missing decision tree branch

If any flag occurs, pause and fix instructions.

### Step 6: Validate Completeness

**Coverage areas to check:**

| Area | Validation | Example |
|------|-----------|---------|
| All file types | Can I find pattern for each src/ file? | `state.ts`, `listeners.ts`, `options.ts` all covered? |
| All workflows | Does skill cover: add feature, fix bug, test, debug? | Run through each scenario mentally |
| All anti-patterns | Does each ❌ have corresponding ✅ fix? | Inline listener → stored reference shown |
| All decisions | Can I follow tree to reach correct choice? | Pick random tree node, can I reach decision? |
| All imports | Are imports correct and complete in examples? | Can I copy example code and run it? |

---

## Iteration Workflow

### When to Update Skills

**Trigger 1: Found a gap while working**
```
Working on feature → Need pattern not in skills
↓
PAUSE and update skills with new pattern
↓
Resume work, but now instructions are more complete
```

**Trigger 2: Discovered pattern is outdated**
```
Read instruction → Check example in codebase
↓
Example doesn't match → Pattern must have changed
↓
STOP and update instruction with current pattern
↓
Resume task with accurate guidance
```

**Trigger 3: Pattern exists but unclear**
```
Read instruction → Try to apply it
↓
Result is still confusing or hard to follow
↓
Rewrite with clearer language, better examples
↓
Test rewritten version on new task
```

### Update Checklist

Before committing changes to any skill:

- [ ] **Accuracy**: Example matches current codebase
- [ ] **Completeness**: All related patterns included
- [ ] **Clarity**: Language is direct and unambiguous
- [ ] **Consistency**: Terms match other skills
- [ ] **Linkage**: All file links still valid
- [ ] **Durability**: Guidance survives field/default renames
- [ ] **Anti-patterns**: Each ❌ has ✅ fix shown
- [ ] **Decision trees**: All branches covered
- [ ] **Practicality**: Real-world applicability verified

---

## Validation Commands

### Check for Broken Links

```bash
# Find all file references in skills
grep -rho '\[.*\](.*packages.*\.ts' .github/skills/

# Verify each file exists
ls packages/vueltip/src/listeners.ts
ls packages/vuebugger/src/registry.ts
# etc...
```

### Verify Examples Are Current

```bash
# Check if pattern still exists
grep "export const useVueltip" packages/vueltip/src/composables.ts

# Check line count (for line range validation)
wc -l packages/vueltip/src/state.ts

# Search for pattern mentioned in instructions
grep -A 5 "export const onMouseover" packages/vueltip/src/listeners.ts
```

### Cross-Check Skills Consistency

```bash
# Find all mentions of a pattern
grep -r "onScopeDispose" .github/skills/

# Check if it's defined in codebase
grep -r "onScopeDispose" packages/

# Ensure terminology is consistent
grep -r "module-level" .github/skills/ | wc -l
```

### Validate Completeness

```bash
# List all TypeScript files in packages
find packages -name "*.ts" -not -name "*.test.ts" | sort

# For each file, check if it's mentioned in instructions
# If not, may indicate missing pattern
for file in $(find packages -name "*.ts" -not -name "*.test.ts"); do
  if ! grep -q "$(basename $file)" .github/skills/*.md; then
    echo "Missing pattern: $file"
  fi
done
```

---

## Red Flags: Patterns to Catch

**Red Flag 0: Docs mirror private internals too closely**
```
Instruction includes exact defaults and private key names
↓
Small refactor causes many skill edits
↓
Fix by documenting invariant behavior and linking to source
for current literals
```

**Red Flag 1: Example code doesn't compile**
```typescript
// ❌ Instruction shows:
import { byUid } from './registry'
export const entries = byUid.get('id')  // This works?

// ✅ Verify in actual file:
grep -A 5 "export const byUid" packages/vuebugger/src/registry.ts
```

**Red Flag 2: Outdated file structure**
```
Instruction says: "import from ./state"
But actually: File was renamed to ./reactive-state
↓
STOP: Update all references in instructions
```

**Red Flag 3: Anti-pattern doesn't match reality**
```
Instruction warns: "Don't use vitest hooks"
But in actual tests: All tests use hooks
↓
Either instructions are wrong OR tests need fixing
Check git blame to see why pattern differs
```

**Red Flag 4: Decision tree has dead ends**
```
Tree: "Do you need cleanup?" → Yes → "Use onScopeDispose()"
But in codebase: Some cleanup uses directives, not composables
↓
Tree branch is incomplete, needs both paths
```

---

## Validation Checklist Before Committing

```
Skills updated? Run this before git commit:

[ ] All ❌ anti-patterns have ✅ correct approach shown
[ ] All file links still valid: grep -r "packages/.*\.ts"
[ ] All example code matches current implementation
[ ] Decision trees have all branches covered
[ ] No contradictions between skills on same topic
[ ] New patterns in codebase are documented in skills
[ ] Line count of documentation > code? (Coverage ratio)
[ ] Searched for term in codebase to verify it exists
[ ] Ran skill's own command examples, they work?
[ ] Asked: "Would this have helped me 30 mins ago?"
```

**Failed check → Update before committing.**

---

## When to Add New Skills

**Add new skill if:**
1. ✅ Multiple patterns don't fit existing skills
2. ✅ Common task type not covered
3. ✅ New tool/technology added to monorepo
4. ✅ Pattern discovered during work that no skill covers

**Don't add if:**
1. ❌ Pattern fits existing skill (consolidate instead)
2. ❌ Only one small example exists
3. ❌ Overlaps heavily with another skill

**Example decision:**
```
New pattern: "Floating-UI integration with Vue"
↓
Check existing skills:
- common-workflows.md: Covers high-level plugin pattern
- type-patterns.md: Not relevant
- state-management.md: Not directly about this
↓
Decision: Could fit in common-workflows as subsection
OR: Specific enough to warrant new skill?
↓
If multiple patterns (positioning, mounting, updates):
ADD new skill: Integration Patterns
↓
If just positioning example:
ADD to common-workflows.md
```

---

## Meta-Validation: Are Instructions Good?

**Ask these questions:**

1. **Would I have written it this way?** - If no, it's too verbose
2. **Can I find what I need in 30 seconds?** - If no, organization is poor
3. **Are decision trees natural?** - If no, they miss actual branch points
4. **Do examples exactly match code?** - If no, they mislead
5. **Is terminology consistent?** - If no, confusing across skills
6. **Would new agent understand this?** - If no, too advanced or unclear
7. **Does it save time vs reading code?** - If no, not valuable

**If any answer is "no":**
→ Rewrite that section immediately
→ Test with real task before re-committing

---

## Self-Improvement Loop

```
1. Use instructions on real task
   ↓
2. Note: What helped? What was missing?
   ↓
3. Find pattern in codebase that instructions missed
   ↓
4. Update skill with new pattern + example
   ↓
5. Test updated instruction on new similar task
   ↓
6. Commit when validated
   ↓
7. Loop back to step 1 with different task
```

**Result:** Instructions continuously improve through real usage.

