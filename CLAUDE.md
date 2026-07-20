# Claude Behavior Rules

## Core Principle
Be a precise tool, not a narrator. Produce output, not commentary about output.

## Response Style
- No preamble. No "Sure!", "Great question!", "Of course!" — start directly with the answer.
- No summary at the end. Stop when the task is done.
- No unsolicited explanation. Code speaks for itself unless asked.
- No "while I'm at it" additions. Do exactly what was asked, nothing more.
- If the request is ambiguous: ask one clarifying question, then wait.

## Task Execution
- One task at a time. Complete it, then wait for the next instruction.
- Do not anticipate follow-up tasks or chain multiple changes together.
- Do not refactor, rename, or restructure anything that was not part of the request.
- Do not add comments, TODOs, or documentation unless explicitly asked.

## Code Output
- Produce working code directly. No walkthrough unless asked.
- Show only the changed section, not the entire file — unless the full file is needed.
- Use existing patterns and conventions in the codebase. Do not introduce new ones without asking.

## Clarification Protocol
Before implementing anything non-trivial:
1. State your understanding in one sentence.
2. Ask if that is correct.
3. Wait for confirmation.

## Scope Control
- Stay in scope. If a related issue is spotted, mention it in one line — do not fix it.
- Do not propose architectural changes unless asked.
- Do not suggest tools, libraries, or approaches unless the current approach is broken.

## Stack Context (AJTI)
- React 19, TypeScript, Vite, Tailwind, shadcn/ui
- Supabase (backend)
- Zod (validation)
- Vitest (testing)
- Deployed via Cloudflare Tunnel → Traefik → Kubernetes (Talos)
- German UI, English codebase

## Design System

### Leading color system: shadcn CSS variables
For **new code**, use shadcn tokens (defined in `src/main.css`, light in `:root`,
dark in `.dark`): `bg-background`, `bg-card`, `text-foreground`,
`text-muted-foreground`, `border-border`, `bg-primary`, `bg-muted`.
They adapt to the theme automatically — no conditionals, no `dark:` needed.

Legacy patterns that still exist (do not spread them further, migrate only
when touching the code anyway):
1. Radix/Spark tokens (`--color-neutral-*`, `--color-accent-*`) from
   `src/styles/theme.css` + `tailwind.config.js` — Spark scaffold legacy.
2. `dark:` variant classes on hardcoded palette colors (~40 files).
3. JS conditionals `theme === "dark" ? "…slate…" : "…"` (App.tsx,
   TopicListPanel) and `dark ? "…zinc…" : "…"` (ExamPrepDialog).

### Dark mode mechanics
- Toggle: App.tsx sets/removes the `.dark` class on `<html>`,
  persisted as `localStorage["canvas-theme"]`. Default: dark.
- CSS: `@custom-variant dark (&:is(.dark *))` in `src/main.css` drives
  `dark:` variants; `tailwind.config.js` `darkMode` mirrors this.
- SVG/diagram strokes: never use `--border` for lines that must be seen
  (nearly white in light mode) — use `--muted-foreground` for structure,
  `--border` only for subtle hairlines (see `exhibits/TopologyExhibit.tsx`).
- Deliberately always dark (terminal convention, no light variant):
  `LabScenariosDialog`, `CLIExhibit`, `TerminalEmulator` code blocks.

### Dark-mode mapping (when extending legacy `dark:` files)
| Light             | Dark                    |
|-------------------|-------------------------|
| `bg-white`        | `dark:bg-gray-900`      |
| `bg-gray-50`      | `dark:bg-gray-900`      |
| `bg-gray-100`     | `dark:bg-gray-800`      |
| `text-gray-900`   | `dark:text-gray-100`    |
| `text-gray-700`   | `dark:text-gray-300`    |
| `text-gray-600`   | `dark:text-gray-400`    |
| `border-gray-200` | `dark:border-gray-700`  |
| `border-gray-300` | `dark:border-gray-600`  |

Accent colors (sky, indigo, cyan, amber, …) and terminal blocks
(`bg-gray-900`, `bg-slate-950`, `bg-black`): leave as they are.
Text on tinted backgrounds (`bg-blue-50` etc.): check individually.

### Contrast floor
Minimum `*-500` for secondary text on white (slate-400 on white fails
at small sizes). Disabled buttons: explicit disabled colors per theme
(`disabled:bg-slate-300 … dark:disabled:bg-slate-700`), not `disabled:opacity-*`
on saturated fills.

### Spacing & layout conventions
- Tailwind spacing scale only (4px grid); no arbitrary pixel values
  where a scale step exists.
- Breakpoints in use: 375px (mobile), 768px (tablet), 1024/1280px
  (desktop). Header labels: nav labels from `xl:`, long CTA labels from
  `min-[1360px]:` — icons only below (header must never overflow).
- Tool quick-start chips use container queries (`@3xl:`), not viewport
  breakpoints.
- Dialogs: `max-w-*` + `h-[90vh]` shell, scrollable body
  (`min-h-0 flex-1 overflow-y-auto`), controls outside the scroll area.

### Component conventions
- shadcn/ui primitives from `src/components/ui/` for new UI
  (Table, Dialog, Button …), Phosphor icons (`@phosphor-icons/react`).
- Exhibits render exclusively through `exhibits/ExhibitRenderer` —
  never render CLI/topology/table markup inline in question components.
- Font: IBM Plex Sans (UI), IBM Plex Mono (CLI/terminal/subnets).
