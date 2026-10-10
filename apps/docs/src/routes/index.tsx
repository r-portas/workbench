import { createFileRoute } from "@tanstack/react-router";

import HomeSearch from "@/components/home/home-search";
import { groupIntoSections } from "@/lib/content-collection";
import { listContentFn } from "@/lib/content-collection.functions";
import { listTemplatesFn } from "@/lib/templates.functions";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  loader: async () => {
    const [content, templates] = await Promise.all([
      listContentFn({ data: {} }),
      listTemplatesFn(),
    ]);
    return { sections: groupIntoSections(content), templates };
  },
});

function RouteComponent() {
  const { sections, templates } = Route.useLoaderData();
  return <HomeSearch sections={sections} templates={templates} />;
}
