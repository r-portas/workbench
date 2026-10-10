import * as z from "zod";

// These describe fast-xml-parser's output (attributes as `@_name`, text beside attributes as
// `#text`), not raw XML. Odd or missing fields `.catch` to undefined rather than failing the whole
// feed; an entry missing something essential is dropped later.

const elementText = z
  .union([z.string(), z.object({ "#text": z.string() })])
  .transform((value) => (typeof value === "string" ? value : value["#text"]));

const optionalText = elementText.optional().catch(undefined);

const title = z
  .union([
    z.string().transform((text) => ({ text, isHtml: false })),
    // Atom titles can carry a type, and `type="html"` means the text is markup
    z
      .object({ "#text": z.string(), "@_type": z.string().optional() })
      .transform((value) => ({ text: value["#text"], isHtml: value["@_type"] === "html" })),
  ])
  .optional()
  .catch(undefined);

const rssItem = z
  .object({
    title,
    link: z.array(elementText).optional().catch(undefined),
    guid: optionalText,
    pubDate: optionalText,
    "dc:date": optionalText,
  })
  .transform((item) => ({
    title: item.title,
    link: item.link?.[0],
    id: item.guid,
    date: item.pubDate ?? item["dc:date"],
  }));

const atomEntry = z
  .object({
    title,
    link: z
      .array(z.object({ "@_href": z.string(), "@_rel": z.string().optional() }))
      .optional()
      .catch(undefined),
    id: optionalText,
    published: optionalText,
    updated: optionalText,
  })
  .transform((entry) => {
    // The article is the link with no rel or rel="alternate"; others are comments, enclosures etc.
    const link = entry.link?.find((l) => !l["@_rel"] || l["@_rel"] === "alternate");
    return {
      title: entry.title,
      link: (link ?? entry.link?.[0])?.["@_href"],
      id: entry.id,
      date: entry.published ?? entry.updated,
    };
  });

/**
 * A parsed RSS 2.0 or Atom document, normalised to the feed title and one entry shape for both.
 */
export const feedSchema = z.union([
  z
    .object({
      rss: z.object({
        channel: z.object({ title, item: z.array(rssItem).default([]) }),
      }),
    })
    .transform(({ rss }) => ({ title: rss.channel.title?.text, entries: rss.channel.item })),
  z
    .object({
      feed: z.object({ title, entry: z.array(atomEntry).default([]) }),
    })
    .transform(({ feed }) => ({ title: feed.title?.text, entries: feed.entry })),
]);

export type FeedEntry = z.output<typeof feedSchema>["entries"][number];
