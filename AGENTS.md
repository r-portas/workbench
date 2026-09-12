@README.md

## Templates

- When creating a new template under `templates/`:
  - Add a row to the Templates table in [README.md](README.md#templates)
  - Add it to the `build-templates` matrix in
    [`.github/workflows/build.yml`](.github/workflows/build.yml)

## Web

- `web` is bootstrapped from `templates/tss`.
  - When changing `templates/tss`, apply the same change to `web`

## Apps

- Each `apps/<name>` is created with the same `bunx --bun degit` command as templates (see
  [README.md](README.md#templates)), pulling from `templates/tss`.
  - When changing `templates/tss`, apply the same change to every app under `apps/`
  - When creating a new app:
    - Add a row to the Apps table in [README.md](README.md#apps)
    - Add it to the `build-apps` matrix in
      [`.github/workflows/build.yml`](.github/workflows/build.yml)
