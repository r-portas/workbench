import * as z from "zod";

const limit = z.int().min(1);

/**
 * Schema for the sources config, so a typo fails loudly instead of silently dropping a source.
 */
export const sourcesConfigSchema = z.object({
  hackerNews: z.object({
    topN: limit,
  }),
  github: z.object({
    repos: z.array(
      z.object({
        repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/, "Expected owner/repo"),
        limit: limit.default(1),
        // Monorepos publish a release per package, so this keeps only the listed packages' releases
        tagPrefix: z.array(z.string().min(1)).min(1).optional(),
        // Stable releases only unless set, for repos that ship mostly betas/release candidates
        includePrereleases: z.boolean().optional(),
      }),
    ),
  }),
  rss: z.object({
    feeds: z.array(
      z.object({
        url: z.url(),
        limit,
        name: z.string().min(1).optional(),
      }),
    ),
  }),
});

export type SourcesConfigInput = z.input<typeof sourcesConfigSchema>;
export type SourcesConfig = z.output<typeof sourcesConfigSchema>;
export type GithubRepoConfig = SourcesConfig["github"]["repos"][number];
export type RssFeedConfig = SourcesConfig["rss"]["feeds"][number];

/**
 * Validates the sources config.
 *
 * @param input - The raw config object.
 *
 * @remarks
 * Throws with every invalid field listed by path, e.g. `rss.feeds[0].url`.
 */
export function parseSourcesConfig(input: SourcesConfigInput): SourcesConfig {
  const result = sourcesConfigSchema.safeParse(input);
  if (!result.success) {
    throw new Error(`Invalid sources config:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
