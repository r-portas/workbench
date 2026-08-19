import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import Article from "@/components/article";
import { getConventionFn } from "@/lib/conventions.functions";

export const Route = createFileRoute("/conventions/$")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const slug = params._splat;
    if (!slug) throw notFound();
    return {
      convention: await getConventionFn({ data: slug }),
    };
  },
});

function RouteComponent() {
  const { convention } = Route.useLoaderData();
  return (
    <>
      <Link to="/" className="text-sm text-muted-foreground">
        &larr; Back to conventions
      </Link>
      <div className="mt-4">
        <Article>{convention}</Article>
      </div>
    </>
  );
}
