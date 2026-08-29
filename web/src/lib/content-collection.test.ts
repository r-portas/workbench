import { describe, expect, test } from "bun:test";

import { groupIntoSections, stripSection } from "./content-collection";
import type { ItemSummary } from "./content-collection.types";

function item(slug: string): ItemSummary {
  return { slug, title: slug };
}

describe("groupIntoSections", () => {
  test("buckets items under their top-level folder", () => {
    const sections = groupIntoSections([item("guides/drizzle"), item("cheatsheets/gh")]);
    expect(sections.map((section) => [section.slug, section.items.map((i) => i.slug)])).toEqual([
      ["guides", ["guides/drizzle"]],
      ["cheatsheets", ["cheatsheets/gh"]],
    ]);
  });

  test("orders sections by CONTENT_SECTIONS, not by input order", () => {
    const sections = groupIntoSections([
      item("cheatsheets/gh"),
      item("conventions/code-style"),
      item("guides/drizzle"),
    ]);
    expect(sections.map((section) => section.slug)).toEqual([
      "guides",
      "conventions",
      "cheatsheets",
    ]);
  });

  test("attaches the section label", () => {
    const sections = groupIntoSections([item("guides/drizzle")]);
    expect(sections[0]?.label).toBe("Guides");
  });

  test("omits sections with no items", () => {
    const sections = groupIntoSections([item("guides/drizzle")]);
    expect(sections.map((section) => section.slug)).toEqual(["guides"]);
  });

  test("returns an empty array for an empty listing", () => {
    expect(groupIntoSections([])).toEqual([]);
  });

  test("drops items outside a known section", () => {
    expect(groupIntoSections([item("templates/tss")])).toEqual([]);
  });

  test("drops top-level items that have no section prefix", () => {
    expect(groupIntoSections([item("readme")])).toEqual([]);
  });

  test("requires a separator, so a folder that merely starts with a section name is dropped", () => {
    expect(groupIntoSections([item("guides-archive/old")])).toEqual([]);
  });

  test("keeps nested items in their top-level section", () => {
    const sections = groupIntoSections([item("conventions/tanstack-start/project-structure")]);
    expect(sections[0]?.items.map((i) => i.slug)).toEqual([
      "conventions/tanstack-start/project-structure",
    ]);
  });

  test("preserves the incoming order of items within a section", () => {
    const sections = groupIntoSections([item("guides/typescript"), item("guides/drizzle")]);
    expect(sections[0]?.items.map((i) => i.slug)).toEqual(["guides/typescript", "guides/drizzle"]);
  });
});

describe("stripSection", () => {
  test("drops the top-level folder", () => {
    expect(stripSection("guides/drizzle")).toBe("drizzle");
  });

  test("keeps deeper nesting intact", () => {
    expect(stripSection("conventions/tanstack-start/project-structure")).toBe(
      "tanstack-start/project-structure",
    );
  });

  test("returns the slug unchanged when there is no separator", () => {
    expect(stripSection("readme")).toBe("readme");
  });

  test("returns an empty string for a bare section prefix", () => {
    expect(stripSection("guides/")).toBe("");
  });
});
