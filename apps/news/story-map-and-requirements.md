# Personal News App: Story Map and Requirements

Oct 10, 2026 · @Roy Portas

## Overview

A personal news app that shows the latest items from each source on one live page, so there is one
place to check instead of many websites.

**Sources**

- Hacker News: top stories, with a link to the comments.
- GitHub release notes for open source projects in use (stable releases only).
- RSS feeds from other sites.

**Decisions so far**

- Single user, no accounts or auth.
- Sources live in a static, typed config file built into the app.
- The app fetches live when opened. There is no scheduled job and no stored history.
- Each section shows the latest N items for its source, with no day navigation.
- Responses are cached with Workers Cache, so repeat opens are fast.
- Items you have opened are dimmed with the browser's `:visited` link style.
- Built as a TanStack Start app on Cloudflare, with server functions as the fetch layer.
- Used on both desktop and phone, so the layout must be responsive.

## User story map

The journey runs top to bottom across six steps; each column is a release slice, with MVP first.

**Backbone**

1. Configure: edit the config file
2. Open: see the latest items from every source
3. Triage: scan and pick
4. Read: article, release notes or feed item
5. Discuss: Hacker News comments
6. Keep track: see which items you have already opened

| Step           | MVP                                                                             | Next                                               | Later                                   |
| -------------- | ------------------------------------------------------------------------------- | -------------------------------------------------- | --------------------------------------- |
| **Configure**  | Config file lists RSS URLs, GitHub repos, HN top N and an item limit per source | Optional age cutoff per source (`maxAgeDays`)      | Keyword mute and boost rules            |
| **Open**       | Latest items per source, fetched live and cached, works on phone and desktop    |                                                    | Installable as a PWA                    |
| **Triage**     | Sections by source type; title, source, relative time                           | Highlight major vs patch releases                  | Short summaries per item                |
| **Read**       | Link out to the original                                                        | Release notes shown inline                         | Reader view for teaser-only feeds       |
| **Discuss**    | HN comment count plus link to the thread                                        | Inline collapsible HN comments                     | Comment summary (main threads, dissent) |
| **Keep track** | Opened items dimmed with `:visited`                                             | "New since last visit" marker, kept in the browser | Read state synced across devices        |

## MVP user stories

Seven stories in build order; each depends only on the ones above it. The page shows the latest
items per source at the time of opening, with no day navigation.

### 1. Configure sources

**As a reader, I want to list my sources in a config file, so that I can change what I follow
without touching app code.**

- A typed config file holds RSS feed URLs, GitHub repos (`owner/repo`), HN top N, and an item limit
  for each RSS feed and GitHub repo.
- An invalid config (bad URL, malformed repo, a limit below 1) fails at build or startup with a
  message naming the field.
- Adding a source needs no code change outside the config file.

### 2. Fetch and normalise items

**As a reader, I want every source turned into one common item shape, so that the app can show them
together.**

- RSS, GitHub and HN each return items with `id`, `title`, `url`, `source`, `sourceType` and
  `publishedAt`.
- HN items come from the top stories endpoint, limited to the configured N, and also carry `points`,
  `commentCount` and `discussionUrl`.
- RSS returns the latest items per feed up to that feed's limit. GitHub returns each repo's latest
  releases up to its limit, which defaults to 1.
- GitHub items exclude pre-releases and drafts.
- Items are fetched through server functions, not from the browser.

### 3. Show the latest items

**As a reader, I want to open the app and see the latest items from every source, so that I get
everything in one place.**

- `/` shows one section per source type: HN, GitHub releases, RSS.
- RSS and GitHub items are merged within their sections and sorted newest first, each labelled with
  its source.
- HN items keep the order the endpoint returns.
- The layout works at phone and desktop widths.

### 4. Triage at a glance

**As a reader, I want a title, source and time on each item, so that I can decide quickly what to
read.**

- Each item shows its title, source name and relative publish time, such as "3h ago".
- GitHub items show the repo name and version tag.
- HN items show points and comment count.
- Each section shows an item count.

### 5. Read the original

**As a reader, I want to open an item's original page, so that I can read the full content.**

- The title links to the original URL and opens in a new tab.
- For GitHub releases, the link goes to the release page.
- Links use `rel="noopener noreferrer"`.

### 6. Jump to the HN discussion

**As a reader, I want a direct link to the HN thread, so that I can read the comments.**

- Each HN item has a separate "N comments" link to its HN thread.
- Stories with no external URL (Ask HN, Show HN text posts) link only to the thread.

### 7. See what I have already opened

**As a reader, I want items I have already opened to look different, so that I can see what is new
at a glance.**

- The item title link is styled with `:visited`, which dims opened items.
- The HN comments link is styled the same way, so reading the thread also shows as opened.
- Dimming uses colour only, because browsers restrict `:visited` styling to colour-type properties.
- State lives in the browser, so it is not shared between phone and desktop.
- Link URLs stay the same between loads, so an item stays marked after a refresh.

## Cross-cutting acceptance criteria

These apply to every story above.

- **Failed sources:** one failing source shows an inline error note in its section, and the other
  sections still render.
- **Empty state:** a source with no items shows "No items" rather than a blank gap.
- **Loading:** each section loads independently with its own loading state.
- **Caching:** repeat opens within a few minutes don't refetch from upstream sources, and a stale
  copy shows instantly while it refreshes in the background.
- **GitHub auth:** the app works unauthenticated, and uses a token from an env var when one is set.

## Decisions

All six decisions below are settled for the MVP. Reopen one here if it changes.

| Decision              | Options considered                                                                                                                    | Outcome                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Item limits           | One N for every source, or an N per source                                                                                            | N per source, with RSS and GitHub merged newest first in their sections; GitHub defaults to 1 release per repo |
| Tracking opened items | CSS :visited styling; storing read state in browser storage or on a server                                                            | :visited only; a "new since last visit" marker goes in Next                                                    |
| Hosting               | Homelab, or a serverless host. Server functions need a server runtime, so a static SPA deploy won't work                              | Cloudflare                                                                                                     |
| Cache storage         | Workers Cache, driven by Cache-Control headers (stale-while-revalidate supported); SQLite with Drizzle only if history is added later | Workers Cache                                                                                                  |
| Cache freshness       | A short max-age with stale-while-revalidate, or a longer fixed max-age                                                                | A few minutes of max-age plus about an hour of stale-while-revalidate; a cache spike is the first build task   |
| Age cutoff            | Hide items older than a set age per source, or show the latest N whatever their age                                                   | No cutoff in the MVP; add maxAgeDays only if old items get in the way                                          |

## Wireframes

_Low-fidelity layouts for the MVP. Grey bars stand in for item titles._

Screens covered:

- Latest items (desktop and mobile)
- Opened items dimmed with `:visited`
- Empty and error states

### Desktop

&#91;embedded content: desktop · latest items, 3 columns\]

The three source types sit side by side. Darker bars are unopened items and lighter bars are opened
ones.

### Mobile

&#91;embedded content: mobile · latest, opened items dimmed, empty and error states\]

Sections stack in the same order, and opened items are dimmed. A failed source shows an inline error
note while the other sections still render.

## Architecture notes

_A TanStack Start app on Cloudflare: server functions fetch each source live, Workers Cache absorbs
repeat opens, and there is no database._

Covered below:

- Route structure and server functions
- Config schema and validation
- Normalised item shape and per-source fetchers
- Tracking opened items
- Caching approach
- Hosting and deployment

### System overview

&#91;embedded content: architecture · browser, Worker, cache, 3 sources\]

The browser asks for each section through a GET server function. A cache hit returns straight from
Workers Cache; a miss runs the matching function, which fetches its source.

### Route structure and server functions

One route renders everything, and each section fetches its own data so one failure never blocks the
others.

| Route | Behaviour                                                       |
| ----- | --------------------------------------------------------------- |
| `/`   | Renders one section per source type, each loading independently |

Each section is its own component that calls one server function through TanStack Query, which gives
it independent loading and error states.

| Server function     | Returns                                                                            |
| ------------------- | ---------------------------------------------------------------------------------- |
| `getHackerNews`     | The current top N stories                                                          |
| `getGithubReleases` | The latest stable releases per configured repo, up to each repo's limit            |
| `getRssItems`       | The latest items per configured feed, up to each feed's limit, merged newest first |

None of the functions take arguments, so each has a single cache key. They use GET so Workers Cache
can serve them (see Caching approach).

File layout follows the usual conventions:

- `*.functions.ts` for server functions
- `*.server.ts` for the per-source fetchers
- `*.schemas.ts` for the config and item schemas

### Config schema and validation

One typed object in `sources.config.ts`, imported as a module, so it is bundled with the app and
needs no file access at runtime. A schema in `sources.schemas.ts` checks it at build and startup.

| Field             | Type                            | Notes                                                                                                               |
| ----------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `hackerNews.topN` | integer, 1 or more              | How many top stories to show                                                                                        |
| `github.repos`    | list of `{ repo, limit? }`      | `repo` is `owner/repo`; `limit` is how many latest releases to show, default 1; pre-releases and drafts are dropped |
| `rss.feeds`       | list of `{ url, limit, name? }` | `url` must be valid; `limit` is the latest N items for that feed; `name` overrides the feed's own title             |

A bad URL, a malformed repo string or a limit below 1 fails with a message naming the field. Adding
or removing a source touches only this file.

### Normalised item shape and per-source fetchers

Every fetcher returns the same `NewsItem`, so all three sections share one card component.

| Field                                     | Type                            | Notes                                                                                            |
| ----------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------ |
| `id`                                      | string                          | Stable per source                                                                                |
| `title`                                   | string                          |                                                                                                  |
| `url`                                     | string                          | The original page. For HN text posts it equals `discussionUrl`, and the card then shows one link |
| `source`                                  | string                          | Feed name, repo name or Hacker News                                                              |
| `sourceType`                              | `hackernews`, `github` or `rss` | Decides which section the item lands in                                                          |
| `publishedAt`                             | ISO timestamp                   | Used for sorting and for the relative time on the card                                           |
| `points`, `commentCount`, `discussionUrl` | number, number, string          | HN only                                                                                          |
| `version`                                 | string                          | GitHub only: the release tag                                                                     |

| Fetcher            | Upstream                             | Notes                                                                                                              |
| ------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `hn.server.ts`     | HN top stories endpoint              | Firebase returns ids only, so N item calls; Algolia's front-page tag returns scores and comment counts in one call |
| `github.server.ts` | `GET /repos/{owner}/{repo}/releases` | Drops items flagged `prerelease` or `draft`; keeps each repo's newest releases up to its limit                     |
| `rss.server.ts`    | Each configured feed URL             | Parses RSS and Atom; keeps each feed's newest items up to its limit                                                |

RSS items from all feeds are merged and sorted newest first by `publishedAt`, and so are GitHub
releases from all repos.

GitHub and RSS fetch their sources in parallel with `Promise.allSettled`. A function returns the
items from sources that succeeded plus the names of those that failed, so a section can show a
partial result with an inline error note.

### Tracking opened items

Opened items are marked with the browser's `:visited` style, so the app stores nothing.

- Title and comment links are real, stable URLs, so the browser records each one when it is opened.
- Only colour-type properties can be styled with `:visited`, so opened items change link colour
  rather than fading the whole card. `:has()` can't read visited state, so the parent card can't be
  styled from it.
- Recent browsers partition visited history by site, so a link generally shows as opened only if it
  was opened from this app.
- State is per browser and is lost when history is cleared. It does not sync between phone and
  desktop.

### Caching approach

[Workers Cache](https://developers.cloudflare.com/workers/cache/) is switched on in the Wrangler
config and driven entirely by the `Cache-Control` header on each response. It serves a cached
response without running the Worker, and supports `stale-while-revalidate`.

- **What is cached:** responses to the three server functions. Workers Cache stores only GET and
  HEAD requests, which is why the functions use GET.
- **Cache key:** the request URL. The functions take no arguments, so each has one key.
- **Freshness:** a `max-age` of a few minutes plus about an hour of `stale-while-revalidate`, so a
  repeat open shows the cached copy instantly while it refreshes in the background. After a long gap
  you may see slightly old content once. Exact values are tuned in use.
- **Failures:** a response that includes failed sources is sent with `no-store`, so the next open
  retries them instead of serving the failure.
- **Concurrent opens:** Workers Cache runs the Worker once for simultaneous requests to the same
  key, which also protects the GitHub rate limit.

### Hosting and deployment

The app deploys as a single Cloudflare Worker with no database and no storage bindings.

- **Runtime:** production runs on Workers, not Bun. Bun is for local tooling, and server code can't
  rely on Bun-only APIs.
- **Wrangler config:** enables Workers Cache and sets the compatibility date.
- **Secrets:** an optional `GITHUB_TOKEN` as a Worker secret, to lift the unauthenticated GitHub
  rate limit of 60 requests an hour.
- **Changing sources:** the config is bundled, so adding a feed or repo means a redeploy.

### Things to verify before building

- [ ] Cache spike first: deploy one GET server function with a `Cache-Control` header and check that
      `Cf-Cache-Status` shows a hit on the second request.
- [ ] HN source: confirm the Algolia front-page query returns points, comment count and text-post
      flags, so one call replaces N+1.
- [ ] RSS parsing: pick an XML parser that runs on Workers, which has no `DOMParser`, and handles
      both RSS and Atom.
- [ ] GitHub rate limit: Workers requests likely share outbound IPs, so the unauthenticated limit
      may bite early. Plan on setting the token from the start.
- [ ] Opened items: confirm `:visited` dimming works in your browsers, including on your phone.
