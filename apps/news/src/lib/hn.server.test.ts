import { describe, expect, test } from "bun:test";

import type { AlgoliaHit } from "./hn.schemas";
import { toHackerNewsItems } from "./hn.server";

function hit(overrides: Partial<AlgoliaHit>): AlgoliaHit {
  return {
    objectID: "1",
    title: "Story",
    url: "https://example.com",
    points: 10,
    num_comments: 2,
    created_at: "2026-10-10T00:00:00Z",
    ...overrides,
  };
}

describe("toHackerNewsItems", () => {
  test("keeps HN's rank order, not Algolia's", () => {
    const items = toHackerNewsItems([2, 1], [hit({ objectID: "1" }), hit({ objectID: "2" })]);
    expect(items.map((i) => i.id)).toEqual(["hn-2", "hn-1"]);
  });

  test("drops ids Algolia hasn't indexed", () => {
    expect(toHackerNewsItems([1, 3], [hit({ objectID: "1" })])).toHaveLength(1);
  });

  test("drops hits without a title", () => {
    const items = toHackerNewsItems(
      [1, 2],
      [hit({ objectID: "1", title: undefined }), hit({ objectID: "2" })],
    );
    expect(items.map((i) => i.id)).toEqual(["hn-2"]);
  });

  test("maps points, comments and the thread link", () => {
    const [item] = toHackerNewsItems([1], [hit({ points: 42, num_comments: 7 })]);
    expect(item).toMatchObject({
      url: "https://example.com",
      points: 42,
      commentCount: 7,
      discussionUrl: "https://news.ycombinator.com/item?id=1",
    });
  });

  test("links text posts to the thread", () => {
    const [item] = toHackerNewsItems([1], [hit({ url: undefined })]);
    expect(item?.url).toBe("https://news.ycombinator.com/item?id=1");
  });
});
