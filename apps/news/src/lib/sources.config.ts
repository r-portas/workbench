import { parseSourcesConfig } from "./sources.schemas";

/**
 * The sources shown in the app. Adding or removing a source only touches this file.
 *
 * @remarks
 * The config is bundled, so a change needs a redeploy.
 */
export const sourcesConfig = parseSourcesConfig({
  hackerNews: { topN: 20 },
  github: {
    repos: [
      {
        repo: "TanStack/router",
        tagPrefix: ["@tanstack/react-router@", "@tanstack/react-start@"],
      },
      { repo: "oven-sh/bun" },
      { repo: "shadcn-ui/ui", tagPrefix: ["shadcn@"] },
    ],
  },
  rss: {
    feeds: [
      { url: "https://www.itnews.com.au/RSS/rss.ashx", limit: 10, name: "iTnews" },
      { url: "https://www.theregister.com/headlines.rss", limit: 10, name: "The Register" },
      { url: "https://techcrunch.com/feed/", limit: 10, name: "TechCrunch" },
      { url: "https://feeds.arstechnica.com/arstechnica/index", limit: 10, name: "Ars Technica" },
      { url: "https://lobste.rs/rss", limit: 10, name: "Lobsters" },
      { url: "https://tanstack.com/rss.xml", limit: 5, name: "TanStack Blog" },
      { url: "https://ui.shadcn.com/rss.xml", limit: 5, name: "shadcn/ui" },
      { url: "https://bun.com/rss.xml", limit: 5, name: "Bun Blog" },
      { url: "https://vercel.com/atom", limit: 5, name: "Vercel" },
    ],
  },
});
