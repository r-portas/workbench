import { algoliaSearchSchema, topStoriesSchema, type AlgoliaHit } from "./hn.schemas";
import { fetchUpstream } from "./news.server";
import type { HackerNewsItem } from "./news.types";

const TOP_STORIES_URL = "https://hacker-news.firebaseio.com/v0/topstories.json";

/**
 * Builds HN items from Algolia hits, in the rank order of `ids`.
 *
 * @remarks
 * Ids Algolia hasn't indexed yet, and hits without a title, are dropped rather than fetched one by
 * one.
 */
export function toHackerNewsItems(ids: number[], hits: AlgoliaHit[]): HackerNewsItem[] {
  const byId = new Map(hits.map((hit) => [hit.objectID, hit]));
  return ids.flatMap((id) => {
    const hit = byId.get(String(id));
    if (!hit?.title) return [];
    const discussionUrl = `https://news.ycombinator.com/item?id=${id}`;
    return {
      id: `hn-${id}`,
      sourceType: "hackernews",
      title: hit.title,
      url: hit.url || discussionUrl,
      source: "Hacker News",
      publishedAt: hit.created_at,
      points: hit.points ?? 0,
      commentCount: hit.num_comments ?? 0,
      discussionUrl,
    };
  });
}

/**
 * Fetches the current top N HN stories, in HN's own rank order.
 *
 * @remarks
 * Firebase gives the rank order but only ids. Algolia gives points and comment counts but in its
 * own order, so this takes the order from one and the details from the other: two calls, not N+1.
 */
export async function getHackerNews(topN: number): Promise<HackerNewsItem[]> {
  const ids = topStoriesSchema
    .parse(await (await fetchUpstream(TOP_STORIES_URL)).json())
    .slice(0, topN);

  const tags = `story,(${ids.map((id) => `story_${id}`).join(",")})`;
  const searchUrl = `https://hn.algolia.com/api/v1/search?tags=${encodeURIComponent(tags)}&hitsPerPage=${topN}`;
  const { hits } = algoliaSearchSchema.parse(await (await fetchUpstream(searchUrl)).json());

  return toHackerNewsItems(ids, hits);
}
