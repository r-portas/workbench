import { RelativeTime } from "@/components/relative-time";
import { pluralise } from "@/lib/news";
import type { NewsItem } from "@/lib/news.types";

// Browsers only allow colour changes on :visited, so opened items dim their link text, not the row
const LINK = "text-foreground visited:text-muted-foreground hover:underline";

/**
 * One item row: the title links out, with source, age and any per-source details underneath.
 *
 * @param now - The current time, from `useNow`.
 */
function NewsItemRow({ item, now }: { item: NewsItem; now: number }) {
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
        {item.sourceType === "hackernews" ? (
          <span>{pluralise(item.points, "point")}</span>
        ) : (
          <span>
            {item.source}
            {/* Monorepo releases are often titled with the tag itself, so don't repeat it */}
            {item.sourceType === "github" && item.version !== item.title && (
              <>
                {" · "}
                <code className="font-mono">{item.version}</code>
              </>
            )}
          </span>
        )}
        <RelativeTime iso={item.publishedAt} now={now} />
        {item.sourceType === "hackernews" && (
          <a
            href={item.discussionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="visited:text-muted-foreground/60 hover:underline"
          >
            {pluralise(item.commentCount, "comment")}
          </a>
        )}
      </div>
    </li>
  );
}

export { NewsItemRow };
