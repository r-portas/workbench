import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";

import { IngredientChecklist } from "@/components/ingredient-checklist";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { useIngredientChecklist } from "@/hooks/use-ingredient-checklist";
import { getRecipeFn } from "@/lib/recipes.functions";
import type { Recipe } from "@/lib/recipes.schemas";
import { cn } from "@/lib/utils";

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
  const { checked, toggle } = useIngredientChecklist();

  return (
    <article className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div>
        <ButtonLink to="/" variant="ghost" size="sm">
          <ArrowLeftIcon data-icon="inline-start" />
          All recipes
        </ButtonLink>
      </div>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-3xl font-medium tracking-tight">{recipe.name}</h1>
          {recipe.draft && <Badge variant="outline">Draft</Badge>}
        </div>
        {recipe.description && <p className="text-muted-foreground">{recipe.description}</p>}
        <RecipeMeta recipe={recipe} />
        {recipe.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {recipe.tags.map((tag) => (
              <li key={tag}>
                <Badge variant="secondary">{tag}</Badge>
              </li>
            ))}
          </ul>
        )}
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium">Ingredients</h2>
        <IngredientChecklist ingredients={recipe.ingredients} checked={checked} onToggle={toggle} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium">Steps</h2>
        <ol className="flex flex-col gap-4">
          {recipe.steps.map((step, index) => {
            // Zod ensures all ingredient ids are valid, hence the !
            const stepIngredients = step.ingredientIds.map((id) =>
              recipe.ingredients.find((ingredient) => ingredient.id === id)!,
            );

            return (
              <li key={index} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground"
                >
                  {index + 1}
                </span>
                <div className="flex flex-1 flex-col gap-2 pt-0.5">
                  <p>{step.text}</p>
                  {stepIngredients.length > 0 && (
                    <ul className="flex flex-col gap-1 border-l border-border pl-3 text-sm text-muted-foreground">
                      {stepIngredients.map((ingredient) => (
                        <li
                          key={ingredient.id}
                          className={cn(checked[ingredient.id] && "line-through opacity-60")}
                        >
                          {ingredient.quantity} {ingredient.item}
                          {ingredient.notes && ` — ${ingredient.notes}`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
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
