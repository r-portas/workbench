import { createServerFn } from "@tanstack/react-start";

import type { SearchItem } from "./content-collection.types";
import { listConventionsFn } from "./conventions.functions";
import { listGuidesFn } from "./guides.functions";

export const listSearchIndexFn = createServerFn().handler(async (): Promise<SearchItem[]> => {
  const [guides, conventions] = await Promise.all([listGuidesFn(), listConventionsFn()]);
  return [
    ...guides.map((item): SearchItem => ({ ...item, kind: "guide" })),
    ...conventions.map((item): SearchItem => ({ ...item, kind: "convention" })),
  ];
});
