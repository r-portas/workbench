@README.md

## Cursor Cloud specific instructions

This repo is a Bun monorepo with three independent install roots (no Bun workspaces); each has its
own `bun.lock` and must be installed separately:

- `/` — workspace tooling only (`oxfmt` formatting, `bun scripts/new-journal.ts`).
- `web/` — the Workbench website (TanStack Start + React 19 + Tailwind v4). This is the runnable app.
- `templates/tss/` — a scaffoldable project template that CI builds to keep it healthy.

Bun is the package manager and runtime, preinstalled and available on `PATH` (`/usr/local/bin/bun`).
The startup update script runs `bun install` in all three roots.

Run/lint/test/build (see each `package.json` for the source of truth):

- Web dev server: `cd web && bun dev` → serves on `http://localhost:3000` (port overridable via `PORT`).
  Vite has `prerender` enabled, so `bun run build` prerenders every crawlable route to static HTML.
- Web build (also the lint+typecheck gate): `cd web && bun run build` = `vite build` + `tsc --noEmit`
  + `oxlint .`. There is no standalone `lint` script; linting runs as part of the build.
- Format check: `bun run fmt:check` at the root, and inside `web/` and `templates/tss/`.
- Tests use Bun's runner (`bun test`). No test files exist yet, so `bun test` reports "No tests found".
