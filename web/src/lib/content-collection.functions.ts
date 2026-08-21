import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { CONTENT_COLLECTIONS } from "./content-collection.server";

const collectionNameSchema = z.enum(["guides", "conventions"]);

export const listContentFn = createServerFn()
  .validator(z.object({ collection: collectionNameSchema }))
  .handler(async ({ data }) => {
    return CONTENT_COLLECTIONS[data.collection].list();
  });

export const getContentFn = createServerFn()
  .validator(z.object({ collection: collectionNameSchema, slug: z.string() }))
  .handler(async ({ data }) => {
    return CONTENT_COLLECTIONS[data.collection].get(data.slug);
  });
