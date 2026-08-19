import { createFileRoute } from "@tanstack/react-router";

import CatalogSection from "@/components/home/catalog-section";
import { listConventionsFn } from "@/lib/conventions.functions";
import { listGuidesFn } from "@/lib/guides.functions";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  loader: async () => {
    const [guides, conventions] = await Promise.all([listGuidesFn(), listConventionsFn()]);
    return { guides, conventions };
  },
});

function RouteComponent() {
  const { guides, conventions } = Route.useLoaderData();
  return (
    <>
      <CatalogSection label="Guides" items={guides} to="/guides/$" />
      <CatalogSection
        label="Conventions"
        items={conventions}
        to="/conventions/$"
        className="mt-10"
      />
    </>
  );
}
