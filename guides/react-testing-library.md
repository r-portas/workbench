# Setting up React Testing Library

Component tests with [React Testing Library](https://testing-library.com/) on Bun's test runner,
using [Happy DOM](https://github.com/capricorn86/happy-dom) as the DOM environment (not jsdom).

## Prerequisites

- Bun project with React
- `tsconfig.json` already includes DOM libs (`"lib": ["ESNext", "DOM", "DOM.Iterable"]`) — see the
  [TypeScript guide](./typescript.md) for the browser-app config

## Steps

1. Install

   ```sh
   bun add -d @happy-dom/global-registrator
   bun add -d @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event
   ```

   - `@happy-dom/global-registrator` injects browser APIs (`document`, `window`, …) into the test
     process
   - `@testing-library/jest-dom` adds matchers like `toBeInTheDocument`
   - `@testing-library/user-event` is the interaction helper — prefer it over `fireEvent`

2. Create the Happy DOM preload
   - This must run before any `@testing-library/*` import, so keep it in its own file

   ```ts
   // src/happydom.ts
   import { GlobalRegistrator } from "@happy-dom/global-registrator";

   GlobalRegistrator.register();
   ```

3. Create the Testing Library preload
   - Extends Bun's `expect` with jest-dom matchers, and unmounts `render` after each test so
     leftover DOM doesn't leak between cases

   ```ts
   // src/testing-library.ts
   import { afterEach, expect } from "bun:test";
   import { cleanup } from "@testing-library/react";
   import * as matchers from "@testing-library/jest-dom/matchers";

   expect.extend(matchers);

   afterEach(() => {
     cleanup();
   });
   ```

4. Register both preloads in `bunfig.toml`
   - Order matters: Happy DOM first, Testing Library second

   ```toml
   # bunfig.toml
   [test]
   preload = ["./src/happydom.ts", "./src/testing-library.ts"]
   ```

5. Add matcher types
   - Declaration merging so `toBeInTheDocument` and the other jest-dom matchers type-check on
     `expect(...)`. Lives under `src/` so the browser-app `tsconfig.json` `"include"` picks it up

   ```ts
   // src/matchers.d.ts
   import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
   import type { Matchers, AsymmetricMatchers } from "bun:test";

   declare module "bun:test" {
     interface Matchers<T> extends TestingLibraryMatchers<typeof expect.stringContaining, void> {}
     interface AsymmetricMatchers extends TestingLibraryMatchers<any, any> {}
   }
   ```

6. Write a smoke test
   - Colocate tests next to the file they cover (`*.test.tsx` for components). Query by role or
     label — `getByTestId` is a last resort

   ```tsx
   // src/components/greeting.test.tsx
   import { test, expect } from "bun:test";
   import { render, screen } from "@testing-library/react";

   function Greeting({ name }: { name: string }) {
     return <h1>Hello, {name}</h1>;
   }

   test("renders the name in a heading", () => {
     render(<Greeting name="Ada" />);
     expect(screen.getByRole("heading", { name: "Hello, Ada" })).toBeInTheDocument();
   });
   ```

   - For clicks and typing, import `userEvent` from `@testing-library/user-event` and call
     `userEvent.setup()` inside each test so instances don't share event state

## Verification

- [ ] `bun test` runs the smoke test and it passes
- [ ] `expect(...).toBeInTheDocument` type-checks in the editor (no red squiggle on the matcher)

## References

- [Using Testing Library with Bun](https://bun.com/docs/guides/test/testing-library) — official
  setup this guide is based on
- [Happy DOM with Bun](https://bun.com/docs/guides/test/happy-dom) — DOM environment only, no
  Testing Library
- [DOM testing](https://bun.com/docs/test/dom) — Bun's DOM testing overview
- [Testing Library docs](https://testing-library.com/) — queries, `userEvent`, and async utilities
- [Happy DOM repo](https://github.com/capricorn86/happy-dom)
