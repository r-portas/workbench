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
   * @param slug - The item's path relative to the collection, without the `.md` extension
   *
   * @remarks
   * Nested files use `/`-separated slugs, e.g. `tanstack-start/thing`.
   * Throws if the slug is unsafe or no matching markdown file exists.
   */
  public async get(slug: string) {
    this.assertSafeSlug(slug);
    const text = await readFile(`${this.path}/${slug}.md`, "utf-8");
    return parseMarkdown(text);
  }

  /**
   * Lists all content items in the collection, including nested directories.
   *
   * @remarks
   * Skips files whose path has a `_`-prefixed segment, and files that don't end in `.md`.
   * Sorted by slug.
   */
  public async list(): Promise<ItemSummary[]> {
    const files = await readdir(this.path, { recursive: true });
    const markdownFiles = files
      .map((file) => file.replaceAll("\\", "/"))
      .filter(this.isMarkdownFile);
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
