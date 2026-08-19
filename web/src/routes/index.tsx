import { createFileRoute } from "@tanstack/react-router";

import CatalogSection from "@/components/home/catalog-section";
import TemplatesSection from "@/components/home/templates-section";
import { listConventionsFn } from "@/lib/conventions.functions";
import { listGuidesFn } from "@/lib/guides.functions";
import { listTemplatesFn } from "@/lib/templates.functions";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  loader: async () => {
    const [guides, conventions, templates] = await Promise.all([
      listGuidesFn(),
      listConventionsFn(),
      listTemplatesFn(),
    ]);
    return { guides, conventions, templates };
  },
});

function RouteComponent() {
  const { guides, conventions, templates } = Route.useLoaderData();
  return (
    <>
      <TemplatesSection templates={templates} />
      <CatalogSection label="Guides" items={guides} to="/guides/$" className="mt-10" />
      <CatalogSection
        label="Conventions"
        items={conventions}
        to="/conventions/$"
        className="mt-10"
      />
    </>
  );
}
