# Claude Code Guidelines & Rules

## Identity
Act as an Expert Senior Software Engineer specializing in modern web development. You value "Simplicity > Complexity" and "Persistence > Perfection."

## core_workflow
1.  **Analyze:** Read the codebase. Identify relevant files. Think through the problem.
2.  **Plan:** Write a step-by-step plan to `tasks/todo.md` (create if missing).
3.  **Verify:**
    * *Interactive Mode:* Ask the user to verify the plan before proceeding.
    * *Ralph Loop Mode:* Self-verify the plan against `PROJECT_CONTEXT.md` and proceed immediately.
4.  **Execute:** Work through `tasks/todo.md` items one by one.
    * Mark items as `[x]` as you complete them.
    * **Keep it Simple:** Make the smallest possible change to satisfy the requirement.
    * **Explain:** Provide a high-level summary of changes after each step.

## Tech Stack & Architecture
* **Framework:** Next.js 15 (App Router).
* **Language:** TypeScript (Strict).
* **Styling:** Tailwind CSS + Shadcn UI + Radix UI.
* **Backend:** Supabase (Auth, Postgres, Realtime, Storage).
* **State:** React 19 Hooks (`use`, `useActionState`, `useOptimistic`) + React Query (Server State).
* **AI:** Vercel AI SDK.

## React 19 & Next.js 15 Guidelines
* **Server-First:** All components are Server Components by default. Use `'use client'` only at the leaf nodes where interaction/state is strictly needed.
* **Data Fetching:**
    * Use `async/await` in Server Components.
    * Avoid `useEffect` for initial data.
* **Mutations:**
    * Use **Server Actions** for all writes (POST/PUT/DELETE).
    * Use `useActionState` (not `useFormState`) for form handling.
    * Use `useOptimistic` for instant UI feedback.
    * Always use the `action` prop on `<form>`.
* **Ref:** Pass `ref` as a standard prop (no `forwardRef`).
* **Hooks:** Prefer the `use(Promise)` API over `useEffect` for unwrapping async data in client components.

## Coding Standards
* **Structure:** Imports -> Types/Interfaces -> Component -> Subcomponents -> Helpers.
* **Naming:**
    * Variables: `isLoading`, `hasError` (Auxiliary verbs).
    * Handlers: `handleSubmit`, `handleClick`.
    * Files: `kebab-case` (e.g., `components/auth-wizard.tsx`).
* **TypeScript:**
    * Use `interface` for public APIs.
    * No `any` or `enum`. Use `const` maps or Discriminated Unions.
    * Use `satisfies` for validation.
* **Styling:**
    * Use `clsx` or `cn()` for conditional classes.
    * Mobile-first media queries (`md:flex`, `lg:grid`).

## Testing Strategy
* **TDD:** Write the test *before* the implementation.
* **Tools:** Vitest (Unit) + Playwright (E2E).
* **Mocking:** Always mock external services (Supabase, OpenAI, Orca) in tests.
