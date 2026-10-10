# news

A personal news page: the latest Hacker News top stories, GitHub releases and RSS items on one page,
fetched live and cached on Vercel's CDN.

## Sources

Edit [`src/lib/sources.config.ts`](src/lib/sources.config.ts) to change what's shown. It's validated
on load, and a change needs a redeploy.

## Environment

| Variable       | Required | Purpose                                                     |
| -------------- | -------- | ----------------------------------------------------------- |
| `GITHUB_TOKEN` | No       | Lifts GitHub's unauthenticated limit of 60 requests an hour |

## Quick Start

```sh
# Install dependencies
bun install

# Start the dev server, available on http://localhost:3000
bun dev

# Format code with oxfmt
bun fmt

# Interactively update dependencies to their latest versions
bun run update
```

## Tech Stack

- TanStack Router + Start
- Tailwind CSS and shadcn/ui components
- Bun as package manager
- oxlint for linting
- oxfmt for formatting
