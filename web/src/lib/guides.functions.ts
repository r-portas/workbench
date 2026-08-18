import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { ContentCollection } from "./content-collection.server";

const guidesCollection = new ContentCollection("../guides");

export const listGuidesFn = createServerFn().handler(async () => {
  return await guidesCollection.list();
});

export const getGuideFn = createServerFn()
  .validator(z.string())
  .handler(async ({ data: slug }) => {
    return guidesCollection.get(slug);
  });
