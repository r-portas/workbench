import type { ItemSummary } from "./content-collection.types";

/**
 * The top-level `content/` folders, in the order they're presented to readers.
 *
 * @remarks
 * The only place the app names the content folders. Everything else derives
 * sections from item slugs, so adding a folder here is enough to surface it.
 */
export const CONTENT_SECTIONS = [
  { slug: "guides", label: "Guides" },
  { slug: "conventions", label: "Conventions" },
  { slug: "cheatsheets", label: "Cheatsheets" },
] as const;

/** A content section paired with the items found under it. */
export interface ContentSection {
  /** Top-level folder name, e.g. `guides`. */
  slug: string;
  /** Human-readable heading. */
  label: string;
  items: ItemSummary[];
}

/**
 * Buckets a flat content listing into the known sections.
 *
 * @param items - Content items whose slugs are relative to `content/`
 *
 * @remarks
 * Items outside a known section are dropped, and empty sections are omitted.
 *
 * @example
 * ```ts
 * const sections = groupIntoSections(await CONTENT.list());
 * ```
 */
export function groupIntoSections(items: ItemSummary[]): ContentSection[] {
  return CONTENT_SECTIONS.map(({ slug, label }) => ({
    slug,
    label,
    items: items.filter((item) => item.slug.startsWith(`${slug}/`)),
  })).filter((section) => section.items.length > 0);
}

/**
 * Drops the top-level folder from a slug, for display within its own section.
 *
 * @param slug - Path relative to `content/`, e.g. `conventions/tanstack-start/project-structure`
 *
 * @example
 * ```ts
 * stripSection("guides/drizzle"); // "drizzle"
 * ```
 */
export function stripSection(slug: string): string {
  const separatorIndex = slug.indexOf("/");
  return separatorIndex === -1 ? slug : slug.slice(separatorIndex + 1);
}
