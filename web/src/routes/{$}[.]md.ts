import { createFileRoute } from "@tanstack/react-router";

import { CONTENT } from "@/lib/content-collection.server";

const NOT_FOUND = () => new Response("Not found", { status: 404 });

/** Serves the raw markdown source for any content item, at its page URL plus `.md`. */
export const Route = createFileRoute("/{$}.md")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slug = params._splat;
        if (!slug) return NOT_FOUND();
        try {
          const text = await CONTENT.getRaw(slug);
          return new Response(text, {
            headers: { "Content-Type": "text/markdown; charset=utf-8" },
          });
        } catch {
          // getRaw throws for both unsafe slugs and missing files; neither is a real error here.
          return NOT_FOUND();
        }
      },
    },
  },
});
