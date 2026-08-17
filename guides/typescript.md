# Setting up TypeScript

Configures TypeScript 7 in a Bun project.

## Prerequisites

- Bun project

## Steps

1. Install

   ```sh
   bun add -d typescript
   ```

2. Configure — Bun / server-side project
   - `tsconfig.json` at the project root

   ```jsonc
   // tsconfig.json
   {
     "compilerOptions": {
       // Environment setup & latest features
       "lib": ["ESNext"],
       "target": "ESNext",
       "module": "Preserve",
       "moduleDetection": "force",
       "types": ["bun"],

       // Bundler mode
       "moduleResolution": "bundler",
       "allowImportingTsExtensions": true,
       "verbatimModuleSyntax": true,
       "erasableSyntaxOnly": true,
       "noEmit": true,

       // Best practices
       "strict": true,
       "skipLibCheck": true,
       "noFallthroughCasesInSwitch": true,
       "noUncheckedIndexedAccess": true,
       "noImplicitOverride": true,
       "exactOptionalPropertyTypes": true,
     },
     "include": ["scripts"],
   }
   ```

3. Configure — browser app (Vite / TanStack Start)
   - Same base, plus DOM libs, `vite/client` types and path aliases
   - `verbatimModuleSyntax` is deliberately **not** set here — see the option reference below

   ```jsonc
   // tsconfig.json
   {
     "compilerOptions": {
       // Environment setup & latest features
       "lib": ["ESNext", "DOM", "DOM.Iterable"],
       "target": "ESNext",
       "module": "Preserve",
       "moduleDetection": "force",
       "jsx": "react-jsx",
       "types": ["vite/client", "bun"],
       "paths": { "@/*": ["./src/*"] },

       // Bundler mode
       "moduleResolution": "bundler",
       "allowImportingTsExtensions": true,
       // Enabling this in a TanStack Start app can result in the server bundles leaking into client bundles
       "verbatimModuleSyntax": false,
       // verbatimModuleSyntax would normally imply isolatedModules, so it has to be set directly
       "isolatedModules": true,
       "erasableSyntaxOnly": true,
       "noEmit": true,

       // Best practices
       "strict": true,
       "skipLibCheck": true,
       "noFallthroughCasesInSwitch": true,
       "noUncheckedIndexedAccess": true,
       "noImplicitOverride": true,
       "exactOptionalPropertyTypes": true,
     },
     "include": ["src", "vite.config.ts"],
   }
   ```

   - Pair it with oxlint's `typescript/consistent-type-imports` rule, which enforces `import type`
     without the bundling hazard `verbatimModuleSyntax` carries

   ```jsonc
   // .oxlintrc.jsonc
   {
     "rules": {
       "typescript/consistent-type-imports": "error",
     },
   }
   ```

4. Add scripts to `package.json`
   - The bundler emits the JavaScript, so `tsc` only ever type-checks

   ```json
   {
     "scripts": {
       "build": "bun --bun vite build && tsc --noEmit && oxlint ."
     }
   }
   ```

## Verification

- [ ] `bunx tsc --noEmit` exits 0

## References

- [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
  — native compiler, removed options, new defaults
- [Announcing TypeScript 6.0](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/)
  — where the default changes and deprecations landed first
- [Bun: TypeScript 6 and 7](https://bun.com/docs/typescript-6) — Bun's recommended `tsconfig.json`
- [TSConfig reference](https://www.typescriptlang.org/tsconfig/) — every option
- [Modules: choosing compiler options](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html)
  — bundler vs library vs Node presets
- [TanStack Start: build from scratch](https://github.com/TanStack/router/blob/main/docs/start/framework/react/build-from-scratch.md)
  — why `verbatimModuleSyntax` must stay off
