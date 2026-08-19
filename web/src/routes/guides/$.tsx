import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import Article from "@/components/article";
import { getGuideFn } from "@/lib/guides.functions";

export const Route = createFileRoute("/guides/$")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const slug = params._splat;
    if (!slug) throw notFound();
    return {
      guide: await getGuideFn({ data: slug }),
    };
  },
});

function RouteComponent() {
  const { guide } = Route.useLoaderData();
  return (
    <>
      <Link to="/" className="text-sm text-muted-foreground">
        &larr; Back to guides
      </Link>
      <div className="mt-4">
        <Article>{guide}</Article>
      </div>
    </>
  );
}
