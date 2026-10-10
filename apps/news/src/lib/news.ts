import type { NewsItem, SectionResult } from "./news.types";

/**
 * Sorts items newest first by `publishedAt`, without mutating the input.
 */
export function sortNewestFirst<T extends NewsItem>(items: T[]): T[] {
  return items.toSorted((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

/**
 * Waits for every source's fetch and combines them into one section, keeping going when some
 * sources fail.
 *
 * @param sources - Each source's name and its in-flight fetch.
 *
 * @remarks
 * Items keep their source order (HN's rank order matters), so sort afterwards if needed.
 */
export async function mergeSources<T extends NewsItem>(
  sources: { name: string; items: Promise<T[]> }[],
): Promise<SectionResult<T>> {
  const settled = await Promise.all(
    sources.map(async ({ name, items }) => {
      try {
        return { name, items: await items };
      } catch (error) {
        console.error(`${name} failed`, error);
        return { name, items: undefined };
      }
    }),
  );
  return {
    items: settled.flatMap((source) => source.items ?? []),
    failed: settled.filter((source) => !source.items).map((source) => source.name),
  };
}

/**
 * Turns a rejected section fetch (e.g. the network dropping) into a result marking it failed, so
 * the section shows its inline error note instead of throwing.
 *
 * @param name - The name shown in the error note.
 */
export async function withFallback(
  data: Promise<SectionResult>,
  name: string,
): Promise<SectionResult> {
  try {
    return await data;
  } catch (error) {
    console.error(`${name} failed`, error);
    return { items: [], failed: [name] };
  }
}

const UNITS: [unit: string, seconds: number][] = [
  ["y", 365 * 24 * 60 * 60],
  // A twelfth of a year, so 360-364 days reads "11mo", not "12mo"
  ["mo", (365 / 12) * 24 * 60 * 60],
  ["d", 24 * 60 * 60],
  ["h", 60 * 60],
  ["m", 60],
];

/**
 * Formats a timestamp as a short age, e.g. "3h ago".
 *
 * @param iso - The ISO timestamp.
 * @param now - The current time, injectable for tests.
 */
export function formatRelativeTime(iso: string, now = Date.now()): string {
  const seconds = Math.max(0, (now - Date.parse(iso)) / 1000);
  for (const [unit, size] of UNITS) {
    if (seconds >= size) return `${Math.floor(seconds / size)}${unit} ago`;
  }
  return "just now";
}

/**
 * Formats a count with its noun, pluralised, e.g. "1 point" or "12 points".
 */
export function pluralise(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
