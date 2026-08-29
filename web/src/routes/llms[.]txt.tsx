import { createFileRoute } from "@tanstack/react-router";

import { groupIntoSections } from "@/lib/content-collection";
import { CONTENT } from "@/lib/content-collection.server";

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        const sections = groupIntoSections(await CONTENT.list());
        const catalog = sections
          .map(
            (section) =>
              `## ${section.label}\n${section.items
                .map((item) => `- [${item.slug}](/${item.slug}.md): ${item.title}`)
                .join("\n")}`,
          )
          .join("\n\n");

        const content = `
# Workbench
> Personal engineering workspace: notes, conventions, project templates, setup guides, and cheatsheets.

Guides are zero-to-working setup instructions. Conventions are decisions and rules. Cheatsheets are command/reference lookups.
Every HTML page has a markdown version at the same path with \`.md\` appended.    

${catalog}
        `;

        return new Response(content, {
          headers: {
            "Content-Type": "text/plain",
          },
        });
      },
    },
  },
});
