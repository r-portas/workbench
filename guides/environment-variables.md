# Setting up environment variables (Bun + Vite, zod-validated)

`.env` layout and zod-validated, split server/client env modules for a TanStack Start project.

## Prerequisites

- Bun project using Vite
- `zod` installed (`bun add zod`)

## Steps

1. Add the `.env` files
   - `.env` — non-secret config, committed
   - `.env.local` — secrets, gitignored
   - `.env.local.example` — committed template for `.env.local`, no real values

   ```sh
   # .env
   # Non-secret environment configuration, use .env.local for secrets
   # Prefix with VITE_ to make it available from the clientside
   ```

   ```sh
   # .env.local.example
   # Copy to .env.local and populate with secrets
   ```

2. Gitignore the secrets file

   ```gitignore
   # .gitignore
   .env.local
   ```

3. Wire into project
   - `src/lib/env.server.ts` — server-only vars, parses `process.env`, never imported from
     client-reachable code

     ```ts
     // src/lib/env.server.ts
     import { z } from "zod";

     /**
      * Server-only environment variables.
      */
     const serverEnvSchema = z.object({});

     export default serverEnvSchema.parse(process.env);
     ```

   - `src/lib/env.ts` — client-safe vars, parses `import.meta.env`, only variables prefixed `VITE_`

     ```ts
     // src/lib/env.ts
     import { z } from "zod";

     /**
      * Environment variables that are also readable on the client.
      * Must be prefixed with `VITE_` to be exposed to the browser by Vite.
      */
     const clientEnvSchema = z.object({});

     export default clientEnvSchema.parse(import.meta.env);
     ```

4. Add each variable to both the `.env`/`.env.local` file and the matching zod schema as it's
   introduced — a var with no schema field isn't validated and won't get type inference

## Verification

- [ ] Run the dev server with a required var missing from `.env`/`.env.local` and confirm zod throws
      at startup instead of the app running with `undefined`
- [ ] Import `env.server.ts` from a client component and confirm the build fails or the secret is
      absent from the client bundle — it should never end up there
- [ ] Confirm a `VITE_`-prefixed var in `.env` is readable via `env.ts` in the browser

## Gotchas

- Vite only exposes vars prefixed `VITE_` to `import.meta.env`, anything else silently stays
  server-only, which is what keeps `env.ts` safe to import from client code

## References

- [Vite: env variables and modes](https://vite.dev/guide/env-and-mode) — `VITE_` prefix rules and
  `import.meta.env` behavior
