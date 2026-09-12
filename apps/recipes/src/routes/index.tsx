import { createFileRoute, Link } from "@tanstack/react-router";

import { listRecipesFn } from "@/lib/recipes.functions";
import type { Recipe } from "@/lib/recipes.schemas";

export const Route = createFileRoute("/")({
  loader: () => listRecipesFn(),
  component: RecipeList,
});

function RecipeList() {
  const recipes = Route.useLoaderData();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-medium tracking-tight">Recipes</h1>
        <p className="text-muted-foreground">A small collection to cook from.</p>
        <Link
          reloadDocument
          to="/recipe.json"
          className="w-fit text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Recipe JSON Schema
        </Link>
      </header>

      <ul className="divide-y divide-border border-y border-border">
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            <Link
              to="/recipes/$recipeId"
              params={{ recipeId: recipe.id }}
              className="flex flex-col gap-1 py-4 transition-colors hover:text-foreground"
            >
              <span className="font-medium">{recipe.name}</span>
              <RecipeListMeta recipe={recipe} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecipeListMeta({ recipe }: { recipe: Recipe }) {
  const parts: string[] = [];
  if (recipe.servings) parts.push(`${recipe.servings} servings`);
  if (recipe.prepMinutes !== undefined || recipe.cookMinutes !== undefined) {
    const total = (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0);
    parts.push(`${total} min`);
  }
  if (recipe.tags.length > 0) parts.push(recipe.tags.slice(0, 3).join(" · "));

  if (parts.length === 0) return;

  return <span className="text-sm text-muted-foreground">{parts.join(" · ")}</span>;
}
