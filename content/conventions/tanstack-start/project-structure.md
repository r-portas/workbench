# TanStack Start Project Structure

Standard TanStack Start project structure I use for my projects, can be copied into a
`CLAUDE.md`/`AGENTS.md` file for agents to follow.

## Project Structure

- `src/lib` contains the project's library code, grouped by domain via this naming convention (e.g.
  for a `todos` domain):
  - `todos.server.ts` - server-only code, usually paired with `todos.server.test.ts` to unit test
    it.
  - `todos.functions.ts` - a thin wrapper exposing server functions, importing from
    `todos.server.ts`.
    - Exported server functions should be named with the `Fn` suffix, e.g. `getTodosFn`,
      `createTodoFn`, etc.
      - This makes it clearer what is a server function and what isn't
  - `todos.schemas.ts` - Zod schemas for data entering the domain from outside your code
    - e.g. server function inputs, form validation, third-party data at the point it's fetched
  - `todo.types.ts` - plain types for everything else
    - e.g. component props, internal state, and function outputs your own code already trusts
  - `todos.ts` - isomorphic code that can run on either the client or server (e.g. date helpers),
    usually paired with `todos.test.ts` to unit test it.
