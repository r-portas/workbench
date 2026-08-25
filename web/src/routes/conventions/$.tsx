import { createFileRoute, notFound } from "@tanstack/react-router";

import MarkdownArticle from "@/components/markdown-article";
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
      <div className="flex justify-end">
        <ViewAsMarkdown collection="conventions" slug={slug} />
      </div>
      <div className="mt-4">
        <MarkdownArticle>{convention}</MarkdownArticle>
      </div>
    </>
  );
}
