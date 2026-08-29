# Setting up Markdown rendering

Renders Markdown content (e.g. guides, articles) into styled HTML using `@tanstack/markdown`,
shadcn's `typeset.css` for prose styling, and optionally `@tanstack/highlight` for code block syntax
highlighting.

## Prerequisites

- A TanStack Start project with Tailwind CSS and shadcn/ui already configured

## Steps

1. Install dependencies

   ```sh
   bun add @tanstack/markdown
   ```

   - shadcn's typeset isn't installed as a package, download the stylesheet directly and store it in
     the project

   ```sh
   curl -o src/typeset.css https://ui.shadcn.com/typeset.css
   ```

   - Import it from `styles.css`, after the other base imports

   ```css
   /* src/styles.css */
   @import "tailwindcss";
   @import "tw-animate-css";
   @import "shadcn/tailwind.css";
   @import "./typeset.css";
   ```

2. Configure markdown formatting
   - `src/components/article.tsx` — renders a parsed Markdown document with `typeset` styling

   ```tsx
   // src/components/article.tsx
   import type { MarkdownInput } from "@tanstack/markdown";
   import { Markdown } from "@tanstack/markdown/react";

   export default function Article({ children }: { children: MarkdownInput }) {
     return (
       <article className="typeset">
         <Markdown>{children}</Markdown>
       </article>
     );
   }
   ```

3. (optional) Add highlighting with TanStack Highlight
   - Adds syntax highlighting to fenced code blocks inside rendered Markdown

   ```sh
   bun add @tanstack/highlight
   ```

   - `src/lib/markdown.ts` — isomorphic highlighter setup, one entry per language needed

   ```ts
   // src/lib/markdown.ts
   import { createHighlighter } from "@tanstack/highlight/core";
   import { shell } from "@tanstack/highlight/languages/shell";
   import { tsx } from "@tanstack/highlight/languages/tsx";
   import { createTanStackMarkdownHighlighter } from "@tanstack/highlight/markdown";
   import { createThemeCss } from "@tanstack/highlight/theme";
   import { draculaTheme } from "@tanstack/highlight/themes/dracula";
   import type { CodeHighlighter } from "@tanstack/markdown";

   const highlighter = createHighlighter({
     // Add more languages here as needed, e.g. `ts`, `json`, `yaml`
     languages: [tsx, shell],
   });

   export const highlightMarkdownCode: CodeHighlighter =
     createTanStackMarkdownHighlighter(highlighter);

   export const highlightCss = createThemeCss({
     dark: draculaTheme,
     // Scopes the dark theme to `:root`, which always matches — the site is dark-mode only
     darkSelector: ":root",
   });
   ```

   - Pass the highlighter into `Article`

   ```diff
   + import { highlightMarkdownCode } from "@/lib/markdown";

     export default function Article({ children }: { children: MarkdownInput }) {
       return (
         <article className="typeset">
   -       <Markdown>{children}</Markdown>
   +       <Markdown highlighter={highlightMarkdownCode}>{children}</Markdown>
         </article>
       );
     }
   ```

   - Inject `highlightCss` into the document head via the root route

   ```tsx
   // src/routes/__root.tsx
   import { highlightCss } from "@/lib/markdown";

   export const Route = createRootRoute({
     head: () => ({
       // ...meta, links
       styles: [{ children: highlightCss }],
     }),
     component: RootDocument,
   });
   ```

4. Render markdown content into a route
   - Store post source files as `.md` in a `posts/` directory at the project root
   - Expose server functions that read and parse them

   ```ts
   // src/lib/blog.functions.ts
   import { readdir, readFile } from "fs/promises";

   import { createServerFn } from "@tanstack/react-start";
   import { parseMarkdown } from "@tanstack/markdown/parser";
   import { z } from "zod";

   export const listPostsFn = createServerFn().handler(async () => {
     const files = await readdir("../posts");
     return files.map((file) => file.replace(/\.md$/, ""));
   });

   export const getPostFn = createServerFn()
     .validator(z.string())
     .handler(async ({ data: slug }) => {
       const text = await readFile(`../posts/${slug}.md`, "utf-8");
       return parseMarkdown(text);
     });
   ```

   - `src/routes/posts/index.tsx` — lists every post slug, linking to its route

   ```tsx
   // src/routes/posts/index.tsx
   import { createFileRoute, Link } from "@tanstack/react-router";

   import { listPostsFn } from "@/lib/blog.functions";

   export const Route = createFileRoute("/posts/")({
     component: RouteComponent,
     loader: async () => ({
       slugs: await listPostsFn(),
     }),
   });

   function RouteComponent() {
     const { slugs } = Route.useLoaderData();
     return (
       <ul>
         {slugs.map((slug) => (
           <li key={slug}>
             <Link to="/posts/$slug" params={{ slug }}>
               {slug}
             </Link>
           </li>
         ))}
       </ul>
     );
   }
   ```

   - `src/routes/posts/$slug.tsx` — loads one post and renders it with `Article`

   ```tsx
   // src/routes/posts/$slug.tsx
   import { createFileRoute } from "@tanstack/react-router";

   import Article from "@/components/article";
   import { getPostFn } from "@/lib/blog.functions";

   export const Route = createFileRoute("/posts/$slug")({
     component: RouteComponent,
     loader: async ({ params }) => ({
       post: await getPostFn({ data: params.slug }),
     }),
   });

   function RouteComponent() {
     const { post } = Route.useLoaderData();
     return <Article>{post}</Article>;
   }
   ```

## Verification

- [ ] A route rendering `<Article>` shows styled headings, lists, and paragraphs (from
      `typeset.css`)
- [ ] Fenced code blocks render with syntax highlighting (if step 3 was completed)

## Gotchas

- `highlightCss` must be injected once, globally (root route `head`)

## References

- [TanStack Markdown](https://tanstack.com/markdown) — parser and React renderer
- [TanStack Highlight](https://tanstack.com/highlight) — syntax highlighting engine
- [shadcn Typeset](https://ui.shadcn.com/docs/typeset) — prose styling for rendered Markdown
