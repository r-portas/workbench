import * as z from "zod";

/** HN's Firebase top stories endpoint: story ids in rank order. */
export const topStoriesSchema = z.array(z.number());

/** The fields used from an Algolia HN search response. */
export const algoliaSearchSchema = z.object({
  hits: z.array(
    z.object({
      objectID: z.string(),
      // Deleted stories can still be indexed without a title
      title: z.string().nullish(),
      url: z.string().nullish(),
      points: z.number().nullish(),
      num_comments: z.number().nullish(),
      created_at: z.string(),
    }),
  ),
});

export type AlgoliaHit = z.infer<typeof algoliaSearchSchema>["hits"][number];
