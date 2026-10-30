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
| `dotfiles/`            | Machine setup (`setup.sh`), `Brewfile` and `home/` dotfiles         |

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

## Dotfiles

Machine setup lives in `dotfiles/`. Run `./dotfiles/setup.sh` on a fresh macOS machine to provision
it. It is safe to re-run, and does the following:

1. Sets macOS defaults (typing, key repeat, trackpad)
2. Installs Homebrew if missing, then everything in `Brewfile`
3. Installs bun if missing
4. Installs Claude Code if missing
5. Symlinks each file under `dotfiles/home/` to the same path under `$HOME`

| Path                | Contents                                                      |
| ------------------- | ------------------------------------------------------------- |
| `dotfiles/setup.sh` | Provisioning script                                           |
| `dotfiles/Brewfile` | Homebrew packages and casks                                   |
| `dotfiles/home/`    | Dotfiles mirrored into `$HOME` (e.g. Ghostty and Zed configs) |

To add a dotfile, place it in `dotfiles/home/` at its path relative to `$HOME` (for example
`home/.config/ghostty/config`) and re-run `setup.sh`. Only files are linked, never directories, and
existing files at the destination are skipped rather than overwritten. Move or delete the existing
file first to replace it.

To install only the Brewfile, run `brew bundle --file dotfiles/Brewfile` from the repo root.

## Scripts

Helper scripts live in `scripts/` and are run from the repo root:

| Script          | Description                                                         | Command                              |
| --------------- | ------------------------------------------------------------------- | ------------------------------------ |
| `create-app.ts` | Create a new app in `apps/<app-name>` from `templates/tss`, renamed | `./scripts/create-app.ts <app-name>` |

## Setup

```sh
gh repo clone r-portas/workbench ~/workbench
cd ~/workbench

# Install dependencies
bun install
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
