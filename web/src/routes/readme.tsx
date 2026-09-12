import { readFile } from "fs/promises";

import { parseMarkdown } from "@tanstack/markdown";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import MarkdownArticle from "@/components/markdown-article";

/** Reads and parses the repo root README.md. */
const getReadmeFn = createServerFn().handler(async () => {
  const text = await readFile("../README.md", "utf-8");
  return parseMarkdown(text);
});

export const Route = createFileRoute("/readme")({
  component: RouteComponent,
  loader: async () => {
    return { item: await getReadmeFn() };
  },
});

function RouteComponent() {
  const { item } = Route.useLoaderData();
  return <MarkdownArticle>{item}</MarkdownArticle>;
}
