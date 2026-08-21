import type { ContentCollectionName } from "./content-collection.types";

/**
 * Builds the raw-markdown URL for a content item.
 *
 * @param collection - Which content collection the item belongs to
 * @param slug - The item's path relative to the collection, without the `.md` extension
 *
 * @example
 * ```ts
 * markdownPagePath("guides", "typescript"); // "/guides/typescript.md"
 * markdownPagePath("conventions", "tanstack-start/project-structure");
 * // "/conventions/tanstack-start/project-structure.md"
 * ```
 */
export function markdownPagePath(collection: ContentCollectionName, slug: string) {
  return `/${collection}/${slug}.md`;
}
