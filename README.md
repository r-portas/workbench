# workbench

My personal engineering workspace. Notes, conventions, project templates, agent skills and machine
config all in one place.

## Layout

| Folder                 | Contents                                                            |
| ---------------------- | ------------------------------------------------------------------- |
| `apps/`                | Deployable apps, each bootstrapped from `templates/tss`             |
| `content/`             | All written notes, served by `apps/docs`                            |
| `content/cheatsheets/` | Command/reference lookups per tool (copy-paste recipes, not setup)  |
| `content/conventions/` | Decisions and rules per tool/pattern (naming, gotchas, do's/don'ts) |
| `content/guides/`      | Step-by-step zero-to-working setup instructions, one per tool       |
| `templates/`           | Scaffoldable project templates (e.g. `tss`)                         |
| `dotfiles/`            | Machine setup (`setup.sh`), `Brewfile` and ghostty config           |

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

## Apps

Deployable apps living under `apps/`, each pulled in with the same `degit` command as templates:

| App       | Description                            |
| --------- | -------------------------------------- |
| `docs`    | Website that hosts this repo's content |
| `news`    | A personal news feed reader            |
| `recipes` | A simple recipes app                   |

## Scripts

Helper scripts live in `scripts/` and are run from the repo root:

| Script          | Description                                                         | Command                              |
| --------------- | ------------------------------------------------------------------- | ------------------------------------ |
| `create-app.ts` | Create a new app in `apps/<app-name>` from `templates/tss`, renamed | `./scripts/create-app.ts <app-name>` |
| `setup.sh`      | Configure macOS, install Brewfile and bun, link ghostty config      | `./dotfiles/setup.sh`                |

## Setup

```sh
gh repo clone r-portas/workbench ~/workbench
cd ~/workbench

# Install dependencies
bun install

# ./bootstrap.sh (future)
```

## Common tasks

### Updating packages

Run `bun update:all` from the repo root to update dependencies to their latest versions across every
workspace.

```sh
bun run update:all
```

## Repo Conventions

- One topic per file, split rather than append a second topic to an existing note
- Notes live under `content/<kind>/`, and nest one level deeper at most
  (`content/conventions/react/suspense.md`, not
  `content/conventions/frontend/react/hooks/suspense.md`)
- A note's URL is its path under `content/`, so `content/guides/drizzle.md` is served at
  `/guides/drizzle`
