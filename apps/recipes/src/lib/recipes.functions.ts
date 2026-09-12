import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

import { getRecipe, listRecipes } from "./recipes.server";

export const listRecipesFn = createServerFn().handler(async () => {
  return listRecipes();
});

export const getRecipeFn = createServerFn()
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    return getRecipe(data.id);
  });
