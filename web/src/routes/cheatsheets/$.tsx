import { createFileRoute, notFound } from "@tanstack/react-router";

import MarkdownArticle from "@/components/markdown-article";
import ViewAsMarkdown from "@/components/view-as-markdown";
import { getContentFn } from "@/lib/content-collection.functions";

export const Route = createFileRoute("/cheatsheets/$")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const slug = params._splat;
    if (!slug) throw notFound();
    return {
      cheatsheet: await getContentFn({ data: { collection: "cheatsheets", slug } }),
      slug,
    };
  },
});

function RouteComponent() {
  const { cheatsheet, slug } = Route.useLoaderData();
  return (
    <>
      <div className="flex justify-end">
        <ViewAsMarkdown collection="cheatsheets" slug={slug} />
      </div>
      <div className="mt-4">
        <MarkdownArticle>{cheatsheet}</MarkdownArticle>
      </div>
    </>
  );
}
