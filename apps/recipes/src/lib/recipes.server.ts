import { type Recipe, recipeSchema } from "./recipes.schemas";

const FIXTURES: Recipe[] = [
  recipeSchema.parse({
    id: "spaghetti-aglio-e-olio",
    name: "Spaghetti Aglio e Olio",
    description: "Pantry pasta with garlic, chili, and olive oil.",
    tags: ["pasta", "italian", "weeknight"],
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 15,
    ingredients: [
      { id: "spaghetti", quantity: "200g", item: "spaghetti" },
      { id: "garlic", quantity: "4 cloves", item: "garlic", notes: "thinly sliced" },
      { id: "red-chili-flakes", quantity: "1/2 tsp", item: "red chili flakes" },
      { id: "olive-oil", quantity: "1/4 cup", item: "olive oil" },
      { id: "salt", quantity: "to taste", item: "salt" },
      { id: "parsley", quantity: "a handful", item: "parsley", notes: "chopped" },
    ],
    steps: [
      {
        text: "Boil salted water and cook spaghetti until al dente. Reserve 1/2 cup pasta water.",
        ingredientIds: ["salt", "spaghetti"],
      },
      {
        text: "Warm olive oil over medium-low heat. Add garlic and chili flakes; cook until fragrant, not brown.",
        ingredientIds: ["olive-oil", "garlic", "red-chili-flakes"],
      },
      {
        text: "Toss drained pasta in the oil with a splash of pasta water until glossy.",
        ingredientIds: ["spaghetti", "olive-oil"],
      },
      {
        text: "Finish with parsley and more salt if needed. Serve immediately.",
        ingredientIds: ["parsley", "salt"],
      },
    ],
    notes: "If the garlic browns, start the oil again — bitter garlic ruins the dish.",
    createdAt: "2026-01-10T10:00:00.000Z",
    updatedAt: "2026-01-10T10:00:00.000Z",
  }),
  recipeSchema.parse({
    id: "overnight-oats",
    name: "Overnight Oats",
    description: "No-cook breakfast you stir together the night before.",
    tags: ["breakfast", "make-ahead"],
    servings: 1,
    prepMinutes: 5,
    cookMinutes: 0,
    ingredients: [
      { id: "rolled-oats", quantity: "1/2 cup", item: "rolled oats" },
      { id: "milk", quantity: "1/2 cup", item: "milk", notes: "dairy or oat" },
      { id: "yogurt", quantity: "1/4 cup", item: "yogurt" },
      { id: "chia-seeds", quantity: "1 tbsp", item: "chia seeds" },
      { id: "maple-syrup", quantity: "1 tbsp", item: "maple syrup" },
      { id: "salt", quantity: "a pinch", item: "salt" },
    ],
    steps: [
      {
        text: "Stir everything together in a jar.",
        ingredientIds: ["rolled-oats", "milk", "yogurt", "chia-seeds", "maple-syrup", "salt"],
      },
      { text: "Cover and refrigerate overnight, or at least 4 hours." },
      { text: "Eat cold, or warm briefly. Top with fruit or nuts if you like." },
    ],
    createdAt: "2026-02-01T08:00:00.000Z",
    updatedAt: "2026-02-01T08:00:00.000Z",
  }),
  recipeSchema.parse({
    id: "buttermilk-pancakes",
    name: "Buttermilk Pancakes",
    description: "Fluffy weekend pancakes with a soft crumb.",
    tags: ["breakfast", "weekend"],
    servings: 4,
    prepMinutes: 10,
    cookMinutes: 20,
    ingredients: [
      { id: "flour", quantity: "1 1/2 cups", item: "all-purpose flour" },
      { id: "sugar", quantity: "2 tbsp", item: "sugar" },
      { id: "baking-powder", quantity: "2 tsp", item: "baking powder" },
      { id: "baking-soda", quantity: "1/2 tsp", item: "baking soda" },
      { id: "salt", quantity: "1/2 tsp", item: "salt" },
      { id: "buttermilk", quantity: "1 1/4 cups", item: "buttermilk" },
      { id: "eggs", quantity: "2", item: "eggs" },
      { id: "butter", quantity: "3 tbsp", item: "butter", notes: "melted, plus more for the pan" },
    ],
    steps: [
      {
        text: "Whisk dry ingredients in a bowl.",
        ingredientIds: ["flour", "sugar", "baking-powder", "baking-soda", "salt"],
      },
      {
        text: "Whisk buttermilk, eggs, and melted butter in another bowl, then fold into the dry mix until just combined.",
        ingredientIds: ["buttermilk", "eggs", "butter"],
      },
      {
        text: "Cook 1/4-cup scoops on a buttered medium pan until bubbles form; flip and finish the other side.",
        ingredientIds: ["butter"],
      },
      { text: "Serve with maple syrup or fruit." },
    ],
    notes: "A few lumps in the batter are fine — overmixing makes tough pancakes.",
    createdAt: "2026-03-12T09:30:00.000Z",
    updatedAt: "2026-03-12T09:30:00.000Z",
  }),
];

/**
 * Returns all recipes, newest updated first.
 *
 * @example
 * const recipes = listRecipes();
 */
export function listRecipes(): Recipe[] {
  return FIXTURES.toSorted((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

/**
 * Looks up a single recipe by id, or `undefined` if missing.
 *
 * @example
 * const recipe = getRecipe("overnight-oats");
 */
export function getRecipe(id: string): Recipe | undefined {
  return FIXTURES.find((recipe) => recipe.id === id);
}
