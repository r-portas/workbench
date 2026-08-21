import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

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
  await mkdir(join(root, "nested"), { recursive: true });
  await mkdir(join(root, "_hidden"), { recursive: true });
  await Promise.all(
    Object.entries(FIXTURE_FILES).map(([relativePath, contents]) =>
      writeFile(join(root, relativePath), contents),
    ),
  );
}

describe("ContentCollection", () => {
  let fixturePath: string;
  let collection: ContentCollection;

  beforeEach(async () => {
    fixturePath = await mkdtemp(join(tmpdir(), "content-collection-"));
    await writeFixture(fixturePath);
    collection = new ContentCollection(fixturePath);
  });

  afterEach(async () => {
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

    test("sorts items by slug", async () => {
      const items = await collection.list();
      expect(items.map((item) => item.slug)).toEqual([
        "code-style",
        "nested/other",
        "nested/thing",
      ]);
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

    test("rejects a parent-directory segment", async () => {
      await expect(collection.getRaw("nested/../code-style")).rejects.toThrow("Invalid slug");
    });
  });

  describe("get", () => {
    test("reads a nested item by its slash-separated slug", async () => {
      const item = await collection.get("nested/thing");
      expect(item).toBeDefined();
    });

    test("reads a top-level item by its filename slug", async () => {
      const item = await collection.get("code-style");
      expect(item).toBeDefined();
    });

    test("rejects a parent-directory segment", async () => {
      await expect(collection.get("nested/../code-style")).rejects.toThrow("Invalid slug");
    });

    test("rejects a slug of ..", async () => {
      await expect(collection.get("..")).rejects.toThrow("Invalid slug");
    });

    test("rejects backslashes", async () => {
      await expect(collection.get("nested\\thing")).rejects.toThrow("Invalid slug");
    });

    test("rejects empty segments", async () => {
      await expect(collection.get("nested//thing")).rejects.toThrow("Invalid slug");
    });

    test("rejects a leading slash", async () => {
      await expect(collection.get("/code-style")).rejects.toThrow("Invalid slug");
    });
  });
});
