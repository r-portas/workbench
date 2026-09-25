import * as z from "zod";

export const ingredientSchema = z.object({
  id: z.string().min(1),
  quantity: z.string().optional(),
  item: z.string().min(1),
  notes: z.string().optional(),
});

export const stepSchema = z.object({
  text: z.string().min(1),
  ingredientIds: z.array(z.string().min(1)).default([]),
});

export const recipeSchema = z
  .object({
    id: z.string().min(1),
    draft: z.boolean().default(false),
    name: z.string().min(1),
    description: z.string().optional(),
    servings: z.number().int().positive().optional(),
    prepMinutes: z.number().int().nonnegative().optional(),
    cookMinutes: z.number().int().nonnegative().optional(),
    ingredients: z.array(ingredientSchema).min(1),
    steps: z.array(stepSchema).min(1),
    notes: z.string().optional(),
  })
  .superRefine((recipe, ctx) => {
    // Ingredient ids must be unique so steps can reference them unambiguously.
    const seen = new Set<string>();
    for (const [index, ingredient] of recipe.ingredients.entries()) {
      if (seen.has(ingredient.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["ingredients", index, "id"],
          message: `Duplicate ingredient id: ${ingredient.id}`,
        });
      }
      seen.add(ingredient.id);
    }

    // Every step ingredientId must point at an ingredient defined above.
    for (const [stepIndex, step] of recipe.steps.entries()) {
      for (const [idIndex, ingredientId] of step.ingredientIds.entries()) {
        if (!seen.has(ingredientId)) {
          ctx.addIssue({
            code: "custom",
            path: ["steps", stepIndex, "ingredientIds", idIndex],
            message: `Unknown ingredient id: ${ingredientId}`,
          });
        }
      }
    }
  });

export type Ingredient = z.infer<typeof ingredientSchema>;
export type Step = z.infer<typeof stepSchema>;
export type Recipe = z.infer<typeof recipeSchema>;

/**
 * JSON Schema for {@link recipeSchema} (input shape for authoring).
 *
 * @remarks
 * Uses `io: "input"` so defaults like `draft` aren't required.
 */
export const recipeJsonSchema = z.toJSONSchema(recipeSchema, { io: "input" });
