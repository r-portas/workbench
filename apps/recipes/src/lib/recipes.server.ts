import { readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

import { compareCategories } from "./recipes";
import { recipeSchema } from "./recipes.schemas";
import type { RecipeGroup, RecipeWithCategory } from "./recipes.types";

/** Recipe JSON lives at `<app-root>/content/` (cwd is the app root in dev and build). */
const CONTENT_DIR = join(process.cwd(), "content");

/**
 * Loads and validates every `<category>/<id>.json` recipe under `content/`.
 *
 * @remarks
 * The folder is the recipe's category. The filename stem must match `recipe.id`, and ids must be
 * unique across categories. Invalid files throw with the path.
 */
function loadRecipes(): RecipeWithCategory[] {
  const recipes: RecipeWithCategory[] = [];

  for (const entry of new Bun.Glob("*/*.json").scanSync({ cwd: CONTENT_DIR })) {
    const path = join(CONTENT_DIR, entry);
    const category = dirname(entry);
    const id = basename(entry, ".json");

    let recipe: RecipeWithCategory;
    try {
      recipe = { ...recipeSchema.parse(JSON.parse(readFileSync(path, "utf8"))), category };
    } catch (error) {
      throw new Error(`Invalid recipe: ${path}`, { cause: error });
    }

    if (recipe.id !== id) {
      throw new Error(`Recipe id "${recipe.id}" does not match filename "${id}" (${path})`);
    }
    // Recipe URLs don't include the category, so ids must be unique across folders.
    if (recipes.some((existing) => existing.id === id)) {
      throw new Error(`Duplicate recipe id "${id}" (${path})`);
    }

    recipes.push(recipe);
  }

  return recipes.toSorted((a, b) => a.name.localeCompare(b.name));
}

const RECIPES = loadRecipes();

/**
 * Returns recipes grouped by category (ordered by {@link compareCategories}), each group sorted
 * by name.
 *
 * @example
 * const groups = listRecipes();
 */
export function listRecipes(): RecipeGroup[] {
  const categories = new Set(RECIPES.map((recipe) => recipe.category));
  return [...categories].toSorted(compareCategories).map((category) => ({
    category,
    recipes: RECIPES.filter((recipe) => recipe.category === category),
  }));
}

/**
 * Looks up a single recipe by id, or `undefined` if missing.
 *
 * @example
 * const recipe = getRecipe("overnight-oats");
 */
export function getRecipe(id: string): RecipeWithCategory | undefined {
  return RECIPES.find((recipe) => recipe.id === id);
}
