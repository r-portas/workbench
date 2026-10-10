import { XMLParser } from "fast-xml-parser";

import { mergeSources, sortNewestFirst } from "./news";
import { fetchUpstream } from "./news.server";
import type { RssItem, SectionResult } from "./news.types";
import { feedSchema, type FeedEntry } from "./rss.schemas";
import type { RssFeedConfig } from "./sources.schemas";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // Keep text as text, so a title "007" or a guid "0x1F" isn't turned into a number
  parseTagValue: false,
  // Force lists, so a feed with one item (or an entry with one link) has the same shape as many
  isArray: (name) => name === "item" || name === "entry" || name === "link",
});

/** Items published longer ago than this are dropped, so the page stays about what's recent. */
const MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000;

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

/**
 * Decodes numeric character references like `&#8217;` (which the parser leaves alone) and the
 * basic XML named entities.
 *
 * @remarks
 * Feeds (WordPress especially) often double-encode, e.g. `&amp;#8217;` or `&amp;amp;`, and the
 * parser's own decoding only takes those down one level. This decodes one more level, in one pass.
 */
export function decodeEntities(value: string): string {
  return value.replaceAll(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (match, code: string) => {
    if (code[0] !== "#") return NAMED_ENTITIES[code.toLowerCase()] ?? match;
    const hex = code[1] === "x" || code[1] === "X";
    const point = hex ? parseInt(code.slice(2), 16) : Number(code.slice(1));
    return point <= 0x10ffff ? String.fromCodePoint(point) : match;
  });
}

/** Turns raw element text into display text: entities decoded, trimmed, empty as undefined. */
function plain(value: string | undefined): string | undefined {
  return value ? decodeEntities(value).trim() || undefined : undefined;
}

/** Parses a feed date (RFC 822 or ISO 8601) to an ISO timestamp, or undefined if it can't. */
function isoDate(raw: string | undefined): string | undefined {
  const time = raw ? Date.parse(raw) : NaN;
  return Number.isNaN(time) ? undefined : new Date(time).toISOString();
}

/**
 * Resolves a possibly relative link against the feed's URL, so it can't point into this app, and
 * rejects anything but http(s), since feed content ends up in an `href`.
 */
function safeUrl(href: string | undefined, base: string): string | undefined {
  if (!href) return undefined;
  try {
    const url = new URL(href, base);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/** Reads an entry title as plain text, removing tags from HTML titles. */
function titleText(title: FeedEntry["title"]): string | undefined {
  const text = plain(title?.text);
  return title?.isHtml && text ? text.replaceAll(/<[^>]*>/g, "").trim() || undefined : text;
}

/**
 * Parses an RSS 2.0 or Atom document into items, keeping the newest up to the feed's limit.
 *
 * @remarks
 * Items without a title, link or valid date are dropped, since they can't be shown or sorted.
 * Items older than 5 days are dropped too, before the limit applies, so a quiet feed shows fewer
 * items rather than stale ones.
 */
export function parseFeed(xml: string, feed: RssFeedConfig): RssItem[] {
  const parsed = feedSchema.safeParse(parser.parse(xml));
  if (!parsed.success) throw new Error(`${feed.url} is not an RSS or Atom feed`);

  const source = feed.name ?? plain(parsed.data.title) ?? new URL(feed.url).hostname;

  const cutoff = Date.now() - MAX_AGE_MS;

  const items = parsed.data.entries
    .map((entry): RssItem | undefined => {
      const title = titleText(entry.title);
      const url = safeUrl(plain(entry.link), feed.url);
      const publishedAt = isoDate(plain(entry.date));
      if (!title || !url || !publishedAt || Date.parse(publishedAt) < cutoff) return undefined;
      // Guids are only unique within a feed, so the feed URL keeps ids unique once feeds are merged
      const id = `rss-${feed.url}-${plain(entry.id) ?? url}`;
      return { id, sourceType: "rss", title, url, source, publishedAt };
    })
    .filter((item) => item !== undefined);

  // Feeds sometimes repeat an item; keep the first, so ids stay unique for React keys
  const seen = new Set<string>();
  const unique = items.filter((item) => !seen.has(item.id) && seen.add(item.id));
  return sortNewestFirst(unique).slice(0, feed.limit);
}

async function getFeedItems(feed: RssFeedConfig): Promise<RssItem[]> {
  const res = await fetchUpstream(feed.url);
  return parseFeed(await res.text(), feed);
}

/**
 * Fetches every configured feed, merged newest first.
 */
export function getRssItems(feeds: RssFeedConfig[]): Promise<SectionResult<RssItem>> {
  return mergeSources(
    feeds.map((feed) => ({ name: feed.name ?? feed.url, items: getFeedItems(feed) })),
    { newestFirst: true },
  );
}
