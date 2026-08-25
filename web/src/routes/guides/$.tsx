import { createFileRoute, notFound } from "@tanstack/react-router";

import MarkdownArticle from "@/components/markdown-article";
import ViewAsMarkdown from "@/components/view-as-markdown";
import { getContentFn } from "@/lib/content-collection.functions";

export const Route = createFileRoute("/guides/$")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const slug = params._splat;
    if (!slug) throw notFound();
    return {
      guide: await getContentFn({ data: { collection: "guides", slug } }),
      slug,
    };
  },
});

function RouteComponent() {
  const { guide, slug } = Route.useLoaderData();
  return (
    <>
      <div className="flex justify-end">
        <ViewAsMarkdown collection="guides" slug={slug} />
      </div>
      <div className="mt-4">
        <MarkdownArticle>{guide}</MarkdownArticle>
      </div>
    </>
  );
}
