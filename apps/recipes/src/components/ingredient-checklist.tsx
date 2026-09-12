import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Ingredient } from "@/lib/recipes.schemas";
import { cn } from "@/lib/utils";

interface IngredientChecklistProps {
  ingredients: Ingredient[];
  checked: Record<string, boolean>;
  onToggle: (ingredientId: string) => void;
}

/** Checkbox list of a recipe's ingredients, so a cook can tick items off while cooking. */
export function IngredientChecklist({ ingredients, checked, onToggle }: IngredientChecklistProps) {
  return (
    <ul className="flex flex-col gap-2">
      {ingredients.map((ingredient) => {
        const isChecked = Boolean(checked[ingredient.id]);
        const inputId = `ingredient-${ingredient.id}`;

        return (
          <li key={ingredient.id} className="flex items-start gap-2.5">
            <Checkbox
              id={inputId}
              checked={isChecked}
              onCheckedChange={() => onToggle(ingredient.id)}
              className="mt-0.5"
            />
            <Label
              htmlFor={inputId}
              className={cn(
                "flex flex-1 gap-2 font-normal",
                isChecked && "text-muted-foreground line-through",
              )}
            >
              <span className="w-24 shrink-0">{ingredient.quantity}</span>
              <span>
                {ingredient.item}
                {ingredient.notes && <span> — {ingredient.notes}</span>}
              </span>
            </Label>
          </li>
        );
      })}
    </ul>
  );
}
