@README.md

## Templates

- When creating a new template under `templates/`:
  - Add a row to the Templates table in [README.md](README.md#templates)
  - Add a filter entry for it in the `changes` job in
    [`.github/workflows/build.yml`](.github/workflows/build.yml)

## Apps

- Each `apps/<name>` is created with the same `bunx --bun degit` command as templates (see
  [README.md](README.md#templates)), pulling from `templates/tss`.
  - When changing `templates/tss`, apply the same change to every app under `apps/`
- When creating a new app:
  - Add a row to the Apps table in [README.md](README.md#apps)
  - Add a filter entry for it in the `changes` job in
    [`.github/workflows/build.yml`](.github/workflows/build.yml)

## Changelog

- [CHANGELOG.md](CHANGELOG.md) is a lightweight log so I can look back on what I've worked on
  recently
- The agent maintains it: when a change includes something key, or ships as a PR, add an entry in
  the same change
- Format it with oxfmt after editing (`bun fmt CHANGELOG.md` from the repo root)

### Format

- One `## YYYY-MM-DD` heading per day, newest first. Reuse the day's heading if it already exists
- One bullet per change, prefixed with the project it belongs to in backticks:
  ``- `<project>`: <description>``
- Projects are paths such as `dotfiles`, `apps/news`, `apps/docs`, `templates/tss`, `content`,
  `content/cheatsheets`. Use `ci` and `repo` for cross-cutting changes that have no folder
- If the change has a PR, end the bullet with a link:
  `([#38](https://github.com/r-portas/workbench/pull/38))`. Link several PRs separated by commas
  when one entry covers them

### What to capture

- Only key changes: new apps, templates, or content collections, notable features, tooling or
  workflow changes, and restructures
- Skip anything minor: dependency bumps, lockfile regens, merge commits, small tweaks to existing
  scripts or config, favicons, and adding individual recipes or notes
- Keep each entry to one short line, describing the outcome rather than the implementation
