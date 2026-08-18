import { readdir } from "fs/promises";
import { join } from "path";

import { parseMarkdown } from "@tanstack/markdown/parser";

const TITLE_REGEX = /^#\s+(.+)$/m;
const MARKDOWN_EXTENSION_REGEX = /\.md$/;

function readFileAsText(filePath: string) {
  return Bun.file(filePath).text();
}

/**
 * Reads a markdown file from disk and parses it into its AST.
 *
 * @param filePath - Absolute or relative path to the markdown file
 */
export async function parseMarkdownFile(filePath: string) {
  const text = await readFileAsText(filePath);
  return parseMarkdown(text);
}

/**
 * Extracts the title from a markdown file's first level-1 heading.
 *
 * @param filePath - Absolute or relative path to the markdown file
 *
 * @remarks
 * Throws if the file has no `# ` heading.
 */
export async function getMarkdownTitle(filePath: string) {
  const text = await readFileAsText(filePath);
  const match = text.match(TITLE_REGEX);
  if (!match?.[1]) {
    throw new Error(`No title found in markdown file: ${filePath}`);
  }
  return match[1].trim();
}

interface MarkdownFile {
  slug: string;
  path: string;
  title: string;
}

/**
 * Lists all markdown files in a directory, resolving each one's slug, path, and title.
 * Excludes template files (prefixed with `_`).
 *
 * @param dirPath - Directory path (relative to the content root) containing markdown files
 */
export async function listMarkdownEntries(dirPath: string): Promise<MarkdownFile[]> {
  const files = await readdir(dirPath);
  const markdownFiles = files.filter((file) => file.endsWith(".md") && !file.startsWith("_"));

  return Promise.all(
    markdownFiles.map(async (file) => {
      const path = join(dirPath, file);
      const slug = file.replace(MARKDOWN_EXTENSION_REGEX, "");
      const title = await getMarkdownTitle(path);
      return { slug, path, title };
    }),
  );
}
