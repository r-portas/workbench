import { ClockIcon } from "lucide-react";

import { formatMinutes, totalMinutes } from "@/lib/recipes";
import type { Recipe } from "@/lib/recipes.schemas";
import { cn } from "@/lib/utils";

function Pill({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full px-2.5 font-mono text-xs",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Total time and draft status for a recipe, as a row of pills.
 */
function RecipePills({ recipe, className }: { recipe: Recipe; className?: string }) {
  const minutes = totalMinutes(recipe);

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {minutes !== undefined && (
        <Pill className="bg-secondary text-secondary-foreground">
          <ClockIcon className="size-3.5" aria-hidden />
          <span className="sr-only">Total time </span>
          {formatMinutes(minutes)}
        </Pill>
      )}
      {recipe.draft && (
        <Pill className="border border-dashed border-muted-foreground/50 text-muted-foreground">
          draft
        </Pill>
      )}
    </div>
  );
}

export { Pill, RecipePills };
