import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { listMarkdownEntries, parseMarkdownFile } from "./markdown.server";

export const listGuidesFn = createServerFn().handler(async () => {
  return await listMarkdownEntries("../guides");
});

export const getGuideFn = createServerFn()
  .validator(z.string())
  .handler(async ({ data: slug }) => {
    return parseMarkdownFile(`../guides/${slug}.md`);
  });
