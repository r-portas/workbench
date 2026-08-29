import { Link } from "@tanstack/react-router";

import { ViewAsMarkdownIcon } from "@/components/view-as-markdown";
import { stripSection } from "@/lib/content-collection";
import type { ItemSummary } from "@/lib/content-collection.types";
import { cn } from "@/lib/utils";

// #region CatalogSection
interface CatalogSectionProps {
  /** Section heading, rendered in uppercase. */
  label: string;
  /** Items listed under the heading, with slugs relative to `content/`. */
  items: ItemSummary[];
  /** Extra Tailwind classes forwarded to the root element. */
  className?: string;
}

/**
 * A labeled catalog list of content items with a hairline rule and count.
 */
export default function CatalogSection({ label, items, className }: CatalogSectionProps) {
  return (
    <section className={cn(className)}>
      <header className="flex items-center gap-3">
        <h2 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {label}
        </h2>
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground tabular-nums">{items.length}</span>
      </header>
      <ul className="mt-1">
        {items.map((item) => (
          <li key={item.slug}>
            <CatalogRow item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
// #endregion

// #region CatalogRow
interface CatalogRowProps {
  /** The catalog item to render. */
  item: ItemSummary;
  /** Extra Tailwind classes forwarded to the row. */
  className?: string;
}

function CatalogRow({ item, className }: CatalogRowProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-md transition-colors hover:bg-accent/50",
        className,
      )}
    >
      <Link
        to="/$"
        params={{ _splat: item.slug }}
        className="grid min-w-0 flex-1 grid-cols-1 items-baseline gap-x-8 px-3 py-2 sm:grid-cols-[minmax(0,15rem)_1fr]"
      >
        {/* The section heading already names the folder, so the prefix is redundant here. */}
        <span className="truncate font-mono text-sm font-medium">{stripSection(item.slug)}</span>
        <span className="hidden min-w-0 truncate text-sm text-muted-foreground sm:block">
          {item.title}
        </span>
      </Link>
      <ViewAsMarkdownIcon
        slug={item.slug}
        className="mr-2 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100"
      />
    </div>
  );
}
// #endregion
