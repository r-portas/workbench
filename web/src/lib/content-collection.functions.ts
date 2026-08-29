import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { CONTENT } from "./content-collection.server";

/** Lists content items, optionally narrowed to a partial path such as `guides/`. */
export const listContentFn = createServerFn()
  .validator(z.object({ filter: z.string().optional() }))
  .handler(async ({ data }) => {
    return CONTENT.list(data.filter);
  });

/** Reads and parses a single content item by its full path, e.g. `guides/drizzle`. */
export const getContentFn = createServerFn()
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    return CONTENT.get(data.slug);
  });
