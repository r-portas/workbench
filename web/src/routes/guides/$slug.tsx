import { createFileRoute, Link } from "@tanstack/react-router";

import Article from "@/components/article";
import { getGuideFn } from "@/lib/guides.functions";

export const Route = createFileRoute("/guides/$slug")({
  component: RouteComponent,
  loader: async ({ params }) => ({
    guide: await getGuideFn({ data: params.slug }),
  }),
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
