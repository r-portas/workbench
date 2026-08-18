import { createFileRoute } from "@tanstack/react-router";

import CatalogSection from "@/components/home/catalog-section";
import { listGuidesFn } from "@/lib/guides.functions";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  loader: async () => ({
    guides: await listGuidesFn(),
  }),
});

function RouteComponent() {
  const { guides } = Route.useLoaderData();
  return <CatalogSection label="Guides" items={guides} />;
}
