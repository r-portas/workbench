import { createServerFn } from "@tanstack/react-start";

import type { ItemSummary } from "./content-collection.server";
import { listGuidesFn } from "./guides.functions";

export const listSearchIndexFn = createServerFn().handler(async (): Promise<ItemSummary[]> => {
  // TODO: Add extra collections here
  const items = await listGuidesFn();
  return items;
});
