import { Link } from "@tanstack/react-router";
import { FileTextIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ContentCollectionName } from "@/lib/content-collection.types";
import { cn } from "@/lib/utils";

// #region ViewAsMarkdown
interface ViewAsMarkdownProps {
  /** Which content collection the item belongs to. */
  collection: ContentCollectionName;
  /** The item's path relative to the collection, without the `.md` extension. */
  slug: string;
  /** Extra Tailwind classes forwarded to the link. */
  className?: string;
}

/**
 * A labeled link that opens the raw markdown source for a content page.
 */
export default function ViewAsMarkdown({ collection, slug, className }: ViewAsMarkdownProps) {
  return (
    <Link
      reloadDocument
      to={`/${collection}/{$}.md`}
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
  /** Which content collection the item belongs to. */
  collection: ContentCollectionName;
  /** The item's path relative to the collection, without the `.md` extension. */
  slug: string;
  /** Extra Tailwind classes forwarded to the link. */
  className?: string;
}

/**
 * An icon-only link that opens the raw markdown source, for dense list rows.
 */
export function ViewAsMarkdownIcon({ collection, slug, className }: ViewAsMarkdownIconProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            reloadDocument
            to={`/${collection}/{$}.md`}
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
