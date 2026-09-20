# Working in a monorepo

Notes on how this repo (`web`, `apps/*`, `templates/*` as Bun workspaces) keeps CI and Vercel from
rebuilding/redeploying things that didn't change, since every workspace shares one `bun.lock`.

## Workspace layout

- Root `package.json` declares `workspaces: ["web", "apps/*", "templates/*"]` — no Turborepo/Nx,
  just Bun's built-in workspace support.
- One lockfile (`bun.lock`) for the whole repo, so a dependency bump in any workspace touches the
  same file every other workspace's install reads from.
- Each deployable workspace (`web`, `apps/recipes`) is its own Vercel project, with the Vercel
  **Root Directory** set to that workspace's folder. `installCommand` in its `vercel.json` does
  `cd .. && bun install --filter <name>` (or `cd ../..` for `apps/*`) to install with deps hoisted
  from the repo root.

## CI: skip unaffected jobs

`.github/workflows/build.yml` has a `changes` job that runs
[`dorny/paths-filter`](https://github.com/dorny/paths-filter) once, with one filter key per
workspace (`web`, `recipes`, `tss`, ...), and a single `build` job matrixed over whichever
workspaces actually changed — a **dynamic matrix** instead of a hardcoded list:

```yaml
changes:
  runs-on: ubuntu-latest
  outputs:
    packages: ${{ steps.filter.outputs.changes }}
  steps:
    - uses: actions/checkout@v7
    - name: Filter packages
      # Add a filter key here for each new app/template
      uses: dorny/paths-filter@v4
      id: filter
      with:
        filters: |
          web:
            - bun.lock
            - package.json
            - README.md
            - web/**
            - content/**
          recipes:
            - bun.lock
            - package.json
            - apps/recipes/**
          tss:
            - bun.lock
            - package.json
            - templates/tss/**

build:
  needs: changes
  if: needs.changes.outputs.packages != '[]'
  runs-on: ubuntu-latest
  strategy:
    matrix:
      package: ${{ fromJson(needs.changes.outputs.packages) }}
  steps:
    - uses: actions/checkout@v7
    - uses: oven-sh/setup-bun@v2
    - run: bun install --frozen-lockfile --filter ${{ matrix.package }}
    - run: bun run --filter ${{ matrix.package }} test
    - run: bun run --filter ${{ matrix.package }} build
```

- `packages` is paths-filter's `changes` output — a single JSON array of whichever filter names
  matched across all workspaces (e.g. `["web"]`, `["recipes","tss"]`, or `[]`) — fed straight into
  `fromJson()` for the one `build` matrix, no `jq` needed and no per-dimension outputs.
- Each filter key must match that workspace's `package.json` `name` field, since `build` runs
  `bun run --filter <name>` directly against the matrix value.
- Every filter includes `bun.lock` and root `package.json`, since a shared-lockfile bump can affect
  any workspace's install.
- `lint` (root `fmt:check`) stays unconditional — it's cheap and repo-wide.

## Vercel: skip unaffected deploys

Each deployable project's `vercel.json` sets an `ignoreCommand`. Per Vercel's docs, this command
**runs with its working directory set to the project's Root Directory** (same as
`installCommand`/`buildCommand`), and exit code `0` skips the build while any other exit code
(`git diff --quiet` exits `1` on a diff) lets it continue:

```jsonc
// web/vercel.json (Root Directory: web)
"ignoreCommand": "git diff --quiet HEAD^ HEAD -- . ../content ../README.md ../bun.lock ../package.json",
```

```jsonc
// apps/recipes/vercel.json (Root Directory: apps/recipes)
"ignoreCommand": "git diff --quiet HEAD^ HEAD -- . ../../bun.lock ../../package.json",
```

Paths are relative to that Root Directory, not the repo root — `.` covers the project's own folder,
and everything else (shared root files, or `content/` for `web`) is reached with `../`.

## Adding a new app/template

- Add a filter key for it in the `changes` job (see the checklist in the repo's `AGENTS.md`) — no
  other CI job needs touching.
- If it deploys to Vercel, give it its own `vercel.json` with an `ignoreCommand` scoped the same way
  (own dir + shared root files).

## Gotchas

- Any change to `bun.lock` or root `package.json` is treated as relevant to every workspace — that's
  a direct consequence of one shared lockfile, not a bug in the filters.
- `ignoreCommand`'s cwd is the Root Directory, easy to get wrong if you copy a path from a CI
  workflow (which runs from the repo root instead).

## References

- [`dorny/paths-filter`](https://github.com/dorny/paths-filter) — path-based change detection with a
  dynamic-matrix-friendly `changes` output
- [Vercel `vercel.json` reference — `ignoreCommand`](https://vercel.com/docs/project-configuration/vercel-json#ignorecommand)
- [Vercel — Ignored Build Step](https://vercel.com/docs/project-configuration/project-settings#ignored-build-step)
  — confirms the command runs within the project's Root Directory
- [Vercel — Skipping unaffected projects in a monorepo](https://vercel.com/docs/monorepos#skipping-unaffected-projects)
