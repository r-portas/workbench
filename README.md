# workbench

My personal engineering workspace. Notes, conventions, project templates, agent skills and machine
config all in one place.

## Layout

| Folder                 | Contents                                                                  |
| ---------------------- | ------------------------------------------------------------------------- |
| `content/`             | All written notes, served by `web/`                                       |
| `content/cheatsheets/` | Command/reference lookups per tool (copy-paste recipes, not setup)        |
| `content/conventions/` | Decisions and rules per tool/pattern (naming, gotchas, do's/don'ts)       |
| `content/guides/`      | Step-by-step zero-to-working setup instructions, one per tool             |
| `templates/`           | Scaffoldable project templates (e.g. `tss`)                               |
| `web/`                 | Website that hosts this repo's content, bootstrapped from `templates/tss` |

## Templates

Pull a template into a new project with `degit`:

| Template | Description                                          | Command                                                           |
| -------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| `tss`    | TanStack Start app with shadcn/ui, oxlint, and oxfmt | `bunx --bun degit r-portas/workbench/templates/tss <destination>` |

### Testing templates on a branch

Append `#<branch>` to the `degit` command to pull from a branch:

```sh
bunx --bun degit r-portas/workbench/templates/tss#<branch> <destination>
```

## Setup

```sh
gh repo clone r-portas/workbench ~/workbench
cd ~/workbench
# ./bootstrap.sh (future)
```

## Common tasks

### Updating packages

Run `bun update:all` from the repo root to update dependencies to their latest versions across the
root `package.json`, `web/`, and every template in `templates/`.

```sh
bun update:all
```

## Repo Conventions

- One topic per file, split rather than append a second topic to an existing note
- Notes live under `content/<kind>/`, and nest one level deeper at most
  (`content/conventions/react/suspense.md`, not
  `content/conventions/frontend/react/hooks/suspense.md`)
- A note's URL is its path under `content/`, so `content/guides/drizzle.md` is served at
  `/guides/drizzle`
