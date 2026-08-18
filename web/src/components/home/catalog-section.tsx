import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

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
  item: CatalogItem;
  /** Extra Tailwind classes forwarded to the link. */
  className?: string;
}

function CatalogRow({ item, className }: CatalogRowProps) {
  return (
    <Link
      to="/guides/$slug"
      params={{ slug: item.slug }}
      className={cn(
        "grid grid-cols-1 items-baseline gap-x-8 rounded-md px-3 py-2 transition-colors hover:bg-accent/50 sm:grid-cols-[minmax(0,15rem)_1fr]",
        className,
      )}
    >
      <span className="truncate text-sm font-medium">{item.slug}</span>
      <span className="hidden min-w-0 truncate text-sm text-muted-foreground sm:block">
        {item.title}
      </span>
    </Link>
  );
}
// #endregion
