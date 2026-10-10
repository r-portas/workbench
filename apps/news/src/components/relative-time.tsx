import { formatRelativeTime } from "@/lib/news";

/**
 * A short age like "3h ago", with the full date on hover.
 *
 * @param now - The current time, from `useNow` so it keeps counting up.
 */
function RelativeTime({ iso, now }: { iso: string; now: number }) {
  return (
    <time dateTime={iso} title={new Date(iso).toLocaleString()}>
      {formatRelativeTime(iso, now)}
    </time>
  );
}

export { RelativeTime };
