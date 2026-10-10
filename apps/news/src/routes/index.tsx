import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { NewsSection, NewsSectionSkeleton } from "@/components/news-section";
import { withFallback } from "@/lib/news";
import { getGithubReleasesFn, getHackerNewsFn, getRssItemsFn } from "@/lib/news.functions";

const TITLES = { hackerNews: "Hacker News", github: "Releases", rss: "Feeds" };

export const Route = createFileRoute("/")({
  // Client-only, so the server functions are fetched from the browser over GET and served from
  // Vercel's CDN. During SSR they'd be called in-process and every open would hit upstream.
  ssr: false,
  // Unawaited, so each section renders as soon as its own fetch resolves
  loader: () => ({
    hackerNews: withFallback(getHackerNewsFn(), TITLES.hackerNews),
    github: withFallback(getGithubReleasesFn(), TITLES.github),
    rss: withFallback(getRssItemsFn(), TITLES.rss),
  }),
  pendingComponent: () => (
    <SectionsGrid>
      {Object.values(TITLES).map((title) => (
        <NewsSectionSkeleton key={title} title={title} />
      ))}
    </SectionsGrid>
  ),
  component: RouteComponent,
});

function RouteComponent() {
  const data = Route.useLoaderData();

  return (
    <SectionsGrid>
      <NewsSection title={TITLES.hackerNews} data={data.hackerNews} />
      <NewsSection title={TITLES.github} data={data.github} />
      <NewsSection title={TITLES.rss} data={data.rss} />
    </SectionsGrid>
  );
}

function SectionsGrid({ children }: { children: ReactNode }) {
  return <div className="grid items-start gap-4 lg:grid-cols-3">{children}</div>;
}
