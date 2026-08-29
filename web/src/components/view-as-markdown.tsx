import { Link } from "@tanstack/react-router";
import { FileTextIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// #region ViewAsMarkdown
interface ViewAsMarkdownProps {
  /** The item's path relative to `content/`, without the `.md` extension. */
  slug: string;
  /** Extra Tailwind classes forwarded to the link. */
  className?: string;
}

/**
 * A labeled link that opens the raw markdown source for a content page.
 */
export default function ViewAsMarkdown({ slug, className }: ViewAsMarkdownProps) {
  return (
    <Link
      reloadDocument
      to="/{$}.md"
      params={{ _splat: slug }}
      className={cn(
        buttonVariants({ variant: "outline", size: "xs" }),
        "text-muted-foreground",
        className,
      )}
    >
      <FileTextIcon data-icon="inline-start" />
      View as markdown
    </Link>
  );
}
// #endregion

// #region ViewAsMarkdownIcon
interface ViewAsMarkdownIconProps {
  /** The item's path relative to `content/`, without the `.md` extension. */
  slug: string;
  /** Extra Tailwind classes forwarded to the link. */
  className?: string;
}

/**
 * An icon-only link that opens the raw markdown source, for dense list rows.
 */
export function ViewAsMarkdownIcon({ slug, className }: ViewAsMarkdownIconProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            reloadDocument
            to="/{$}.md"
            params={{ _splat: slug }}
            aria-label="View as markdown"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-xs" }),
              "text-muted-foreground",
              className,
            )}
          />
        }
      >
        <FileTextIcon />
      </TooltipTrigger>
      <TooltipContent>View as markdown</TooltipContent>
    </Tooltip>
  );
}
// #endregion
