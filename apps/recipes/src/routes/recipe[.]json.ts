import { createFileRoute } from "@tanstack/react-router";

import { recipeJsonSchema } from "@/lib/recipes.schemas";

/** Serves the recipe domain model as JSON Schema at `/recipe.json`. */
export const Route = createFileRoute("/recipe.json")({
  server: {
    handlers: {
      GET: () =>
        new Response(JSON.stringify(recipeJsonSchema, undefined, 2), {
          headers: {
            "Content-Type": "application/schema+json; charset=utf-8",
          },
        }),
    },
  },
});
