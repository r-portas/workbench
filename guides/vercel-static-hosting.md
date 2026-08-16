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

3. Wire into project
   - No separate integration code needed — this is build/deploy config only
4. Verify it works
   - Run `bun run build` locally and confirm `dist/client` contains prerendered HTML for each route
   - Deploy to Vercel and check that pages load without a server round-trip and that asset responses
     carry the immutable cache header

## Gotchas

- `crawlLinks` only prerenders pages reachable via discoverable links — orphaned routes won't be
  built and will need an explicit prerender entry

## References

- [templates.royportas.com/addons/vercel-static-hosting.md](https://templates.royportas.com/addons/vercel-static-hosting.md)
  — source doc this guide was based on
