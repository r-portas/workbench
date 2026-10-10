import * as z from "zod";

/** The fields used from GitHub's list releases endpoint. */
export const githubReleasesSchema = z.array(
  z.object({
    id: z.number(),
    tag_name: z.string(),
    name: z.string().nullish(),
    html_url: z.string(),
    // Drafts have no publish date
    published_at: z.string().nullish(),
    draft: z.boolean(),
    prerelease: z.boolean(),
  }),
);

export type GithubRelease = z.infer<typeof githubReleasesSchema>[number];
