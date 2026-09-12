import * as z from "zod";

// #region ingredient
export const ingredientSchema = z.object({
  quantity: z.string().min(1),
  item: z.string().min(1),
  notes: z.string().optional(),
});

export type Ingredient = z.infer<typeof ingredientSchema>;
// #endregion

// #region step
export const stepSchema = z.object({
  text: z.string().min(1),
});

export type Step = z.infer<typeof stepSchema>;
// #endregion

// #region recipe
/**
 * Full recipe record — identity and timestamps included for list/detail/edit and later persistence.
 */
export const recipeSchema = z.object({
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
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Recipe = z.infer<typeof recipeSchema>;

/**
 * JSON Schema for {@link recipeSchema}. Dates are emitted as ISO date-time strings
 * because `z.coerce.date()` has no JSON Schema equivalent.
 */
export const recipeJsonSchema = z.toJSONSchema(recipeSchema, {
  unrepresentable: ({ zodSchema }) =>
    zodSchema._zod.def.type === "date" ? { type: "string", format: "date-time" } : "throw",
});
// #endregion
