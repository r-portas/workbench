import { describe, expect, spyOn, test } from "bun:test";

import { formatRelativeTime, mergeSources, pluralise, withFallback } from "./news";
import type { RssItem } from "./news.types";

function item(id: string, publishedAt: string): RssItem {
  return { id, sourceType: "rss", title: id, url: `https://x/${id}`, source: "X", publishedAt };
}

describe("mergeSources", () => {
  test("keeps source order, and names and logs the failures", async () => {
    const errorSpy = spyOn(console, "error").mockImplementation(() => {});
    try {
      const result = await mergeSources([
        { name: "a", items: Promise.resolve([item("old", "2026-01-01T00:00:00Z")]) },
        { name: "b", items: Promise.reject(new Error("expected test failure")) },
        { name: "c", items: Promise.resolve([item("new", "2026-02-01T00:00:00Z")]) },
      ]);
      expect(result.items.map((i) => i.id)).toEqual(["old", "new"]);
      expect(result.failed).toEqual(["b"]);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.mock.calls[0]?.[0]).toBe("b failed");
    } finally {
      errorSpy.mockRestore();
    }
  });

  test("sorts newest first when asked", async () => {
    const result = await mergeSources(
      [
        { name: "a", items: Promise.resolve([item("old", "2026-01-01T00:00:00Z")]) },
        { name: "b", items: Promise.resolve([item("new", "2026-02-01T00:00:00Z")]) },
      ],
      { newestFirst: true },
    );
    expect(result.items.map((i) => i.id)).toEqual(["new", "old"]);
  });

  test("stamps when the sources were fetched", async () => {
    const before = Date.now();
    const result = await mergeSources([]);
    expect(Date.parse(result.fetchedAt!)).toBeGreaterThanOrEqual(before);
  });
});

describe("withFallback", () => {
  test("marks a rejected fetch as failed, and logs it", async () => {
    const errorSpy = spyOn(console, "error").mockImplementation(() => {});
    try {
      const result = await withFallback(
        Promise.reject(new Error("expected test failure")),
        "Feeds",
      );
      expect(result).toEqual({ items: [], failed: ["Feeds"] });
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.mock.calls[0]?.[0]).toBe("Feeds failed");
    } finally {
      errorSpy.mockRestore();
    }
  });
});

describe("formatRelativeTime", () => {
  const now = Date.parse("2026-10-10T12:00:00Z");

  test.each([
    ["2026-10-10T11:59:30Z", "just now"],
    ["2026-10-10T11:55:00Z", "5m ago"],
    ["2026-10-10T09:00:00Z", "3h ago"],
    ["2026-10-08T12:00:00Z", "2d ago"],
    ["2026-07-10T12:00:00Z", "3mo ago"],
    ["2025-10-13T12:00:00Z", "11mo ago"],
    ["2025-10-10T12:00:00Z", "1y ago"],
    ["2024-10-10T12:00:00Z", "2y ago"],
  ])("%p -> %p", (iso, expected) => {
    expect(formatRelativeTime(iso, now)).toBe(expected);
  });

  test("clamps future times to just now", () => {
    expect(formatRelativeTime("2026-10-10T13:00:00Z", now)).toBe("just now");
  });
});

describe("pluralise", () => {
  test.each([
    [0, "0 points"],
    [1, "1 point"],
    [2, "2 points"],
  ])("%p -> %p", (count, expected) => {
    expect(pluralise(count, "point")).toBe(expected);
  });
});
