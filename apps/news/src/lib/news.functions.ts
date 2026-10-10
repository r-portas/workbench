import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

import { getGithubReleases } from "./github.server";
import { getHackerNews } from "./hn.server";
import { mergeSources } from "./news";
import type { SectionResult } from "./news.types";
import { getRssItems } from "./rss.server";
import { sourcesConfig } from "./sources.config";

// Vercel's CDN serves a shared copy for 10 minutes, then serves it stale for up to an hour while
// refreshing in the background. This header is read by Vercel only, so the SWR never reaches the
// browser, which would otherwise show hour-old data on reload.
const CDN_CACHED = "max-age=600, stale-while-revalidate=3600";

// Partial results are still cached, but briefly: long enough that a rate-limited source isn't
// re-hit on every open (keeping it rate-limited), short enough that it's retried soon
const CDN_PARTIAL = "max-age=60";

function setCacheHeaders(result: SectionResult) {
  // Browsers always go back to the CDN
  setResponseHeader("Cache-Control", "public, max-age=0, must-revalidate");
  setResponseHeader(
    "Vercel-CDN-Cache-Control",
    result.failed.length > 0 ? CDN_PARTIAL : CDN_CACHED,
  );
}

// These are GET with no arguments, so each has one stable URL for the CDN to cache

export const getHackerNewsFn = createServerFn({ method: "GET" }).handler(async () => {
  const result = await mergeSources([
    { name: "Hacker News", items: getHackerNews(sourcesConfig.hackerNews.topN) },
  ]);
  setCacheHeaders(result);
  return result;
});

export const getGithubReleasesFn = createServerFn({ method: "GET" }).handler(async () => {
  const result = await getGithubReleases(sourcesConfig.github.repos);
  setCacheHeaders(result);
  return result;
});

export const getRssItemsFn = createServerFn({ method: "GET" }).handler(async () => {
  const result = await getRssItems(sourcesConfig.rss.feeds);
  setCacheHeaders(result);
  return result;
});
