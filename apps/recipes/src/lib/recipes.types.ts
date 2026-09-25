import type { Recipe } from "./recipes.schemas";

/** A recipe plus the category it was loaded from (its folder under `content/`). */
export interface RecipeWithCategory extends Recipe {
  category: string;
}

/** Recipes belonging to one category, as listed on the home page. */
export type RecipeGroup = {
  category: string;
  recipes: RecipeWithCategory[];
};
