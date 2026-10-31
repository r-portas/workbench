# Setting up Docker hosting (Bun + TanStack Start)

Self-hosted deploy config for a Bun project using TanStack Start, built into a Docker image and run
with Docker Compose on your own machine or server.

## Prerequisites

- Docker with Compose on the host
- Bun project using TanStack Start + Vite

## Steps

1. Install Nitro

   ```sh
   bun add -D nitro
   ```

2. Add the Nitro plugin with the Bun preset to `vite.config.ts`
   - The preset bundles the server and its dependencies into `.output`, so the release image needs
     no `node_modules`

   ```ts
   import { tanstackStart } from "@tanstack/react-start/plugin/vite";
   import { nitro } from "nitro/vite";
   import { defineConfig } from "vite";

   export default defineConfig({
     plugins: [tanstackStart(), nitro({ preset: "bun" })],
   });
   ```

3. Add a `Dockerfile` at the project root

   ```dockerfile
   FROM oven/bun:1-alpine AS base
   WORKDIR /usr/src/app

   # copy manifests first so the install layer is cached until dependencies change
   FROM base AS build
   COPY package.json bun.lock ./
   RUN bun install --frozen-lockfile
   COPY . .

   ENV NODE_ENV=production
   RUN bun --bun vite build

   # the Nitro bun preset bundles its own dependencies into .output,
   # so the release image needs no node_modules
   FROM base AS release
   ENV NODE_ENV=production PORT=3000
   COPY --from=build /usr/src/app/.output .output

   # run the app
   USER bun
   EXPOSE 3000/tcp
   ENTRYPOINT [ "bun", "run", ".output/server/index.mjs" ]
   ```

4. Add a `.dockerignore`

   ```
   node_modules
   Dockerfile*
   .dockerignore
   .git
   README.md
   LICENSE
   .vscode
   .env
   coverage*
   .output
   .tanstack
   dist
   ```

5. Add `compose.yaml`

   ```yaml
   services:
     app:
       build: .
       ports:
         - "${PORT:-3000}:3000"
       restart: unless-stopped
   ```

   - `PORT` sets the published host port, and can be put in a git-ignored `.env` file next to
     `compose.yaml`
   - `restart: unless-stopped` brings the app back after a reboot or crash

6. Deploy
   - Commit and push the changes in Git
   - On the host, clone the repo, then run `docker compose up -d`
   - To ship later changes, run `git pull && docker compose up -d --build` on the host

## Verification

- [ ] Run `docker compose build` locally and confirm it completes without errors
- [ ] Run `docker compose up -d` and open `http://localhost:3000`
- [ ] Run `docker compose logs app` and confirm the server started without errors

## Environment variables

- `PORT` — host port the app is published on (default `3000`). The container always listens on
  `3000` internally

## Gotchas

- Copy `package.json` and `bun.lock` before the rest of the source, or every code change invalidates
  the dependency install layer
- `docker compose up -d` alone reuses the existing image, so pass `--build` to pick up new code
- Rebuilding leaves the old image dangling, so run `docker image prune -f` to reclaim disk space
- `.output` is in `.dockerignore` on purpose: the image builds it itself, and a stale local copy
  must not leak in

## References

- [Bun Docker guide](https://bun.com/guides/ecosystem/docker) — official image and Dockerfile
  patterns
- [Nitro Bun preset](https://nitro.build/deploy/runtimes/bun) — how the Bun server output is built
- [Compose file reference](https://docs.docker.com/reference/compose-file/) — `compose.yaml` options
