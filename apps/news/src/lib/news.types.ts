interface BaseItem {
  /** Stable per source, so React keys and `:visited` links don't churn between loads. */
  id: string;
  title: string;
  url: string;
  /** Feed name, repo name or "Hacker News". */
  source: string;
  /** ISO timestamp. */
  publishedAt: string;
}

export interface HackerNewsItem extends BaseItem {
  sourceType: "hackernews";
  points: number;
  commentCount: number;
  /** Equals `url` for text posts (Ask HN etc.), which have no external link. */
  discussionUrl: string;
}

export interface GithubItem extends BaseItem {
  sourceType: "github";
  /** The release tag. */
  version: string;
}

export interface RssItem extends BaseItem {
  sourceType: "rss";
}

/**
 * One item from any source, normalised so every section can share one card component.
 */
export type NewsItem = HackerNewsItem | GithubItem | RssItem;

/**
 * What each section's server function returns: the items that loaded, plus the names of sources
 * that failed so the section can show a partial result with an error note.
 */
export interface SectionResult<T extends NewsItem = NewsItem> {
  items: T[];
  failed: string[];
  /**
   * ISO timestamp of when the server fetched upstream. Frozen into the CDN's cached copy, so it
   * shows how stale that copy is. Absent when the section's fetch itself failed.
   */
  fetchedAt?: string;
}
