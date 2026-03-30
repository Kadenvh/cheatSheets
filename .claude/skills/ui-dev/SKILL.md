---
name: ui-dev
description: "Build frontend UI: components, pages, refactors, styling, and reviews in React + Tailwind codebases"
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - Grep
---

# UI Development — Components, Pages, Styling & Reviews

Build and maintain frontend interfaces that match existing project conventions.

## Instructions

Follow the protocol below. For the full detailed version, read `.prompts/ui-dev.md`.

### Protocol:
   - **Step 0 (mandatory)** → Read existing components, Tailwind config, router, and shared primitives BEFORE writing anything
   - **New Component** → Match existing patterns → props interface → handle states → compose
   - **New Page/View** → Follow routing pattern → loading/error/empty/populated states → compose from existing components
   - **UI Refactor** → Extract components, simplify conditionals, remove duplication — preserve behavior
   - **Style System** → Extend Tailwind config/tokens — don't replace
   - **UI Review** → Score 6 dimensions → flag anti-patterns → prioritized recommendations

## Key Rules

- **Read before writing.** Every project has unwritten conventions. Discover them by reading 2-3 existing components.
- **Match, don't invent.** Follow established patterns for file structure, state management, styling, and naming.
- **Utility-first styling.** Tailwind utilities in markup. Extract only when a pattern appears 3+ times.
- **Handle all states.** Every page: loading, error, empty, populated. Every interactive element: default, hover, focus, disabled.
- **Accessibility is not optional.** Semantic HTML, keyboard navigation, labels, contrast.

## Full Protocol

Detailed steps:

1. **Read existing code.** Find component directory, read 2-3 components, read Tailwind config, read router setup, identify shared primitives.
2. **New Component:** Accept `className` for composition. Use TypeScript interfaces for props. Union types for variants. Default optionals in destructuring. Keep interface narrow.
3. **New Page:** Handle loading/error/empty/populated. Use project's existing layout wrapper. Compose from existing components first.
4. **Styling:** Use design tokens from tailwind.config. Arbitrary values are a code smell. Mobile-first responsive. Dark mode if project supports it.
5. **Refactor:** Extract when >30 lines with own state, or pattern appears 2+ times. Verify behavior preservation.
6. **Review:** Score consistency, component quality, responsiveness, accessibility, state management, performance (each 1-5). Flag div soup, inline logic, state hoisting, styling chaos, missing states.
