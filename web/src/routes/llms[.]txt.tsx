import { createFileRoute } from "@tanstack/react-router";

import { CONTENT_COLLECTIONS } from "@/lib/content-collection.server";

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        const guides = await CONTENT_COLLECTIONS.guides.list();
        const conventions = await CONTENT_COLLECTIONS.conventions.list();
        const cheatsheets = await CONTENT_COLLECTIONS.cheatsheets.list();
        const content = `
# Workbench
> Personal engineering workspace: notes, conventions, project templates, setup guides, and cheatsheets.

Guides are zero-to-working setup instructions. Conventions are decisions and rules. Cheatsheets are command/reference lookups.
Every HTML page has a markdown version at the same path with \`.md\` appended.    

## Guides
${guides.map((guide) => `- [${guide.slug}](/guides/${guide.slug}.md): ${guide.title}`).join("\n")}

## Conventions
${conventions.map((convention) => `- [${convention.slug}](/conventions/${convention.slug}.md): ${convention.title}`).join("\n")}

## Cheatsheets
${cheatsheets.map((cheatsheet) => `- [${cheatsheet.slug}](/cheatsheets/${cheatsheet.slug}.md): ${cheatsheet.title}`).join("\n")}
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
