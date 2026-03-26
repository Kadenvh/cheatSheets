---
name: frontend-design
description: "Build production-grade frontend interfaces. Use when creating components, pages, or UI features. Encodes stack conventions (React, TypeScript, Tailwind, Vite) and design patterns."
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - Grep
---

# Frontend Design

Build distinctive, production-grade frontend interfaces following established project conventions.

## Completion Gate

Before building new UI, check for unfinished features:

```bash
node .ava/dal.mjs action list --outcome partial
```

If partial-outcome actions exist, present them to the user. New UI on top of unfinished backends creates dead tabs. Get explicit confirmation before proceeding with new frontend work.

## Stack

- **Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS 3.x (utility-first, no inline styles, no CSS modules)
- **Bundler:** Vite 8
- **Routing:** react-router-dom v7
- **Notifications:** sonner (toast)
- **Testing:** Vitest + React Testing Library
- **Lint:** ESLint with react-hooks and react-refresh plugins

## Project Structure Convention

Features live in `src/features/{feature-name}/`:

```
src/features/{feature-name}/
├── Page.tsx           # Main page component (default export, registered in routes)
├── README.md          # What this feature does, key decisions, data flow
├── components/        # Feature-specific components (optional, for complex features)
└── hooks/             # Feature-specific hooks (optional)
```

Shared components: `src/components/`
Config: `src/config/routes.ts`

## Design Rules

### ALWAYS
- Use Tailwind utility classes exclusively — no inline `style={}`, no CSS files
- Dark theme by default: `bg-zinc-900`, `text-zinc-100`, `border-zinc-700/50`
- Use `zinc` palette for neutrals, accent colors sparingly and consistently
- Responsive: mobile-first, test at 375px and 1440px minimum
- All interactive elements need hover/focus/active states
- Loading states for async operations (skeleton or spinner, never blank)
- Error states with clear messaging and recovery action
- Use semantic HTML (`<nav>`, `<main>`, `<section>`, `<button>` not `<div onClick>`)
- TypeScript strict: no `any`, all props typed, all state typed
- Components under 200 lines — extract sub-components if larger

### DO NOT
- Import CSS frameworks or component libraries (no shadcn, no MUI, no Chakra)
- Use `className` string concatenation — use template literals or clsx if needed
- Create global CSS — everything is Tailwind utilities or `@apply` in rare cases
- Use `useEffect` for derived state — compute inline or use `useMemo`
- Hardcode colors outside the Tailwind palette
- Use `px` for spacing — use Tailwind spacing scale (`p-4`, `gap-2`, etc.)

## Component Patterns

### Page Component Template

```tsx
export default function FeatureNamePage() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">Feature Name</h1>
        {/* Actions */}
      </header>
      <main className="flex flex-col gap-4">
        {/* Content */}
      </main>
    </div>
  );
}
```

### Common UI Patterns

**Cards:** `bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4`
**Buttons (primary):** `px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors`
**Buttons (ghost):** `px-3 py-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 rounded-lg transition-colors`
**Input fields:** `bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none`
**Badges:** `px-2 py-0.5 text-xs rounded-full bg-{color}-500/20 text-{color}-400`
**Dividers:** `border-t border-zinc-700/50`

### Data Fetching Pattern

```tsx
const [data, setData] = useState<Type[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  fetch("/api/endpoint")
    .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
    .then(setData)
    .catch(e => setError(e.message))
    .finally(() => setLoading(false));
}, []);
```

## Quality Checklist

Before considering a UI component complete:

- [ ] Dark theme renders correctly (no white backgrounds, no invisible text)
- [ ] Responsive at mobile (375px) and desktop (1440px)
- [ ] All buttons have hover states
- [ ] Loading states shown during fetches
- [ ] Error states handle and display failures
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] No ESLint warnings
- [ ] Accessible: keyboard navigable, proper heading hierarchy, alt text on images
