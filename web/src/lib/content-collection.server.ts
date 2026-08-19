import { readdir, readFile } from "fs/promises";

import { parseMarkdown } from "@tanstack/markdown";

import type { ItemSummary } from "./content-collection.types";

const TITLE_REGEX = /^#\s+(.+)$/m;
const MARKDOWN_EXTENSION_REGEX = /\.md$/;

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
    if (slug.includes("/") || slug.includes("\\") || slug.includes("..")) {
      throw new Error("Invalid slug");
    }
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
