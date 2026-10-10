import { githubReleasesSchema, type GithubRelease } from "./github.schemas";
import { mergeSources } from "./news";
import { fetchUpstream } from "./news.server";
import type { GithubItem, SectionResult } from "./news.types";
import type { GithubRepoConfig } from "./sources.schemas";

/**
 * Keeps a repo's newest releases, up to its limit, optionally only those whose tag starts with
 * `tagPrefix`. Prereleases are skipped unless the config sets `includePrereleases`; drafts always
 * are.
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
  const matching = tagPrefix
    ? releases.filter((release) => release.tag_name.startsWith(tagPrefix))
    : releases;
  if (tagPrefix && matching.length === 0) {
    throw new Error(`${config.repo}: no release tags start with ${tagPrefix}`);
  }

  return matching
    .filter(
      (release) =>
        !release.draft &&
        (config.includePrereleases || !release.prerelease) &&
        release.published_at,
    )
    .slice(0, config.limit)
    .map((release) => ({
      id: `gh-${release.id}`,
      sourceType: "github",
      title: release.name || release.tag_name,
      url: release.html_url,
      source: config.repo,
      // Non-null: the filter above drops releases without a publish date
      publishedAt: release.published_at!,
      version: release.tag_name,
    }));
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
 * Fetches the latest releases for every configured repo, merged newest first. Stable only, unless a
 * repo sets `includePrereleases`.
 *
 * @remarks
 * Each repo is fetched once, but each tag prefix is its own source, so a prefix missing from the
 * page fails alone while the repo's other packages still show. Uses `GITHUB_TOKEN` when set, to
 * lift the unauthenticated limit of 60 requests an hour.
 */
export function getGithubReleases(repos: GithubRepoConfig[]): Promise<SectionResult<GithubItem>> {
  const sources: { name: string; items: Promise<GithubItem[]> }[] = [];
  for (const config of repos) {
    const releases = fetchReleases(config);
    for (const prefix of config.tagPrefix ?? [undefined]) {
      sources.push({
        name: prefix ? `${config.repo} (${prefix})` : config.repo,
        items: releases.then((all) => toGithubItems(config, all, prefix)),
      });
    }
  }

  return mergeSources(sources, { newestFirst: true });
}
