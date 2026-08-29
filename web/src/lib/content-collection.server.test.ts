import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { dirname, join } from "path";

import { ContentCollection } from "./content-collection.server";

const FIXTURE_FILES: Record<string, string> = {
  "code-style.md": "# Code Style\n",
  "nested/thing.md": "# Nested Thing\n",
  "nested/other.md": "# Other Nested\n",
  "_draft.md": "# Hidden Draft\n",
  "nested/_secret.md": "# Hidden Nested\n",
  "_hidden/ignored.md": "# Hidden Dir\n",
  "nested/notes.txt": "not markdown",
};

async function writeFixture(root: string) {
  const paths = Object.keys(FIXTURE_FILES);
  const directories = new Set(paths.map((path) => dirname(path)).filter((dir) => dir !== "."));
  await Promise.all([...directories].map((dir) => mkdir(join(root, dir), { recursive: true })));
  await Promise.all(paths.map((path) => writeFile(join(root, path), FIXTURE_FILES[path]!)));
}

// The fixture is only ever read, so it's built once for the whole file.
describe("ContentCollection", () => {
  let fixturePath: string;
  let collection: ContentCollection;

  beforeAll(async () => {
    fixturePath = await mkdtemp(join(tmpdir(), "content-collection-"));
    await writeFixture(fixturePath);
    collection = new ContentCollection(fixturePath);
  });

  afterAll(async () => {
    await rm(fixturePath, { recursive: true, force: true });
  });

  describe("list", () => {
    test("includes nested files with slash-separated slugs", async () => {
      const items = await collection.list();
      expect(items.map((item) => item.slug)).toContain("nested/thing");
    });

    test("uses the markdown H1 as the title", async () => {
      const items = await collection.list();
      expect(items.find((item) => item.slug === "nested/thing")?.title).toBe("Nested Thing");
    });

    test("includes top-level markdown files", async () => {
      const items = await collection.list();
      expect(items.map((item) => item.slug)).toContain("code-style");
    });

    test("skips files whose names start with an underscore", async () => {
      const items = await collection.list();
      expect(items.map((item) => item.slug)).not.toContain("_draft");
    });

    test("skips nested files whose names start with an underscore", async () => {
      const items = await collection.list();
      expect(items.map((item) => item.slug)).not.toContain("nested/_secret");
    });

    test("skips files inside underscore-prefixed directories", async () => {
      const items = await collection.list();
      expect(items.map((item) => item.slug)).not.toContain("_hidden/ignored");
    });

    test("skips non-markdown files", async () => {
      const items = await collection.list();
      expect(items.map((item) => item.slug)).not.toContain("nested/notes");
    });

    test("returns exactly the visible markdown files, sorted by slug", async () => {
      const items = await collection.list();
      expect(items.map((item) => item.slug)).toEqual([
        "code-style",
        "nested/other",
        "nested/thing",
      ]);
    });

    test("returns only items under a matching filter prefix", async () => {
      const items = await collection.list("nested/");
      expect(items.map((item) => item.slug)).toEqual(["nested/other", "nested/thing"]);
    });

    test("still skips underscore-prefixed files within a filter prefix", async () => {
      const items = await collection.list("nested/");
      expect(items.map((item) => item.slug)).not.toContain("nested/_secret");
    });

    test("matches a partial filename, not just a directory prefix", async () => {
      const items = await collection.list("code-");
      expect(items.map((item) => item.slug)).toEqual(["code-style"]);
    });

    test("returns nothing for a non-matching filter", async () => {
      const items = await collection.list("missing/");
      expect(items).toEqual([]);
    });
  });

  describe("getRaw", () => {
    test("returns the raw markdown source for a nested slug", async () => {
      const text = await collection.getRaw("nested/thing");
      expect(text).toBe("# Nested Thing\n");
    });

    test("returns the raw markdown source for a top-level slug", async () => {
      const text = await collection.getRaw("code-style");
      expect(text).toBe("# Code Style\n");
    });
  });

  // `get` delegates to `getRaw`, so the guard is only exercised here.
  describe("getRaw slug validation", () => {
    test("rejects a parent-directory segment", async () => {
      await expect(collection.getRaw("nested/../code-style")).rejects.toThrow("Invalid slug");
    });

    test("rejects a slug of ..", async () => {
      await expect(collection.getRaw("..")).rejects.toThrow("Invalid slug");
    });

    test("rejects backslashes", async () => {
      await expect(collection.getRaw("nested\\thing")).rejects.toThrow("Invalid slug");
    });

    test("rejects empty segments", async () => {
      await expect(collection.getRaw("nested//thing")).rejects.toThrow("Invalid slug");
    });

    test("rejects a leading slash", async () => {
      await expect(collection.getRaw("/code-style")).rejects.toThrow("Invalid slug");
    });
  });

  describe("get", () => {
    test("parses a nested item into markdown nodes", async () => {
      const item = await collection.get("nested/thing");
      expect(item.children[0]).toMatchObject({
        type: "heading",
        depth: 1,
        children: [{ type: "text", value: "Nested Thing" }],
      });
    });

    test("parses a top-level item into markdown nodes", async () => {
      const item = await collection.get("code-style");
      expect(item.children[0]).toMatchObject({
        type: "heading",
        depth: 1,
        children: [{ type: "text", value: "Code Style" }],
      });
    });
  });
});
