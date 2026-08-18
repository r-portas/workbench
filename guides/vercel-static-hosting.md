# Setting up Vercel static hosting (Bun + TanStack Start)

Static-hosting deploy config for a Bun project using TanStack Start, prerendered and served from
Vercel.

## Prerequisites

- Vercel account with the project imported
- Bun project using TanStack Start + Vite

## Steps

1. Add `vercel.json` at the project root

   ```json
   {
     "installCommand": "bun install --frozen-lockfile",
     "buildCommand": "bun run build",
     "outputDirectory": "dist/client",
     "headers": [
       {
         "source": "/assets/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "max-age=31536000, immutable"
           }
         ]
       }
     ]
   }
   ```

2. Enable prerendering in `vite.config.ts`

   ```ts
   tanstackStart({
     prerender: {
       enabled: true,
       crawlLinks: true,
     },
   });
   ```

3. Install static server function support

   ```sh
   bun add @tanstack/start-static-server-functions
   ```

4. Cache server function results at build time

   Prerendering alone embeds data in HTML, but client-side navigation still needs server functions.
   `staticFunctionMiddleware` records each invocation during the build and writes JSON files under
   `dist/client/__tsr/staticServerFnCache/`, which the client fetches instead of calling a server.

   - **Option A: global (recommended when all server functions are read-only)**

     Create `src/start.ts` and register the middleware for every server function:

     ```ts
     import { createCsrfMiddleware, createStart } from "@tanstack/react-start";
     import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";

     const csrfMiddleware = createCsrfMiddleware({
       filter: (ctx) => ctx.handlerType === "serverFn",
     });

     export const startInstance = createStart(() => ({
       requestMiddleware: [csrfMiddleware],
       functionMiddleware: [staticFunctionMiddleware],
     }));
     ```

     > Defining `src/start.ts` disables TanStack Start's automatic CSRF middleware — include
     > `createCsrfMiddleware` explicitly as above.

   - **Option B: per function (if you have some server functions that shouldn't be static)**

     Add the middleware to individual server functions that should be cached. It must be the last
     entry in that function's `.middleware([...])` array:

     ```ts
     export const listGuidesFn = createServerFn()
       .middleware([staticFunctionMiddleware])
       .handler(async () => { ... });
     ```

5. Wire into project
   - No separate integration code needed beyond the build/deploy config above

## Verification

- [ ] Run `bun run build` locally and confirm `dist/client` contains prerendered HTML for each route
- [ ] Confirm `dist/client/__tsr/staticServerFnCache/` contains JSON files for server function calls
      made during prerender
- [ ] Deploy to Vercel and confirm pages load without a server round-trip and that asset responses
      carry the immutable cache header

## Gotchas

- `crawlLinks` only prerenders pages reachable via discoverable links — orphaned routes won't be
  built and will need an explicit prerender entry

## References

- [`vercel.json` documentation](https://vercel.com/docs/project-configuration/vercel-json)
  - [`vercel.json` documentation as markdown](https://vercel.com/docs/project-configuration/vercel-json.md)
- [TanStack Start static server functions](https://tanstack.com/start/latest/docs/framework/react/guide/static-server-functions)
- [TanStack Start middleware (global `functionMiddleware`)](https://tanstack.com/start/latest/docs/framework/react/guide/middleware)
