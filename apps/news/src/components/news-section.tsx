import { Await } from "@tanstack/react-router";
import { AlertTriangleIcon } from "lucide-react";
import { Suspense, type ReactNode } from "react";

import { NewsItemRow } from "@/components/news-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription } from "@/components/ui/empty";
import type { SectionResult } from "@/lib/news.types";

interface NewsSectionProps {
  title: string;
  /** The section's unawaited fetch from the route loader. */
  data: Promise<SectionResult>;
}

/**
 * One source type's items. Each section suspends on its own, so a slow source never blocks the
 * others.
 *
 * @remarks
 * `data` must never reject; failures come back in `failed` (see `withFallback`).
 */
function NewsSection({ title, data }: NewsSectionProps) {
  return (
    <Suspense fallback={<NewsSectionSkeleton title={title} />}>
      <Await promise={data}>
        {(result) => (
          <SectionCard title={title} count={result.items.length}>
            {result.failed.length > 0 && (
              <ErrorNote>Couldn't load {result.failed.join(", ")}.</ErrorNote>
            )}
            {result.items.length > 0 ? (
              <ul className="divide-y divide-border">
                {result.items.map((item) => (
                  <NewsItemRow key={item.id} item={item} />
                ))}
              </ul>
            ) : (
              result.failed.length === 0 && (
                <Empty className="p-4">
                  <EmptyDescription>No items</EmptyDescription>
                </Empty>
              )
            )}
          </SectionCard>
        )}
      </Await>
    </Suspense>
  );
}

/**
 * A section's loading state, also used as the route's server-rendered first paint.
 */
function NewsSectionSkeleton({ title }: { title: string }) {
  return (
    <SectionCard title={title} busy>
      <ul className="divide-y divide-border">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="flex animate-pulse flex-col gap-2 py-3">
            <div className="h-3.5 w-4/5 rounded bg-muted" />
            <div className="h-2.5 w-1/3 rounded bg-muted" />
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

function SectionCard({
  title,
  count,
  busy,
  children,
}: {
  title: string;
  count?: number;
  busy?: boolean;
  children: ReactNode;
}) {
  return (
    <Card size="sm" className="min-w-0" aria-busy={busy}>
      <CardHeader className="flex items-baseline justify-between">
        <CardTitle>{title}</CardTitle>
        {count !== undefined && <span className="text-xs text-muted-foreground">{count}</span>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p className="my-2 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
      <AlertTriangleIcon className="size-3.5 shrink-0" />
      {children}
    </p>
  );
}

export { NewsSection, NewsSectionSkeleton };
