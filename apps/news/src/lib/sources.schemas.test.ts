import { describe, expect, test } from "bun:test";

import { sourcesConfig } from "./sources.config";
import { parseSourcesConfig, type SourcesConfigInput } from "./sources.schemas";

function config(overrides: Partial<SourcesConfigInput> = {}): SourcesConfigInput {
  return {
    hackerNews: { topN: 10 },
    github: { repos: [{ repo: "oven-sh/bun" }] },
    rss: { feeds: [{ url: "https://example.com/feed.xml", limit: 5 }] },
    ...overrides,
  };
}

describe("parseSourcesConfig", () => {
  test("accepts the checked-in config", () => {
    expect(sourcesConfig.github.repos.length).toBeGreaterThan(0);
  });

  test("defaults a repo's limit to 1", () => {
    expect(parseSourcesConfig(config()).github.repos[0]?.limit).toBe(1);
  });

  test("names the field for a bad feed URL", () => {
    expect(() =>
      parseSourcesConfig(config({ rss: { feeds: [{ url: "not a url", limit: 5 }] } })),
    ).toThrow("rss.feeds[0].url");
  });

  test("names the field for a malformed repo", () => {
    expect(() => parseSourcesConfig(config({ github: { repos: [{ repo: "bun" }] } }))).toThrow(
      "github.repos[0].repo",
    );
  });

  test("rejects a limit below 1", () => {
    expect(() => parseSourcesConfig(config({ hackerNews: { topN: 0 } }))).toThrow(
      "hackerNews.topN",
    );
  });
});
