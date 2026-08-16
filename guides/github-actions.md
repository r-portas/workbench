# Setting up GitHub Actions (Bun project)

CI workflow that checks formatting, runs tests, and builds on every push, plus Dependabot to keep
Bun and Actions dependencies current.

## Prerequisites

- Repo hosted on GitHub
- Bun project with `fmt:check`, `test`, and `build` scripts in `package.json`

## Steps

1. Add the build workflow

   ```yaml
   # .github/workflows/build.yml
   # yaml-language-server: $schema=https://json.schemastore.org/github-workflow.json
   name: build
   on: [push]
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout code
           uses: actions/checkout@v7
         - name: Setup Bun
           uses: oven-sh/setup-bun@v2
         - name: Install dependencies
           run: bun install --frozen-lockfile
         - name: Check formatting
           run: bun run fmt:check
         - name: Run tests
           run: bun test --pass-with-no-tests
         - name: Build project
           run: bun run build
   ```

2. Add Dependabot config

   ```yaml
   # .github/dependabot.yml
   # yaml-language-server: $schema=https://json.schemastore.org/dependabot-2.0.json
   version: 2
   updates:
     - package-ecosystem: "bun"
       directory: "/"
       schedule:
         interval: "weekly"

     - package-ecosystem: "github-actions"
       directory: "/"
       schedule:
         interval: "weekly"
   ```

3. Wire into project
   - No separate integration code needed, this is CI/config only
   - Ensure `fmt:check` and `build` scripts exist in `package.json` before the first push, or the
     workflow fails immediately

## Verification

- [ ] Push a commit and confirm the `build` workflow runs and passes in the Actions tab
- [ ] Confirm Dependabot opens a "Checking for updates" run under Insights → Dependency graph →
      Dependabot within a day of setup

## Gotchas

- `bun test --pass-with-no-tests` avoids a failing build on repos that don't have tests yet

## References

- [`actions/checkout`](https://github.com/actions/checkout) — checkout action used in the build job
- [`oven-sh/setup-bun`](https://github.com/oven-sh/setup-bun) — installs Bun on the runner
- [Dependabot version updates](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates)
  — config reference for `dependabot.yml`
