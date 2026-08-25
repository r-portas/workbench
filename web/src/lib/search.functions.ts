import { createServerFn } from "@tanstack/react-start";

import { listContentFn } from "./content-collection.functions";
import type { SearchItem } from "./content-collection.types";

export const listSearchIndexFn = createServerFn().handler(async (): Promise<SearchItem[]> => {
  const [guides, conventions, cheatsheets] = await Promise.all([
    listContentFn({ data: { collection: "guides" } }),
    listContentFn({ data: { collection: "conventions" } }),
    listContentFn({ data: { collection: "cheatsheets" } }),
  ]);
  return [
    ...guides.map((item): SearchItem => ({ ...item, kind: "guide" })),
    ...conventions.map((item): SearchItem => ({ ...item, kind: "convention" })),
    ...cheatsheets.map((item): SearchItem => ({ ...item, kind: "cheatsheet" })),
  ];
});
