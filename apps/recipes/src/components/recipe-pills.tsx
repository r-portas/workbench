import { ClockIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatMinutes, totalMinutes } from "@/lib/recipes";
import type { Recipe } from "@/lib/recipes.schemas";
import { cn } from "@/lib/utils";

/**
 * Total time and draft status for a recipe, as a row of badges.
 */
function RecipePills({ recipe, className }: { recipe: Recipe; className?: string }) {
  const minutes = totalMinutes(recipe);

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {minutes !== undefined && (
        <Badge variant="secondary" className="h-6 px-2.5 font-mono">
          <ClockIcon data-icon="inline-start" aria-hidden />
          <span className="sr-only">Total time </span>
          {formatMinutes(minutes)}
        </Badge>
      )}
      {recipe.draft && (
        <Badge
          variant="outline"
          className="h-6 border-dashed border-muted-foreground/50 px-2.5 font-mono text-muted-foreground"
        >
          draft
        </Badge>
      )}
    </div>
  );
}

export { RecipePills };
