/**
 * A lightweight listing of a content item, without the full markdown body.
 */
export interface ItemSummary {
  /** Path relative to `content/`, without the `.md` extension, e.g. `guides/drizzle`. */
  slug: string;
  title: string;
}
