import { githubReleasesSchema, type GithubRelease } from "./github.schemas";
import { mergeSources, sortNewestFirst } from "./news";
import { fetchUpstream } from "./news.server";
import type { GithubItem, SectionResult } from "./news.types";
import type { GithubRepoConfig } from "./sources.schemas";

/**
 * Keeps a repo's newest stable releases, up to its limit, optionally only those whose tag starts
 * with `tagPrefix`.
 *
 * @remarks
 * Assumes `releases` is newest first, as GitHub returns them. Throws when the prefix matches no
 * tag, so a typo or a prefix pushed off the page shows as a failed source, not an empty one.
 */
export function toGithubItems(
  config: GithubRepoConfig,
  releases: GithubRelease[],
  tagPrefix?: string,
): GithubItem[] {
  if (tagPrefix && !releases.some((release) => release.tag_name.startsWith(tagPrefix))) {
    throw new Error(`${config.repo}: no release tags start with ${tagPrefix}`);
  }

  return releases
    .flatMap((release): GithubItem[] => {
      if (release.draft || release.prerelease || !release.published_at) return [];
      if (tagPrefix && !release.tag_name.startsWith(tagPrefix)) return [];
      return [
        {
          id: `gh-${release.id}`,
          sourceType: "github",
          title: release.name || release.tag_name,
          url: release.html_url,
          source: config.repo,
          publishedAt: release.published_at,
          version: release.tag_name,
        },
      ];
    })
    .slice(0, config.limit);
}

async function fetchReleases(config: GithubRepoConfig): Promise<GithubRelease[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    // GitHub rejects requests without a User-Agent
    "User-Agent": "workbench-news",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  // A full page when filtering by tag prefix, since a busy monorepo interleaves many packages.
  // Otherwise a little headroom over the limit, to skip past prereleases and drafts.
  const perPage = config.tagPrefix ? 100 : Math.min(100, config.limit + 10);
  const url = `https://api.github.com/repos/${config.repo}/releases?per_page=${perPage}`;
  const res = await fetchUpstream(url, { headers });
  return githubReleasesSchema.parse(await res.json());
}

/**
 * Fetches the latest stable releases for every configured repo, merged newest first.
 *
 * @remarks
 * Each repo is fetched once, but each tag prefix is its own source, so a prefix missing from the
 * page fails alone while the repo's other packages still show. Uses `GITHUB_TOKEN` when set, to
 * lift the unauthenticated limit of 60 requests an hour.
 */
export async function getGithubReleases(
  repos: GithubRepoConfig[],
): Promise<SectionResult<GithubItem>> {
  const sources = repos.flatMap((config) => {
    const releases = fetchReleases(config);
    const pick = async (tagPrefix?: string) => toGithubItems(config, await releases, tagPrefix);
    if (!config.tagPrefix) return [{ name: config.repo, items: pick() }];
    return config.tagPrefix.map((prefix) => ({
      name: `${config.repo} (${prefix})`,
      items: pick(prefix),
    }));
  });

  const result = await mergeSources(sources);
  return { ...result, items: sortNewestFirst(result.items) };
}
