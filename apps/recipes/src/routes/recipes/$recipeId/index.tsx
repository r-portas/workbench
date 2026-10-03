import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";

import { CookModeToggle } from "@/components/cook-mode-toggle";
import { RecipePills } from "@/components/recipe-pills";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { getRecipeFn } from "@/lib/recipes.functions";
import type { Ingredient, Recipe } from "@/lib/recipes.schemas";
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

  return (
    <article className="mx-auto flex w-full max-w-5xl flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between gap-2">
        <ButtonLink to="/" variant="ghost">
          <ArrowLeftIcon data-icon="inline-start" />
          All recipes
        </ButtonLink>
        <CookModeToggle />
      </div>

      <RecipeHeader recipe={recipe} />

      <div className="grid items-start gap-4 md:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] md:gap-6">
        <IngredientsCard ingredients={recipe.ingredients} />
        <StepsCard recipe={recipe} />
      </div>

      {recipe.notes && (
        <Card className="gap-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold">
              <h2>Notes</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-muted-foreground">{recipe.notes}</p>
          </CardContent>
        </Card>
      )}
    </article>
  );
}

function RecipeHeader({ recipe }: { recipe: Recipe }) {
  const timing = [
    recipe.prepMinutes !== undefined && `${recipe.prepMinutes} min prep`,
    recipe.cookMinutes !== undefined && `${recipe.cookMinutes} min cook`,
    recipe.servings && `serves ${recipe.servings}`,
  ].filter(Boolean);

  return (
    <Card className="gap-3">
      <CardHeader className="gap-3">
        <CardTitle className="text-2xl leading-tight font-bold tracking-tight text-balance md:text-3xl">
          <h1>{recipe.name}</h1>
        </CardTitle>
        {recipe.description && (
          <CardDescription className="max-w-prose text-base leading-relaxed">
            {recipe.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <RecipePills recipe={recipe} />
        {timing.length > 0 && (
          <p className="font-mono text-xs text-muted-foreground">{timing.join(" · ")}</p>
        )}
      </CardContent>
    </Card>
  );
}

function IngredientsCard({ ingredients }: { ingredients: Ingredient[] }) {
  // Ticked state is only for the current cook, so it deliberately isn't persisted.
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  return (
    <Card className="gap-2 md:sticky md:top-6">
      <CardHeader>
        <CardTitle className="text-lg font-bold">
          <h2>Ingredients</h2>
        </CardTitle>
        <CardAction aria-live="polite">
          <Badge variant="secondary" className="font-mono">
            {checked.size}/{ingredients.length}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent>
        <ul className="-mx-2 flex flex-col">
          {ingredients.map((ingredient) => {
            const isChecked = checked.has(ingredient.id);
            return (
              <li key={ingredient.id}>
                <Field
                  orientation="horizontal"
                  className="min-h-11 items-start gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/60"
                >
                  <Checkbox
                    id={`ingredient-${ingredient.id}`}
                    checked={isChecked}
                    onCheckedChange={() => toggle(ingredient.id)}
                    className="mt-0.5 size-5"
                  />
                  {/* The label stretches over the row so it's an easy target with messy fingers. */}
                  <FieldLabel
                    htmlFor={`ingredient-${ingredient.id}`}
                    className={cn(
                      "grid w-full flex-1 grid-cols-[5.5rem_1fr] gap-x-3 leading-6 font-normal transition-opacity",
                      isChecked && "line-through decoration-muted-foreground/70 opacity-50",
                    )}
                  >
                    <span className="font-mono text-xs leading-6 text-muted-foreground">
                      {ingredient.quantity}
                    </span>
                    <span>
                      {ingredient.item}
                      {ingredient.notes && (
                        <span className="block text-xs leading-5 text-muted-foreground">
                          {ingredient.notes}
                        </span>
                      )}
                    </span>
                  </FieldLabel>
                </Field>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function StepsCard({ recipe }: { recipe: Recipe }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">
          <h2>Steps</h2>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ol className="flex flex-col gap-5">
          {recipe.steps.map((step, index) => {
            // Zod ensures all ingredient ids are valid, hence the !
            const stepIngredients = step.ingredientIds.map((id) =>
              recipe.ingredients.find((ingredient) => ingredient.id === id)!,
            );

            return (
              <li key={index} className="grid grid-cols-[1.75rem_1fr] gap-x-2">
                <span className="font-mono text-sm leading-7 text-muted-foreground" aria-hidden>
                  {index + 1}.
                </span>
                <div className="flex flex-col gap-2">
                  <p className="text-base leading-7">{step.text}</p>
                  {stepIngredients.length > 0 && (
                    <ul className="flex flex-wrap gap-1.5" aria-label="Ingredients for this step">
                      {stepIngredients.map((ingredient) => (
                        <li key={ingredient.id}>
                          <Badge variant="secondary" className="h-auto py-1 whitespace-normal">
                            {ingredient.quantity && (
                              <span className="font-mono">{ingredient.quantity} </span>
                            )}
                            {ingredient.item}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
