import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, FileText } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listGuidesFn } from "@/lib/guides.functions";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  loader: async () => ({
    guides: await listGuidesFn(),
  }),
});

function RouteComponent() {
  const { guides } = Route.useLoaderData();
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Guides</CardTitle>
        <CardDescription>Setup and reference docs for this workspace.</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-4">
        <ul className="divide-y divide-border">
          {guides.map((guide) => (
            <li key={guide.slug}>
              <Link
                to="/guides/$slug"
                params={{ slug: guide.slug }}
                className="group flex items-center gap-3 px-6 py-3 transition-colors hover:bg-accent/50"
              >
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 text-sm font-medium">{guide.title}</span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:translate-x-0.5 group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
