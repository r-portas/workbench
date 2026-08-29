import { readdir, readFile } from "fs/promises";

import { parseMarkdown } from "@tanstack/markdown";

import type { ItemSummary } from "./content-collection.types";

const TITLE_REGEX = /^#\s+(.+)$/m;
const MARKDOWN_EXTENSION_REGEX = /\.md$/;

/**
 * A content collection is a group of related content files,
 * stored in the same directory tree.
 *
 * @example
 * ```ts
 * const content = new ContentCollection("./content/");
 * const guides = await content.list("guides/");
 * const guide = await content.get(guides[0].slug);
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
   * Reads the raw markdown source for a single content item by its slug.
   *
   * @param slug - The item's path relative to the collection, without the `.md` extension
   *
   * @remarks
   * Nested files use `/`-separated slugs, e.g. `guides/drizzle`.
   * Throws if the slug is unsafe or no matching markdown file exists.
   */
  public async getRaw(slug: string) {
    this.assertSafeSlug(slug);
    return await readFile(`${this.path}/${slug}.md`, "utf-8");
  }

  /**
   * Reads and parses a single content item by its slug.
   *
   * @param slug - The item's path relative to the collection, without the `.md` extension
   *
   * @remarks
   * Nested files use `/`-separated slugs, e.g. `guides/drizzle`.
   * Throws if the slug is unsafe or no matching markdown file exists.
   */
  public async get(slug: string) {
    const text = await this.getRaw(slug);
    return parseMarkdown(text);
  }

  /**
   * Lists all content items in the collection, including nested directories.
   *
   * @param filter - Optional partial path; only items whose slug starts with it are returned, e.g. `guides/`
   *
   * @remarks
   * Skips files whose path has a `_`-prefixed segment, and files that don't end in `.md`.
   * Sorted by slug.
   */
  public async list(filter?: string): Promise<ItemSummary[]> {
    const files = await readdir(this.path, { recursive: true });
    // Prefix check runs first so non-matching paths skip the more expensive segment scan.
    const markdownFiles = files
      .map((file) => file.replaceAll("\\", "/"))
      .filter((file) => (!filter || file.startsWith(filter)) && this.isMarkdownFile(file));
    const items = await Promise.all(
      markdownFiles.map(async (file) => {
        const slug = file.replace(MARKDOWN_EXTENSION_REGEX, "");
        const title = await this.getMarkdownTitle(`${this.path}/${slug}.md`);
        return { slug, title };
      }),
    );
    return items.toSorted((a, b) => a.slug.localeCompare(b.slug));
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

  /**
   * Checks if a file is a valid markdown file.
   *
   * @param filePath - The path to the file to check
   * @returns True if the file is a markdown file, false otherwise
   */
  private isMarkdownFile(filePath: string): boolean {
    if (!filePath.endsWith(".md")) return false;
    const segments = filePath.split("/");
    return segments.every((segment) => segment.length > 0 && !segment.startsWith("_"));
  }

  /**
   * Checks if a slug is safe to use (e.g. checking for path traversal)
   *
   * @param slug - The slug to check
   * @throws If the slug is invalid
   */
  private assertSafeSlug(slug: string): void {
    if (slug.includes("\\") || slug.includes("\0")) {
      throw new Error("Invalid slug");
    }
    const segments = slug.split("/");
    if (
      segments.length === 0 ||
      segments.some((segment) => segment === "" || segment === "." || segment === "..")
    ) {
      throw new Error("Invalid slug");
    }
  }
}

/**
 * The repo's markdown content, rooted at the top-level `content/` directory.
 *
 * @remarks
 * Slugs include the top-level folder, e.g. `guides/drizzle`, so callers filter
 * with `list("guides/")` rather than reaching for a per-folder collection.
 */
export const CONTENT = new ContentCollection("../content");
