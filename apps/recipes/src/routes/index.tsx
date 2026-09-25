import { createFileRoute, Link } from "@tanstack/react-router";

import { RecipePills } from "@/components/recipe-pills";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listRecipesFn } from "@/lib/recipes.functions";
import type { Recipe } from "@/lib/recipes.schemas";

export const Route = createFileRoute("/")({
  loader: () => listRecipesFn(),
  component: RecipeList,
});

function RecipeList() {
  const groups = Route.useLoaderData();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header className="pt-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">Recipes</h1>
      </header>

      {groups.map((group) => (
        <section
          key={group.category}
          aria-labelledby={`category-${group.category}`}
          className="flex flex-col gap-3"
        >
          <h2
            id={`category-${group.category}`}
            className="font-heading text-xl font-bold tracking-tight capitalize"
          >
            {group.category}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {group.recipes.map((recipe) => (
              <li key={recipe.id} className="flex">
                <RecipeCard recipe={recipe} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <footer className="border-t border-border pt-4">
        <Link
          reloadDocument
          to="/recipe.json"
          className="font-mono text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Recipe JSON Schema
        </Link>
      </footer>
    </div>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      to="/recipes/$recipeId"
      params={{ recipeId: recipe.id }}
      className="group flex flex-1 rounded-xl transition-transform hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:hover:translate-y-0"
    >
      <Card className="flex-1 gap-3 transition-shadow group-hover:ring-foreground/25">
        <CardHeader className="gap-3">
          <CardTitle className="text-lg font-bold text-balance">
            <h3>{recipe.name}</h3>
          </CardTitle>
          {recipe.description && (
            <CardDescription className="line-clamp-2 leading-relaxed">
              {recipe.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="mt-auto">
          <RecipePills recipe={recipe} />
        </CardContent>
      </Card>
    </Link>
  );
}
