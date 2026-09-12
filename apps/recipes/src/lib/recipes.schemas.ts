import * as z from "zod";

export const ingredientSchema = z.object({
  id: z.string().min(1),
  quantity: z.string().min(1),
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
    name: z.string().min(1),
    description: z.string().optional(),
    tags: z.array(z.string().min(1)).default([]),
    servings: z.number().int().positive().optional(),
    prepMinutes: z.number().int().nonnegative().optional(),
    cookMinutes: z.number().int().nonnegative().optional(),
    ingredients: z.array(ingredientSchema).min(1),
    steps: z.array(stepSchema).min(1),
    notes: z.string().optional(),
    draft: z.boolean().default(false),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  })
  .superRefine((recipe, ctx) => {
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
 * - Dates -> ISO date-time strings (`z.coerce.date()` has no JSON Schema form)
 * - `io: "input"` so defaults like `draft` / `tags` aren't required
 */
export const recipeJsonSchema = z.toJSONSchema(recipeSchema, {
  io: "input",
  unrepresentable: ({ zodSchema }) =>
    zodSchema._zod.def.type === "date" ? { type: "string", format: "date-time" } : "throw",
});
