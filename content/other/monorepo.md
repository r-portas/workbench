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
[`dorny/paths-filter`](https://github.com/dorny/paths-filter) once per dimension (`web`, `apps`,
`templates`), then gates the corresponding build job on its output. `build-apps`/`build-templates`
use a **dynamic matrix** built from whichever app/template dirs actually changed, instead of a
hardcoded list:

```yaml
changes:
  runs-on: ubuntu-latest
  outputs:
    web: ${{ steps.web.outputs.web }}
    apps: ${{ steps.apps.outputs.changes }}
    templates: ${{ steps.templates.outputs.changes }}
  steps:
    - uses: actions/checkout@v7
    - name: Filter web
      uses: dorny/paths-filter@v4
      id: web
      with:
        filters: |
          web:
            - bun.lock
            - package.json
            - README.md
            - web/**
            - content/**
    - name: Filter apps
      # Add a filter key here for each new app under apps/
      uses: dorny/paths-filter@v4
      id: apps
      with:
        filters: |
          recipes:
            - bun.lock
            - package.json
            - apps/recipes/**

build-apps:
  needs: changes
  if: needs.changes.outputs.apps != '[]'
  strategy:
    matrix:
      app: ${{ fromJson(needs.changes.outputs.apps) }}
```

- `web`'s filter is a plain boolean (`steps.web.outputs.web == 'true'`).
- `apps`/`templates` use paths-filter's `changes` output directly — a JSON array of filter names
  that matched (e.g. `["recipes"]` or `[]`) — fed straight into `fromJson()` for the matrix, no `jq`
  needed.
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
