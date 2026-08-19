import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { ContentCollection } from "./content-collection.server";

const conventionsCollection = new ContentCollection("../conventions");

export const listConventionsFn = createServerFn().handler(async () => {
  return await conventionsCollection.list();
});

export const getConventionFn = createServerFn()
  .validator(z.string())
  .handler(async ({ data: slug }) => {
    return conventionsCollection.get(slug);
  });
