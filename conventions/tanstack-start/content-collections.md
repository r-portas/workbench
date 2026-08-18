# Content Collections

Pattern for grouping related markdown content files (guides, posts, docs) under a single directory,
can be copied into a `CLAUDE.md`/`AGENTS.md` file for agents to follow.

## Structure

- A `ContentCollection` class wraps one directory of markdown files, one instance per content type
  (e.g. `guides`, `posts`).
- `get(slug)` reads and parses a single item by filename, where `slug` is the filename without the
  `.md` extension. Throws if no matching file exists.
- `list()` returns lightweight `{ slug, title }` summaries for every item, for building
  index/listing pages without parsing full content. Skips files prefixed with `_` and any non-`.md`
  files.
- Title is extracted from the file's first `# ` heading rather than stored separately in
  frontmatter. Throws if no `# ` heading is found.
- Lives at `src/lib/<name>.server.ts` (e.g. `content-collection.server.ts`), following the
  [project structure](./project-structure.md) `*.server.ts` convention since it does filesystem I/O.

## Implementation

```ts
import { readdir, readFile } from "fs/promises";

import { parseMarkdown } from "@tanstack/markdown";

const TITLE_REGEX = /^#\s+(.+)$/m;
const MARKDOWN_EXTENSION_REGEX = /\.md$/;

interface ItemSummary {
  slug: string;
  title: string;
}

/**
 * A content collection is a group of related content files,
 * stored in the same directory.
 *
 * @example
 * ```ts
 * const guides = new ContentCollection("./content/guides/");
 * const items = await guides.list();
 * const guide = await guides.get(items[0].slug);
 * ```
 */
export class ContentCollection {
  private path: string;

  /**
   * Creates a new content collection.
   *
   * @param path - The path to the directory containing the content, relative to the project root, e.g. `./content/posts/`
   */
  constructor(path: string) {
    this.path = path;
  }

  /**
   * Reads and parses a single content item by its slug.
   *
   * @param slug - The item's filename without the `.md` extension
   *
   * @remarks
   * Throws if no matching markdown file exists in the collection's directory.
   */
  public async get(slug: string) {
    const text = await readFile(`${this.path}/${slug}.md`, "utf-8");
    return parseMarkdown(text);
  }

  /**
   * Lists all content items in the collection.
   *
   * @remarks
   * Skips files whose names start with `_`, and files that don't end in `.md`.
   */
  public async list(): Promise<ItemSummary[]> {
    const files = await readdir(this.path);
    const markdownFiles = files.filter((file) => file.endsWith(".md") && !file.startsWith("_"));
    return Promise.all(
      markdownFiles.map(async (file) => {
        const slug = file.replace(MARKDOWN_EXTENSION_REGEX, "");
        const title = await this.getMarkdownTitle(`${this.path}/${slug}.md`);
        return { slug, title };
      }),
    );
  }

  /**
   * Extracts the title from a markdown file's first level-1 heading.
   *
   * @param filePath - Absolute or relative path to the markdown file
   *
   * @remarks
   * Throws if the file has no `# ` heading.
   */
  private async getMarkdownTitle(filePath: string) {
    const text = await readFile(filePath, "utf-8");
    const match = text.match(TITLE_REGEX);
    if (!match?.[1]) {
      throw new Error(`No title found in markdown file: ${filePath}`);
    }
    return match[1].trim();
  }
}
```

## Usage

```ts
// src/lib/guides.server.ts
export const guides = new ContentCollection("./content/guides/");
```

```ts
// route loader
const items = await guides.list();
const guide = await guides.get(params.slug);
```
