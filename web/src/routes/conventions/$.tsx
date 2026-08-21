import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import Article from "@/components/article";
import ViewAsMarkdown from "@/components/view-as-markdown";
import { getContentFn } from "@/lib/content-collection.functions";

export const Route = createFileRoute("/conventions/$")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const slug = params._splat;
    if (!slug) throw notFound();
    return {
      convention: await getContentFn({ data: { collection: "conventions", slug } }),
      slug,
    };
  },
});

function RouteComponent() {
  const { convention, slug } = Route.useLoaderData();
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <Link to="/" className="text-sm text-muted-foreground">
          &larr; Back to conventions
        </Link>
        <ViewAsMarkdown collection="conventions" slug={slug} />
      </div>
      <div className="mt-4">
        <Article>{convention}</Article>
      </div>
    </>
  );
}
