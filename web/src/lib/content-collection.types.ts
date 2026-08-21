/**
 * A lightweight listing of a content item, without the full markdown body.
 */
export interface ItemSummary {
  slug: string;
  title: string;
}

/** Directory/API name for a markdown content collection. */
export type ContentCollectionName = "guides" | "conventions";

/** Which collection a search result belongs to. */
export type ContentKind = "guide" | "convention";

/**
 * A content listing tagged with its collection, for cross-collection search.
 */
export interface SearchItem extends ItemSummary {
  /** Collection the item came from, used to pick the detail route. */
  kind: ContentKind;
}
