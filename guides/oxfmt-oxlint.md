# Setting up oxfmt and oxlint

Rust-based formatter and linter for JS/TS projects, drop-in replacements for Prettier and ESLint
with near-instant runtimes.

## Prerequisites

- Bun (or npm/pnpm) project

## Steps

1. Install

   ```sh
   bun add -d oxfmt oxlint
   ```

2. Configure oxfmt
   - Config file lives at the project root

   ```jsonc
   // .oxfmtrc.jsonc
   {
     "$schema": "./node_modules/oxfmt/configuration_schema.json",
     "ignorePatterns": ["*.gen.ts"],
     "proseWrap": "always",
     "sortImports": true,
     "sortTailwindcss": {
       "stylesheet": "./src/styles.css",
       "functions": ["cn"],
     },
   }
   ```

   - `ignorePatterns` — skip generated files (e.g. TanStack Router's `routeTree.gen.ts`)
   - `sortTailwindcss` is only relevant if the project uses Tailwind — point `stylesheet` at the
     global CSS file and list any class-merging helper functions (e.g. `cn`) in `functions` so
     classes inside them get sorted too

3. Configure oxlint
   - Config file lives at the project root

   ```jsonc
   // .oxlintrc.jsonc
   {
     "$schema": "./node_modules/oxlint/configuration_schema.json",
     "plugins": ["eslint", "typescript", "oxc", "jsdoc", "react", "react-perf", "unicorn"],
     "categories": {
       "correctness": "error",
       "suspicious": "error",
     },
     "rules": {
       // Prefer undefined over null
       "unicorn/no-null": "error",
       // Not needed for React 17+
       "react/react-in-jsx-scope": "off",
     },
   }
   ```

   - `plugins` must be listed explicitly — only `eslint`, `typescript` and `oxc` are on by default
   - Drop `react` and `react-perf` for non-React projects
   - Add rule overrides under `rules`, with a one-line comment explaining any non-obvious one

4. Add scripts to `package.json`

   ```jsonc
   {
     "scripts": {
       "fmt": "oxfmt .",
       "fmt:check": "oxfmt --check .",
       "build": "vite build && tsc --noEmit && oxlint .",
     },
   }
   ```

   - Run `oxlint` as part of `build` (or CI) rather than a separate script, so a lint failure blocks
     the build the same way a type error would

5. Wire into VS Code
   - Install the oxc extension and set it as the default formatter

   ```jsonc
   // .vscode/extensions.json
   {
     "recommendations": ["oxc.oxc-vscode"],
   }
   ```

   ```jsonc
   // .vscode/settings.json
   {
     "editor.defaultFormatter": "oxc.oxc-vscode",
     "editor.formatOnSave": true,
   }
   ```

## Verification

- [ ] `bun fmt:check` exits 0 on a freshly formatted repo
- [ ] `bun run build` fails when a `correctness`-category lint error is introduced
- [ ] Saving a file in VS Code auto-formats it via the oxc extension

## Gotchas

- oxlint plugins are opt-in — forgetting to list `react` in `plugins` silently disables all React
  rules instead of erroring
- `sortTailwindcss.stylesheet` must point to a real CSS file with `@import "tailwindcss"` (or
  equivalent) in it, or class sorting silently no-ops

## References

- [oxfmt docs](https://oxc.rs/docs/guide/usage/formatter.html)
- [oxlint docs](https://oxc.rs/docs/guide/usage/linter.html)
- [oxc VS Code extension](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode)
