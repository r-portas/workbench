import { createFileRoute } from "@tanstack/react-router";

import { rawMarkdownResponse } from "@/lib/content-collection.server";

export const Route = createFileRoute("/guides/{$}.md")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slug = params._splat;
        if (!slug) {
          return new Response("Not found", { status: 404 });
        }
        return rawMarkdownResponse("guides", slug);
      },
    },
  },
});
