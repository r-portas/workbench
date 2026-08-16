# Setting up Drizzle

Database setup using Drizzle ORM with Bun's native SQLite driver, wired into the project's env
validation and `src/lib` conventions.

## Prerequisites

- Bun project (uses `drizzle-orm/bun-sqlite`, the Bun-native driver)
- `src/lib/env.server.ts` env validation convention already in place

> Drizzle 1.0 is currently at release candidate `rc5` — install `drizzle-orm@rc5` and
> `drizzle-kit@rc5` exactly as shown below. Do not run `bun add drizzle-orm` without `@rc5`.

## Steps

1. Install

   ```sh
   bun add drizzle-orm@rc5
   bun add -d drizzle-kit@rc5
   ```

   `drizzle-kit` is the CLI for schema pushes, migrations, and Drizzle Studio — dev dependency only.

2. Add scripts to `package.json`
   - The `bun --bun` prefix is required so drizzle-kit resolves the SQLite driver through Bun's
     runtime rather than a Node.js shim

   ```jsonc
   {
     "scripts": {
       "db:push": "bun --bun drizzle-kit push",
       "db:studio": "bun --bun drizzle-kit studio",
     },
   }
   ```

3. Configure environment
   - Add `DATABASE_URL` to the server environment schema in `src/lib/env.server.ts`

   ```ts
   // src/lib/env.server.ts
   import { z } from "zod";

   const serverEnvSchema = z.object({
     DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
   });

   export default serverEnvSchema.parse(process.env);
   ```

   - The database path is non-secret config, so it belongs in `.env` (committed) rather than
     `.env.local`

   ```sh
   # .env
   DATABASE_URL=file:./local.db
   ```

   - Add the database file to `.gitignore`

   ```
   local.db
   ```

4. Create `drizzle.config.ts` at the project root
   - Reads `process.env` directly rather than `@/lib/env.server` — drizzle-kit runs outside the app
     and can't resolve the `@/` path alias. Bun loads `.env` automatically, so `DATABASE_URL` is
     populated when the `bun --bun drizzle-kit` scripts run

   ```ts
   // drizzle.config.ts
   import { defineConfig } from "drizzle-kit";

   export default defineConfig({
     out: "./drizzle",
     schema: "./src/lib/db.schema.ts",
     dialect: "sqlite",
     dbCredentials: {
       url: process.env.DATABASE_URL!,
     },
   });
   ```

5. Define the schema

   ```ts
   // src/lib/db.schema.ts
   import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

   export const notesTable = sqliteTable("notes", {
     id: int().primaryKey({ autoIncrement: true }),
     content: text().notNull(),
     createdAt: int({ mode: "timestamp_ms" }).notNull(),
     updatedAt: int({ mode: "timestamp_ms" }).notNull(),
   });
   ```

   - `int({ mode: "timestamp_ms" })` stores timestamps as milliseconds since epoch and maps them to
     JS `Date` objects — assign `new Date()` or `Date.now()` directly

6. Wire into project
   - Create the client in `src/lib/db.server.ts`, using `drizzle-orm/bun-sqlite` (the Bun-native
     driver, not the generic sqlite adapter)

   ```ts
   // src/lib/db.server.ts
   import { drizzle } from "drizzle-orm/bun-sqlite";

   import * as schema from "@/lib/db.schema";
   import env from "@/lib/env.server";

   export const db = drizzle(env.DATABASE_URL, { schema });
   ```

   - `env.server.ts` uses a default export, so this is `import env from`, not `import { env } from`
   - Passing `schema` enables relational queries via `db.query`; omit it if only using the query
     builder
   - `db.server.ts` is server-only — import it from other `*.server.ts` modules and expose results
     through server functions, following the `src/lib` domain convention

   ```ts
   // src/lib/notes.server.ts
   import { db } from "@/lib/db.server";
   import { notesTable } from "@/lib/db.schema";

   export async function listNotes() {
     return await db.select().from(notesTable);
   }
   ```

   ```ts
   // src/lib/notes.functions.ts
   import { createServerFn } from "@tanstack/react-start";

   import { listNotes } from "@/lib/notes.server";

   export const listNotesFn = createServerFn().handler(() => listNotes());
   ```

7. Verify it works

   ```sh
   bun db:push
   ```

   - For dev this is the fast path — no migration files, just push and query. For production, use
     `drizzle-kit generate` to produce tracked SQL migration files, then `drizzle-kit migrate` to
     apply them
   - Browse the database with `bun db:studio`

## Environment variables

- `DATABASE_URL` — SQLite file path, e.g. `file:./local.db`. Non-secret, goes in committed `.env`

## Gotchas

- Must install `drizzle-orm@rc5` / `drizzle-kit@rc5` — plain `bun add drizzle-orm` pulls a version
  that doesn't match this setup
- `drizzle.config.ts` reads `process.env.DATABASE_URL` directly, not through `@/lib/env.server`,
  since drizzle-kit can't resolve the `@/` alias

## References

- [Drizzle ORM docs](https://orm.drizzle.team) — official documentation
- [templates.royportas.com/addons/drizzle.md](https://templates.royportas.com/addons/drizzle.md) —
  source doc this guide was based on
