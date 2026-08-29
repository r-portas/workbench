import { createFileRoute } from "@tanstack/react-router";

import CatalogSection from "@/components/home/catalog-section";
import TemplatesSection from "@/components/home/templates-section";
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
  return (
    <>
      <TemplatesSection templates={templates} />
      {sections.map((section) => (
        <CatalogSection
          key={section.slug}
          label={section.label}
          items={section.items}
          className="mt-10"
        />
      ))}
    </>
  );
}
