import { describe, expect, test } from "bun:test";

import { compareCategories, formatMinutes, totalMinutes } from "./recipes";
import type { Recipe } from "./recipes.schemas";

function recipe(overrides: Partial<Recipe>): Recipe {
  return {
    id: "r",
    draft: false,
    name: "R",
    ingredients: [{ id: "i", quantity: "1", item: "egg" }],
    steps: [{ text: "Cook", ingredientIds: [] }],
    ...overrides,
  };
}

describe("totalMinutes", () => {
  test("sums prep and cook", () => {
    expect(totalMinutes(recipe({ prepMinutes: 5, cookMinutes: 10 }))).toBe(15);
  });

  test("handles only one being set", () => {
    expect(totalMinutes(recipe({ cookMinutes: 10 }))).toBe(10);
  });

  test("is undefined without timing", () => {
    expect(totalMinutes(recipe({}))).toBeUndefined();
  });
});

describe("formatMinutes", () => {
  test.each([
    [0, "0m"],
    [45, "45m"],
    [60, "1h"],
    [370, "6h 10m"],
  ])("%p -> %p", (minutes, expected) => {
    expect(formatMinutes(minutes)).toBe(expected);
  });
});

describe("compareCategories", () => {
  test("puts dinner and snacks first, new last, and others alphabetically between", () => {
    const categories = ["new", "sides", "snacks", "baking", "dinner"];
    expect(categories.toSorted(compareCategories)).toEqual([
      "dinner",
      "snacks",
      "baking",
      "sides",
      "new",
    ]);
  });
});
