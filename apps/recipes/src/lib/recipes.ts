import type { Recipe } from "./recipes.schemas";

/**
 * Total hands-on + cooking time, or `undefined` when the recipe has no timing.
 */
export function totalMinutes(recipe: Recipe): number | undefined {
  if (recipe.prepMinutes === undefined && recipe.cookMinutes === undefined) return undefined;
  return (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0);
}

/**
 * Formats minutes compactly for pills.
 *
 * @example
 * ```ts
 * formatMinutes(45); // "45m"
 * formatMinutes(370); // "6h 10m"
 * ```
 */
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

/** Categories pinned to the top of the home page, in order. */
const FIRST_CATEGORIES = ["dinner", "snacks"];
/** Categories pinned to the bottom of the home page, in order. */
const LAST_CATEGORIES = ["new"];

function categoryRank(category: string): number {
  const first = FIRST_CATEGORIES.indexOf(category);
  if (first !== -1) return first;
  const last = LAST_CATEGORIES.indexOf(category);
  // Unpinned categories share the slot between the first and last groups.
  return last === -1 ? FIRST_CATEGORIES.length : FIRST_CATEGORIES.length + 1 + last;
}

/**
 * Sort comparator for categories (the folders under `content/`).
 *
 * @remarks
 * Dinner and snacks come first and new comes last. Any other category goes in between,
 * alphabetically, so a new folder shows up without code changes.
 *
 * @example
 * ```ts
 * ["new", "baking", "dinner"].toSorted(compareCategories); // ["dinner", "baking", "new"]
 * ```
 */
export function compareCategories(a: string, b: string): number {
  return categoryRank(a) - categoryRank(b) || a.localeCompare(b);
}
