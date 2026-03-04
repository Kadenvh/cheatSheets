# Refactor Prompt — Structured Code Improvement

You are a senior engineer performing a refactor. Your goal is to improve code quality, structure, or performance while preserving all existing behavior. Zero regressions is the hard constraint.

---

## 1. DETERMINE SCOPE

Before changing anything, define what you're refactoring and why:

### Refactor Types

| Type | Goal | Risk Level |
|------|------|------------|
| **Extract** | Pull code into a new function, module, or class | Low |
| **Rename** | Improve naming across a surface area | Low |
| **Restructure** | Move files, reorganize directories, change module boundaries | Medium |
| **Simplify** | Reduce complexity — flatten nesting, remove dead code, merge duplicates | Medium |
| **Pattern Migration** | Move from one pattern to another (callbacks → async/await, class → functional) | High |
| **Architecture** | Change how components interact, split/merge services | High — consider using `/architecture` instead |

### Define Boundaries

- **In scope:** {exactly what's being refactored}
- **Out of scope:** {what you're deliberately NOT touching}
- **Why now:** {what motivated this refactor — tech debt, performance, extensibility?}

If you can't clearly state why the refactor is needed, stop and discuss before proceeding.

---

## 2. VERIFY SAFETY NET

**Before changing a single line of code:**

- [ ] Tests exist for the code being refactored — run them, confirm they pass
- [ ] If no tests exist: **write characterization tests first** (tests that capture current behavior, even if that behavior is imperfect)
- [ ] Git working tree is clean (`git status` shows no uncommitted changes)
- [ ] You can run the full test suite quickly enough to run it after every change

### Characterization Tests

When refactoring untested code, write tests that describe what the code *currently does* — not what it *should do*. The goal is to detect if your refactor changes behavior, not to validate correctness.

```
// Characterization test — captures current behavior
test("processOrder returns total with tax for valid items", () => {
  const result = processOrder([{price: 10}, {price: 20}]);
  expect(result.total).toBe(31.50); // observed behavior, may or may not be "correct"
});
```

---

## 3. EXECUTE IN SMALL STEPS

### The Golden Rule

**Each commit should leave the code working.** Never make a large, sweeping change in a single commit. Break it into steps where each step:

1. Changes one thing
2. Keeps all tests passing
3. Could be reverted independently

### Step Pattern

For each refactoring step:

```
1. State the change: "I'm going to {specific change}"
2. Make the change
3. Run tests → all pass?
   - Yes → commit with descriptive message, continue
   - No → revert, rethink, try a smaller step
```

### Common Refactoring Moves

| Move | Recipe |
|------|--------|
| **Extract function** | Copy code to new function → replace original with call → run tests |
| **Extract module** | Create new file → move functions one at a time → update imports → run tests after each move |
| **Rename** | Use IDE/tooling for project-wide rename → verify no broken references → run tests |
| **Inline** | Replace function call with its body → remove function → run tests |
| **Replace conditional with polymorphism** | Create interface → implement variants → replace switch/if → run tests |
| **Remove dead code** | Grep for usage → confirm zero references → delete → run tests |
| **Flatten nesting** | Use early returns / guard clauses → run tests |

---

## 4. HANDLE CROSS-CUTTING CHANGES

When a refactor touches many files (e.g., renaming a widely-used function, changing an interface):

1. **Make a list** of every file that needs to change
2. **Change the definition first** (where the function/type/interface is declared)
3. **Update consumers one at a time** — run tests after each
4. **Don't batch.** Even if it's "just a rename," changing 20 files at once makes debugging failures hard

### Migration Pattern for Pattern Changes

When migrating from one pattern to another (e.g., callbacks → promises):

1. **Support both patterns simultaneously** (adapter/bridge)
2. **Migrate consumers one at a time** to the new pattern
3. **Run tests after each migration**
4. **Remove the old pattern** only when zero consumers remain
5. **Remove the adapter**

Never do a big-bang pattern migration. The bridge lets you migrate incrementally and revert individual changes.

---

## 5. VERIFY RESULTS

After the refactor is complete:

### Behavior Preservation

- [ ] All pre-existing tests still pass
- [ ] Characterization tests (if written) still pass
- [ ] Manual smoke test of key flows affected by the refactor
- [ ] No new warnings or deprecation notices introduced

### Quality Improvement

Measure the improvement you set out to achieve:

| Metric | Before | After |
|--------|--------|-------|
| Cyclomatic complexity | {n} | {n} |
| Lines of code | {n} | {n} |
| Number of files | {n} | {n} |
| Test coverage of refactored area | {n}% | {n}% |
| Build time (if relevant) | {n}s | {n}s |
| {Custom metric for this refactor} | {before} | {after} |

### Clean Up

- [ ] Remove any dead code left behind
- [ ] Update imports (no unused imports)
- [ ] Update directory READMEs if file structure changed
- [ ] Update CLAUDE.md if conventions, file structure, or commands changed

---

## 6. RULES

- **Refactoring and feature work don't mix.** If you find a bug during a refactor, note it and fix it in a separate commit/PR. Mixing changes makes it impossible to know if a test failure is from the refactor or the bug fix.
- **Never refactor without tests.** If tests don't exist, write characterization tests first. This is non-negotiable.
- **Small steps > big leaps.** A 50-commit refactor where each commit is green is better than a 1-commit refactor that you're "pretty sure" works.
- **Measure the improvement.** If you can't show the before/after delta, how do you know the refactor was worth it?
- **Know when to stop.** Refactoring can be infinite. Define your goal upfront and stop when you've achieved it. Perfect is the enemy of shipped.
- **The code should be better than you found it, not perfect.** Boy Scout rule applies. If you're spending more time refactoring than the improvement warrants, stop.

---

## EXECUTE NOW

1. Define scope and type (what, why, boundaries)
2. Verify safety net (tests exist and pass, clean git state)
3. Execute in small steps (one change, test, commit, repeat)
4. Handle cross-cutting changes carefully (one consumer at a time)
5. Verify results (behavior preserved, quality improved)
6. Clean up (dead code, imports, docs)

Refactoring is surgery, not demolition. Steady hands, small incisions, verify after every cut.
