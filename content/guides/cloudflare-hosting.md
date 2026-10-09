# Setting up Cloudflare Workers hosting

Deploy config for hosting an app built from `templates/tss` on Cloudflare Workers, using the `cf`
CLI.

## TODO

Unverified, confirm against a test app:

- [ ] Bun runtime: docs say `cf` fails on Bun when loading `cloudflare.config.ts`. Confirm
      `bun run build` works (the `cf` bin uses a `node` shebang) and `bun --bun` breaks
- [ ] `entrypoint: "@tanstack/react-start/server-entry"`: docs only show file paths or a `cf-worker`
      import, confirm a package specifier works or switch to a `src/server.ts` re-export
- [ ] `cloudflare({ viteEnvironment: { name: "ssr" } })`: the `cf` docs only show `cloudflare()`,
      confirm whether the option is still needed with `@cloudflare/vite-plugin@beta`
- [ ] Types: confirm `cf build` writes `.cloudflare/types` before `tsc --noEmit` runs, and nothing
      else replaces `wrangler types`
- [ ] `cache` and `observability`: confirm the camelCase `worker.cache` / `worker.observability`
      keys behave the same as the Wrangler ones
- [ ] `server.port`: confirm `cf dev` still honours the template's `PORT` / `3000` Vite setting
- [ ] Lint/format: confirm `oxlint .` and `oxfmt .` skip the gitignored `.cloudflare/` directory
- [ ] Types: confirm the generated worker types don't clash with the template's `"bun"` types
- [ ] Deploy: the `cf` docs don't cover dashboard Git import (Workers Builds), confirm whether it
      works with `cloudflare.config.ts` or the guide should stick to `cf deploy`

## Prerequisites

- Cloudflare account
- App created from `templates/tss`
- Node.js 22.18+ (`cf` runs on Node, Bun is not supported as its runtime)

## Steps

1. Install

   ```sh
   bun add -D cf @cloudflare/vite-plugin@beta
   ```

2. Add the Cloudflare plugin to `vite.config.ts`, before `tanstackStart()`

   ```ts
   import { cloudflare } from "@cloudflare/vite-plugin";
   import tailwindcss from "@tailwindcss/vite";
   import { tanstackStart } from "@tanstack/react-start/plugin/vite";
   import react from "@vitejs/plugin-react";
   import { defineConfig } from "vite";

   export default defineConfig({
     server: {
       port: Number(process.env.PORT) || 3000,
     },
     resolve: {
       tsconfigPaths: true,
     },
     plugins: [
       tailwindcss(),
       cloudflare({ viteEnvironment: { name: "ssr" } }),
       tanstackStart(),
       react(),
     ],
   });
   ```

3. Add `cloudflare.config.ts` at the project root

   ```ts
   import { defineConfig } from "cf/config";

   export default defineConfig({
     worker: {
       name: "<project-name>",
       compatibilityDate: "<today, YYYY-MM-DD>",
       compatibilityFlags: ["nodejs_compat"],
       entrypoint: "@tanstack/react-start/server-entry",
       cache: { enabled: true },
       observability: {
         enabled: true,
       },
     },
   });
   ```

   - `name` should match the `name` key in `package.json`
   - `compatibilityDate` should be today's date

4. Add `cloudflare.config.ts` and the generated types to `include` in `tsconfig.json`

   ```json
   {
     "include": ["src", "vite.config.ts", "cloudflare.config.ts", ".cloudflare/types"]
   }
   ```

5. Update the scripts in `package.json`
   - `cf build` runs the Vite build and generates worker types into `.cloudflare/types`, so it
     replaces `bun --bun vite build` and must run before `tsc --noEmit`
   - `cf dev` replaces `bun --bun vite dev`

   ```json
   {
     "scripts": {
       "dev": "cf dev",
       "build": "cf build && tsc --noEmit && oxlint .",
       "deploy": "cf deploy"
     }
   }
   ```

6. Add the generated Cloudflare files to `.gitignore`

   ```
   .cloudflare/
   ```

7. Deploy

   ```sh
   cf auth login
   cf deploy
   ```

   - In CI, set `CLOUDFLARE_API_TOKEN` instead of running `cf auth login`

## Verification

- [ ] Run `bun run build` and confirm it completes without errors
- [ ] Run `cf deploy --dry-run` and confirm it validates (no credentials needed)

## Migrating an existing Wrangler project

1. Commit or stash everything, then preview the changes with `cf migrate --dry-run`
2. Run `cf migrate` (picks the Vite bundler when `@cloudflare/vite-plugin` is in `package.json`)
3. Resolve every `TODO(@cloudflare)` in `cloudflare.config.ts`, then delete the `throw` it adds
4. Apply steps 4–6 above, and drop `wrangler types` from scripts
5. Delete `wrangler.jsonc`, `worker-configuration.d.ts`, and the `.wrangler` ignore once scripts and
   CI use `cf`

## Gotchas

- Don't run `cf dev`, `cf build`, or `cf deploy` in an unmigrated Wrangler project, they ignore
  `wrangler.jsonc` and can generate files that replace the Worker setup. Run `cf migrate` first
- Don't prefix `cf` with `bun --bun`, it needs the Node runtime
- `cf build` won't run a custom build step for you, chain it in the script (`cf build && ...`)

## References

- [cf for Wrangler users](https://developers.cloudflare.com/cf/wrangler/index.md)
- [Migrate from Wrangler](https://developers.cloudflare.com/cf/wrangler/migrate/index.md)
- [cf projects](https://developers.cloudflare.com/cf/projects/index.md)
- [cloudflare.config.ts reference](https://developers.cloudflare.com/cf/projects/cloudflare-config/index.md)
- [Cloudflare TanStack Start guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/index.md)
