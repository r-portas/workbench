import { describe, expect, spyOn, test } from "bun:test";

import type { GithubRelease } from "./github.schemas";
import { getGithubReleases, toGithubItems } from "./github.server";

function release(id: number, overrides: Partial<GithubRelease> = {}): GithubRelease {
  return {
    id,
    tag_name: `v${id}`,
    name: undefined,
    html_url: `https://github.com/o/r/releases/tag/v${id}`,
    published_at: "2026-10-01T00:00:00Z",
    draft: false,
    prerelease: false,
    ...overrides,
  };
}

describe("toGithubItems", () => {
  test("keeps the newest stable releases up to the limit", () => {
    const items = toGithubItems({ repo: "o/r", limit: 2 }, [
      release(4, { prerelease: true }),
      release(3, { draft: true, published_at: undefined }),
      release(2),
      release(1),
      release(0),
    ]);
    expect(items.map((i) => i.version)).toEqual(["v2", "v1"]);
  });

  test("filters by tag prefix", () => {
    const items = toGithubItems(
      { repo: "o/r", limit: 1 },
      [release(2, { tag_name: "vue@2" }), release(1, { tag_name: "react@1" })],
      "react@",
    );
    expect(items.map((i) => i.version)).toEqual(["react@1"]);
  });

  test("throws when no tag matches the prefix, rather than showing nothing", () => {
    expect(() =>
      toGithubItems({ repo: "o/r", limit: 1 }, [release(1, { tag_name: "react@1" })], "reakt@"),
    ).toThrow("no release tags start with reakt@");
  });

  test("returns nothing, without throwing, when matching tags are all prereleases", () => {
    const items = toGithubItems(
      { repo: "o/r", limit: 1 },
      [release(1, { tag_name: "react@2-beta", prerelease: true })],
      "react@",
    );
    expect(items).toEqual([]);
  });

  test("falls back to the tag when a release has no name", () => {
    const [item] = toGithubItems({ repo: "o/r", limit: 1 }, [release(1)]);
    expect(item).toMatchObject({ title: "v1", source: "o/r", url: release(1).html_url });
  });
});

describe("getGithubReleases", () => {
  test("fetches a repo once, applies the limit per prefix, and fails only a missing prefix", async () => {
    const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json([
        release(4, { tag_name: "react@4", published_at: "2026-10-04T00:00:00Z" }),
        release(3, { tag_name: "start@3", published_at: "2026-10-03T00:00:00Z" }),
        release(2, { tag_name: "react@2", published_at: "2026-10-02T00:00:00Z" }),
      ]),
    );
    // Silences the expected failure log for the missing prefix
    const errorSpy = spyOn(console, "error").mockImplementation(() => {});

    try {
      const result = await getGithubReleases([
        { repo: "o/r", limit: 1, tagPrefix: ["react@", "start@", "gone@"] },
      ]);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(result.items.map((i) => i.version)).toEqual(["react@4", "start@3"]);
      expect(result.failed).toEqual(["o/r (gone@)"]);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.mock.calls[0]?.[0]).toBe("o/r (gone@) failed");
    } finally {
      fetchSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });
});
