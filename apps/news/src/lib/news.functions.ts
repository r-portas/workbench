import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

import { getGithubReleases } from "./github.server";
import { getHackerNews } from "./hn.server";
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

function withCacheHeaders<T extends SectionResult>(result: T): T {
  // Browsers always go back to the CDN
  setResponseHeader("Cache-Control", "public, max-age=0, must-revalidate");
  setResponseHeader(
    "Vercel-CDN-Cache-Control",
    result.failed.length > 0 ? CDN_PARTIAL : CDN_CACHED,
  );
  return result;
}

// These are GET with no arguments, so each has one stable URL for the CDN to cache

export const getHackerNewsFn = createServerFn({ method: "GET" }).handler(async () =>
  withCacheHeaders(await getHackerNews(sourcesConfig.hackerNews.topN)),
);

export const getGithubReleasesFn = createServerFn({ method: "GET" }).handler(async () =>
  withCacheHeaders(await getGithubReleases(sourcesConfig.github.repos)),
);

export const getRssItemsFn = createServerFn({ method: "GET" }).handler(async () =>
  withCacheHeaders(await getRssItems(sourcesConfig.rss.feeds)),
);
