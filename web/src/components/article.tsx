import type { MarkdownInput } from "@tanstack/markdown";
import { Markdown } from "@tanstack/markdown/react";

import { highlightMarkdownCode } from "@/lib/markdown";

export default function Article({ children }: { children: MarkdownInput }) {
  return (
    <article className="typeset">
      <Markdown highlighter={highlightMarkdownCode}>{children}</Markdown>
    </article>
  );
}
