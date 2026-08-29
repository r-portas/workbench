# TanStack Start

Cheatsheet for TanStack Start (`@tanstack/react-start`), the full-stack framework built on TanStack
Router + Vite. Validators throughout use Zod.

## Server Functions

```ts
// users.functions.ts — GET/POST server fn with a Zod validator
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getUser = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => findUserById(data.id));
```

```tsx
// Call from a route loader
export const Route = createFileRoute("/users/$id")({
  loader: ({ params }) => getUser({ data: { id: params.id } }),
});
```

```tsx
// Call from a component — useServerFn is required when the fn can redirect/notFound
const getUserFn = useServerFn(getUser)
<button onClick={() => getUserFn({ data: { id } })}>Load</button>
```

```ts
// Typed object validator — default choice for form input
export const createUser = createServerFn({ method: "POST" })
  .validator(z.object({ name: z.string().min(1), email: z.string().email() }))
  .handler(async ({ data }) => db.users.create({ data }));
```

```tsx
// Uncontrolled (default) — read values from the DOM at submit time, no
// per-keystroke state/re-renders. Still calls the typed-object server fn:
// FormData here is just a convenient way to read the form, not what's sent
// to the validator.
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

function CreateUserForm() {
  const [error, setError] = useState<string>();
  const createUserFn = useServerFn(createUser);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        try {
          await createUserFn({
            data: {
              name: fd.get("name")?.toString() ?? "",
              email: fd.get("email")?.toString() ?? "",
            },
          });
        } catch (err) {
          // .validator() throws when name/email fail the Zod schema
          setError(err instanceof Error ? err.message : "Failed to create user");
        }
      }}
    >
      <input name="name" />
      <input name="email" />
      {error && <p>{error}</p>}
      <button type="submit">Create</button>
    </form>
  );
}
```

```tsx
// Controlled — reach for this only when you need to react to input on every
// keystroke (live validation, conditional UI, formatting/masking). Costs a
// re-render per keystroke, so don't default to it for plain forms.
function CreateUserFormControlled() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const createUserFn = useServerFn(createUser);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await createUserFn({ data: { name, email } });
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to create user");
        }
      }}
    >
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      {error && <p>{error}</p>}
      <button type="submit">Create</button>
    </form>
  );
}
```

For complex forms (many fields, cross-field validation, arrays), reach for `react-hook-form` — it's
uncontrolled under the hood (via refs) so it keeps the performance win while adding per-field
validation state.

```ts
// FormData validator — only when you need a native <form> (no-JS progressive
// enhancement) or File uploads; otherwise prefer the typed object above, since
// FormData needs this extra transform step before Zod can validate the shape
export const submitForm = createServerFn({ method: "POST" })
  .validator(
    z.instanceof(FormData).transform((fd) => ({
      name: fd.get("name")?.toString() ?? "",
    })),
  )
  .handler(async ({ data }) => ({ success: true }));
```

```ts
// Redirect / notFound from within a handler
import { redirect, notFound } from "@tanstack/react-router";

export const requireAuth = createServerFn().handler(async () => {
  const user = await getCurrentUser();
  if (!user) throw redirect({ to: "/login" });
  return user;
});
```

```ts
// Server context utilities — headers/status/cache-control
import {
  getRequestHeader,
  setResponseHeader,
  setResponseStatus,
} from "@tanstack/react-start/server";

export const getMyData = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("Cache-Control", "private, max-age=60");
  setResponseStatus(200);
  return fetchPersonalizedData();
});
```

File layout convention (matches this repo's domain structure):

```text
users.functions.ts  # createServerFn wrappers, safe to import anywhere
users.server.ts     # server-only helpers (DB queries, internal logic)
users.schemas.ts     # shared Zod schemas
```

## Server Routes

```ts
// src/routes/api/users.ts — raw HTTP endpoint alongside app routes
export const Route = createFileRoute("/api/users")({
  server: {
    handlers: {
      GET: async () => Response.json(await listUsers()),
      POST: async ({ request }) => {
        const body = await request.json();
        return Response.json({ created: body.name });
      },
    },
  },
});
```

```ts
// Dynamic path params
export const Route = createFileRoute("/api/users/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => Response.json(await findUser(params.id)),
    },
  },
});
```

```tsx
// Per-handler middleware with createHandlers
export const Route = createFileRoute("/api/data")({
  server: {
    middleware: [loggerMiddleware], // runs for all handlers
    handlers: ({ createHandlers }) =>
      createHandlers({
        GET: async () => Response.json({ public: true }),
        POST: {
          middleware: [authMiddleware],
          handler: async ({ context }) => Response.json({ user: context.session.user }),
        },
      }),
  },
});
```

## Middleware

```ts
// Request middleware — runs on ALL server requests (SSR, routes, functions)
export const loggingMiddleware = createMiddleware().server(async ({ next, request }) => {
  console.log("Request:", request.url);
  return next();
});
```

```ts
// Server function middleware — has client + server phases
export const authMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return next({ context: { session } }); // typed context for downstream middleware/handlers
});
```

```ts
// Attach to a server function — method order: middleware -> validator -> client -> server
export const getMyOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) =>
    db.orders.findMany({ where: { userId: context.session.userId } }),
  );
```

```ts
// Zod validator on middleware input
export const workspaceMiddleware = createMiddleware({ type: "function" })
  .validator(z.object({ workspaceId: z.string().uuid() }))
  .server(async ({ next, data }) => {
    // shape check only — still verify membership against the session principal
    return next();
  });
```

```ts
// src/start.ts — global middleware applied to every request/server fn
import { createCsrfMiddleware, createStart } from "@tanstack/react-start";

// Without a start.ts, Start auto-applies CSRF protection for you. Defining
// requestMiddleware here replaces that default entirely, so re-add it or you
// lose CSRF protection (and get a one-time console.warn in dev reminding you).
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, loggingMiddleware],
  functionMiddleware: [authMiddleware],
}));
```

```ts
// Middleware factory — parameterized reusable authorization
function authorizationMiddleware(permissions: Record<string, string[]>) {
  return createMiddleware({ type: "function" })
    .middleware([authMiddleware])
    .server(async ({ next, context }) => {
      const granted = await auth.hasPermission(context.session, permissions);
      if (!granted) throw new Error("Forbidden");
      return next();
    });
}
```

## References

- [TanStack Start docs](https://tanstack.com/start) — official guide
