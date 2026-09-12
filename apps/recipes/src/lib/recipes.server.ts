import { readFileSync } from "node:fs";
import { join } from "node:path";

import { type Recipe, recipeSchema } from "./recipes.schemas";

/** Recipe JSON lives at `<app-root>/content/` (cwd is the app root in dev and build). */
const CONTENT_DIR = join(process.cwd(), "content");

/**
 * Loads and validates every `*.json` recipe under `content/`.
 *
 * @remarks
 * Filename stem must match `recipe.id`. Invalid files throw with the path.
 */
function loadRecipes(): Recipe[] {
  const recipes: Recipe[] = [];

  for (const entry of new Bun.Glob("*.json").scanSync({ cwd: CONTENT_DIR })) {
    const path = join(CONTENT_DIR, entry);
    const id = entry.replace(/\.json$/, "");

    let data: unknown;
    try {
      data = JSON.parse(readFileSync(path, "utf8"));
    } catch (error) {
      throw new Error(`Failed to parse recipe JSON: ${path}`, { cause: error });
    }

    let recipe: Recipe;
    try {
      recipe = recipeSchema.parse(data);
    } catch (error) {
      throw new Error(`Invalid recipe: ${path}`, { cause: error });
    }

    if (recipe.id !== id) {
      throw new Error(`Recipe id "${recipe.id}" does not match filename "${id}" (${path})`);
    }

    recipes.push(recipe);
  }

  return recipes;
}

const RECIPES = loadRecipes();

/**
 * Returns all recipes, newest updated first.
 *
 * @example
 * const recipes = listRecipes();
 */
export function listRecipes(): Recipe[] {
  return RECIPES.toSorted((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

/**
 * Looks up a single recipe by id, or `undefined` if missing.
 *
 * @example
 * const recipe = getRecipe("overnight-oats");
 */
export function getRecipe(id: string): Recipe | undefined {
  return RECIPES.find((recipe) => recipe.id === id);
}
