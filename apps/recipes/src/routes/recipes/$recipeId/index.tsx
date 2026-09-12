import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { getRecipeFn } from "@/lib/recipes.functions";
import type { Recipe } from "@/lib/recipes.schemas";

export const Route = createFileRoute("/recipes/$recipeId/")({
  loader: async ({ params }) => {
    const recipe = await getRecipeFn({ data: { id: params.recipeId } });
    if (!recipe) throw notFound();
    return recipe;
  },
  component: RecipeDetail,
});

function RecipeDetail() {
  const recipe = Route.useLoaderData();

  return (
    <article className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div>
        <ButtonLink to="/" variant="ghost" size="sm">
          <ArrowLeftIcon data-icon="inline-start" />
          All recipes
        </ButtonLink>
      </div>

      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-3xl font-medium tracking-tight">{recipe.name}</h1>
        {recipe.description && <p className="text-muted-foreground">{recipe.description}</p>}
        <RecipeMeta recipe={recipe} />
      </header>

      {recipe.tags.length > 0 && (
        <ul className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {recipe.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium">Ingredients</h2>
        <ul className="flex flex-col gap-2">
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient.id} className="flex gap-2">
              <span className="w-24 shrink-0 text-muted-foreground">{ingredient.quantity}</span>
              <span>
                {ingredient.item}
                {ingredient.notes && (
                  <span className="text-muted-foreground"> — {ingredient.notes}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium">Steps</h2>
        <ol className="flex list-decimal flex-col gap-4 pl-5">
          {recipe.steps.map((step, index) => {
            const stepIngredients = step.ingredientIds.map(
              (id) => recipe.ingredients.find((ingredient) => ingredient.id === id)!,
            );

            return (
              <li key={index} className="flex flex-col gap-2">
                <span>{step.text}</span>
                {stepIngredients.length > 0 && (
                  <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                    {stepIngredients.map((ingredient) => (
                      <li key={ingredient.id}>
                        {ingredient.quantity} {ingredient.item}
                        {ingredient.notes && ` — ${ingredient.notes}`}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {recipe.notes && (
        <section className="flex flex-col gap-2 border-t border-border pt-6">
          <h2 className="font-heading text-lg font-medium">Notes</h2>
          <p className="text-muted-foreground">{recipe.notes}</p>
        </section>
      )}
    </article>
  );
}

function RecipeMeta({ recipe }: { recipe: Recipe }) {
  const parts: string[] = [];
  if (recipe.servings) parts.push(`${recipe.servings} servings`);
  if (recipe.prepMinutes !== undefined) parts.push(`${recipe.prepMinutes} min prep`);
  if (recipe.cookMinutes !== undefined) parts.push(`${recipe.cookMinutes} min cook`);

  if (parts.length === 0) return;

  return <p className="text-sm text-muted-foreground">{parts.join(" · ")}</p>;
}
