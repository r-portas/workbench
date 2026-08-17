# workshop

My personal engineering workspace. Notes, conventions, project templates, agent skills and machine
config all in one place.

## Layout

| Folder         | Contents                                                            |
| -------------- | ------------------------------------------------------------------- |
| `conventions/` | Decisions and rules per tool/pattern (naming, gotchas, do's/don'ts) |
| `guides/`      | Step-by-step zero-to-working setup instructions, one per tool       |
| `templates/`   | Scaffoldable project templates (e.g. `app-template`)                |
| `journal/`     | Dated notes, one folder per year (`journal/2026/2026-08-17.md`)     |

## Setup

```bash
gh repo clone r-portas/workshop ~/workshop
cd ~/workshop
./bootstrap.sh
```

## Conventions

- One topic per file, split rather than append a second topic to an existing note
- Directories nest one level deep at most (`conventions/react/suspense.md`, not
  `conventions/frontend/react/hooks/suspense.md`)

### Templates

Pull a template into a new project with `degit`:

| Template | Description                                          | Command                                                     |
| -------- | ----------------------------------------------------- | ------------------------------------------------------------ |
| `tss`    | TanStack Start app with shadcn/ui, oxlint, and oxfmt | `bunx degit r-portas/workshop/templates/tss <destination>` |
