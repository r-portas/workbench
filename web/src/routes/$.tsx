import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";

import MarkdownArticle from "@/components/markdown-article";
import { ButtonLink } from "@/components/ui/button-link";
import ViewAsMarkdown from "@/components/view-as-markdown";
import { getContentFn } from "@/lib/content-collection.functions";

export const Route = createFileRoute("/$")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const slug = params._splat;
    if (!slug) throw notFound();
    try {
      return { item: await getContentFn({ data: { slug } }), slug };
    } catch {
      // Any unmatched path lands here, so a missing file is a 404 rather than an error page.
      throw notFound();
    }
  },
});

function RouteComponent() {
  const { item, slug } = Route.useLoaderData();
  return (
    <>
      <div className="flex items-center justify-between">
        <ButtonLink to="/" variant="ghost" size="sm">
          <ArrowLeftIcon data-icon="inline-start" />
          Back
        </ButtonLink>
        <ViewAsMarkdown slug={slug} />
      </div>
      <div className="mt-4">
        <MarkdownArticle>{item}</MarkdownArticle>
      </div>
    </>
  );
}
