import type { MarkdownInput } from "@tanstack/markdown";
import { Markdown, type MarkdownComponents } from "@tanstack/markdown/react";
import { Link } from "@tanstack/react-router";

import { highlightMarkdownCode } from "@/lib/markdown";

const components: MarkdownComponents = {
  a: ({ children, href, ...props }) =>
    href?.startsWith("/") ? (
      <Link to={href}>{children}</Link>
    ) : (
      <a href={href} {...props}>
        {children}
      </a>
    ),
};

export default function MarkdownArticle({ children }: { children: MarkdownInput }) {
  return (
    <article className="typeset">
      <Markdown components={components} highlighter={highlightMarkdownCode}>
        {children}
      </Markdown>
    </article>
  );
}
