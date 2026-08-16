# Setting up <tool/library-name>

Brief one-line description of what this is and when to use it.

## Prerequisites

- Anything that must exist before starting (accounts, other tools installed, env vars)

## Steps

> Use fenced code blocks for anything meant to be copy-pasted — commands, config file contents,
> snippets. Reserve inline backticks for short references (file names, flags, package names) inside
> prose.

1. Install

   ```sh
   bun add <package>
   ```

2. Configure
   - Config file(s) and where they live

   ```jsonc
   // <config-file>.jsonc
   {
     "key": "value",
   }
   ```

3. Wire into project
   - Where the integration code lives (e.g. `src/lib/`)

   ```ts
   // src/lib/<file>.ts
   ```

4. Add scripts to `package.json` (if any)
5. Verify it works
   - Command to run / what success looks like

   ```sh
   <verify command>
   ```

## Environment variables

- `VAR_NAME` — what it's for, where to get it

## Gotchas

- Anything non-obvious that will bite you first time through

## References

- [Library/tool docs](https://example.com) — official documentation
- [Relevant guide or RFC](https://example.com) — why it's relevant

---

See `conventions/<tool>.md` for naming/pattern rules once this is running.
