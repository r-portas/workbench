import { formatRelativeTime, pluralise } from "@/lib/news";
import type { NewsItem } from "@/lib/news.types";

// Browsers only allow colour changes on :visited, so opened items dim their link text, not the row
const LINK = "text-foreground visited:text-muted-foreground hover:underline";

/**
 * One item row: the title links out, with source, age and any per-source details underneath.
 */
function NewsItemRow({ item }: { item: NewsItem }) {
  const isTextPost = item.sourceType === "hackernews" && item.url === item.discussionUrl;

  return (
    <li className="flex flex-col gap-1 py-2.5">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${LINK} leading-snug font-medium`}
      >
        {item.title}
      </a>
      <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
        {item.sourceType === "github" ? (
          <span>
            {item.source}
            {/* Monorepo releases are often titled with the tag itself, so don't repeat it */}
            {item.version !== item.title && (
              <>
                {" · "}
                <code className="font-mono">{item.version}</code>
              </>
            )}
          </span>
        ) : (
          item.sourceType === "rss" && <span>{item.source}</span>
        )}
        {item.sourceType === "hackernews" && <span>{pluralise(item.points, "point")}</span>}
        <time dateTime={item.publishedAt}>{formatRelativeTime(item.publishedAt)}</time>
        {item.sourceType === "hackernews" && !isTextPost && (
          <a
            href={item.discussionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="visited:text-muted-foreground/60 hover:underline"
          >
            {pluralise(item.commentCount, "comment")}
          </a>
        )}
        {isTextPost && <span>{pluralise(item.commentCount, "comment")}</span>}
      </div>
    </li>
  );
}

export { NewsItemRow };
