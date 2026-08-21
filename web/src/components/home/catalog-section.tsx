import { Link } from "@tanstack/react-router";

import { ViewAsMarkdownIcon } from "@/components/view-as-markdown";
import type { ContentCollectionName } from "@/lib/content-collection.types";
import { cn } from "@/lib/utils";

type CatalogTo = "/guides/$" | "/conventions/$";

const COLLECTION_BY_TO: Record<CatalogTo, ContentCollectionName> = {
  "/guides/$": "guides",
  "/conventions/$": "conventions",
};

// #region CatalogSection
interface CatalogItem {
  /** Filename slug, shown as the row title. */
  slug: string;
  /** Markdown H1, shown as the row description. */
  title: string;
}

interface CatalogSectionProps {
  /** Section heading, rendered in uppercase. */
  label: string;
  /** Items listed under the heading. */
  items: CatalogItem[];
  /** Splat route the row links to. */
  to: CatalogTo;
  /** Extra Tailwind classes forwarded to the root element. */
  className?: string;
}

/**
 * A labeled catalog list of content items with a hairline rule and count.
 */
export default function CatalogSection({ label, items, to, className }: CatalogSectionProps) {
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
            <CatalogRow item={item} to={to} />
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
  item: CatalogItem;
  /** Splat route the row links to. */
  to: CatalogTo;
  /** Extra Tailwind classes forwarded to the row. */
  className?: string;
}

function CatalogRow({ item, to, className }: CatalogRowProps) {
  const collection = COLLECTION_BY_TO[to];

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-md transition-colors hover:bg-accent/50",
        className,
      )}
    >
      <Link
        to={to}
        params={{ _splat: item.slug }}
        className="grid min-w-0 flex-1 grid-cols-1 items-baseline gap-x-8 px-3 py-2 sm:grid-cols-[minmax(0,15rem)_1fr]"
      >
        <span className="truncate font-mono text-sm font-medium">{item.slug}</span>
        <span className="hidden min-w-0 truncate text-sm text-muted-foreground sm:block">
          {item.title}
        </span>
      </Link>
      <ViewAsMarkdownIcon
        collection={collection}
        slug={item.slug}
        className="mr-2 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100"
      />
    </div>
  );
}
// #endregion
