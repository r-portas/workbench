import { readFile } from "fs/promises";

import { parseMarkdown } from "@tanstack/markdown";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import MarkdownArticle from "@/components/markdown-article";

/** Reads and parses the repo root CHANGELOG.md. */
const getChangelogFn = createServerFn().handler(async () => {
  const text = await readFile("../../CHANGELOG.md", "utf-8");
  return parseMarkdown(text);
});

export const Route = createFileRoute("/changelog")({
  component: RouteComponent,
  loader: async () => {
    return { content: await getChangelogFn() };
  },
});

function RouteComponent() {
  const { content } = Route.useLoaderData();
  return <MarkdownArticle>{content}</MarkdownArticle>;
}
