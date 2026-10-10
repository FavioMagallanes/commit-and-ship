# Commit & Ship

A tech news aggregator for developers: what matters from Hacker News, GitHub releases, dev.to and
official blogs, ordered by topic and time, without accounts or algorithms. The UI is in Spanish.

> **Status:** foundation only. The app shell, design tokens, tooling and CI are in place; the news
> feed, data layer and components are built in later features.

## Stack

| Area      | Choice                                                                            |
| --------- | --------------------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, React Compiler                      |
| Language  | TypeScript ~6.0                                                                   |
| Styling   | Tailwind CSS 4 with design tokens in CSS (`light-dark()` for light and dark)      |
| Fonts     | `next/font`: Geist (headings), Inter (body), Geist Mono                           |
| Data      | TanStack Query (client), nuqs (filters in the URL), Zod added with the data layer |
| Quality   | Prettier, ESLint (flat config, import sorting), Husky, lint-staged, commitlint    |
| Tests     | Vitest + Testing Library (unit), Playwright (end to end, Chromium)                |
| CI / Host | GitHub Actions, Vercel                                                            |

## Requirements

- Node.js `>=22.12` (`.nvmrc` pins 22)
- pnpm 10 (the exact version is in `packageManager`; `corepack enable` installs it)

## Getting started

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

## Scripts

| Script                                   | What it does                                         |
| ---------------------------------------- | ---------------------------------------------------- |
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js development server, production build, server |
| `pnpm lint`                              | ESLint (includes import sorting)                     |
| `pnpm typecheck`                         | Generates route types and runs `tsc --noEmit`        |
| `pnpm format` / `pnpm format:check`      | Prettier write / check                               |
| `pnpm test` / `pnpm test:watch`          | Vitest once / in watch mode                          |
| `pnpm test:e2e`                          | Playwright (builds and starts the app itself)        |

First time running the end-to-end tests: `pnpm exec playwright install chromium`.

## Quality gates

- **pre-commit:** lint-staged runs `eslint --fix` and `prettier --write` on staged files.
- **commit-msg:** commitlint enforces [Conventional Commits](https://www.conventionalcommits.org)
  (for example `feat: add topic filter`, `fix(search): ignore accents`). Body lines are limited to
  100 characters.
- **CI** (`.github/workflows/ci.yml`): runs on every push to `main`: lint, types, format, unit tests
  and build, plus the end-to-end suite in a separate job.
- **Workflow:** trunk-based. Work units are committed straight to `main`; there are no feature
  branches or pull requests.

## Project structure

```text
src/
  app/          App Router: layout, providers, pages, global styles and tokens
  shared/       Code used across features
    lib/        Shared utilities (cn)
    ui/         UI primitives (Button, Chip, Pill)
    tests/      Shared tests and fixtures
e2e/            Playwright tests
```

## Design tokens

Tokens come from the Penpot design file and live in `src/app/globals.css`:

- Colors are CSS variables defined with `light-dark()`. The theme follows the OS; adding `.light` or
  `.dark` to `<html>` forces one. Use them as Tailwind utilities: `bg-canvas`, `bg-surface`,
  `text-ink`, `text-muted`, `border-line`, `bg-accent`, `text-on-accent`, `text-danger-text`.
- The type scale (`text-xs` to `text-4xl`, plus `text-md`) and radii (`rounded-sm` to `rounded-xl`,
  `rounded-full`) replace Tailwind's defaults. Spacing uses Tailwind's 4px step.

## Version notes

Some tools are intentionally not on their very latest major, to stay compatible with the rest:

- **TypeScript ~6.0:** `typescript-eslint` supports `typescript <6.1`.
- **ESLint 9:** the plugins used by `eslint-config-next` (React, jsx-a11y, import) support up to 9.
- **lint-staged 16:** version 17 requires Node `>=22.22.1`.
- **Cache Components and Partial Prefetching** are enabled in `next.config.ts`, which is the default
  of `create-next-app` 16.4.
