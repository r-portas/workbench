# Setting up Cloudflare Workers hosting

Deploy config for hosting a Bun + TanStack Start app on Cloudflare Workers.

## Prerequisites

- Cloudflare account
- Bun project using TanStack Start + Vite

## Steps

1. Install

   ```bash
   bun add -D @cloudflare/vite-plugin wrangler
   ```

2. Configure the Cloudflare plugin in `vite.config.ts`

   ```ts
   import { defineConfig } from "vite";
   import { tanstackStart } from "@tanstack/react-start/plugin/vite";
   import { cloudflare } from "@cloudflare/vite-plugin";

   export default defineConfig({
     plugins: [cloudflare({ viteEnvironment: { name: "ssr" } }), tanstackStart()],
   });
   ```

3. Add `wrangler.jsonc` at the project root

   ```jsonc
   {
     "$schema": "node_modules/wrangler/config-schema.json",
     "name": "<project-name>",
     "compatibility_date": "<today, YYYY-MM-DD>",
     "compatibility_flags": ["nodejs_compat"],
     "main": "@tanstack/react-start/server-entry",
     "cache": { "enabled": true },
     "observability": {
       "enabled": true,
     },
   }
   ```

   - `name` should match the `name` key in `package.json`
   - `compatibility_date` should be today's date

4. Add scripts to `package.json`
   - Prefix the `build` script with `wrangler types` so generated worker types exist before the app
     build runs

   ```json
   {
     "scripts": {
       "build": "wrangler types && bun --bun vite build && ..."
     }
   }
   ```

5. Ignore generated Cloudflare files

   ```
   .wrangler
   worker-configuration.d.ts
   ```

6. Deploy
   - Commit and push the changes in Git
   - Create the project via the Cloudflare dashboard, importing the git repo

## Verification

- [ ] Run `bun run build` and confirm it completes without errors

## Gotchas

- `wrangler types` must run before the Vite build, or the build picks up stale/missing generated
  worker types

## References

- [Cloudflare TanStack Start guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/index.md)
