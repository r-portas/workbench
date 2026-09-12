import { useState } from "react";

/** Tracks which of a recipe's ingredients have been checked off, in memory only. */
export function useIngredientChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  function toggle(ingredientId: string) {
    setChecked((prev) => ({ ...prev, [ingredientId]: !prev[ingredientId] }));
  }

  return { checked, toggle };
}
