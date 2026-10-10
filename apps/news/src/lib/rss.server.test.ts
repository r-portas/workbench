import { afterAll, beforeAll, describe, expect, setSystemTime, test } from "bun:test";

import { decodeEntities, parseFeed } from "./rss.server";

const RSS = `<?xml version="1.0"?>
<rss version="2.0"><channel><title>Example</title>
  <item><title>Older</title><link>https://example.com/1</link><guid>g1</guid>
    <pubDate>Fri, 9 Oct 2026 06:52:00 +1000</pubDate></item>
  <item><title><![CDATA[Newer & better]]></title><link>https://example.com/2</link>
    <guid isPermaLink="true">https://example.com/2</guid><pubDate>Fri, 9 Oct 2026 11:21:00 +1000</pubDate></item>
  <item><title>No date</title><link>https://example.com/3</link></item>
</channel></rss>`;

const ATOM = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom"><title type="text">Atom blog</title>
  <entry><title>Post</title><id>urn:1</id>
    <link rel="replies" href="https://example.com/post#comments"/>
    <link rel="alternate" href="https://example.com/post"/>
    <published>2026-10-08T00:00:00Z</published></entry>
</feed>`;

describe("parseFeed", () => {
  // The age cutoff is relative to now, so pin the clock next to the fixtures' dates
  beforeAll(() => setSystemTime(new Date("2026-10-10T00:00:00Z")));
  afterAll(() => setSystemTime());

  test("drops items older than 5 days, before applying the limit", () => {
    const xml = `<rss><channel><title>T</title>
      <item><title>Fresh</title><link>https://a/1</link><pubDate>Sat, 10 Oct 2026 00:00:00 GMT</pubDate></item>
      <item><title>Recent</title><link>https://a/2</link><pubDate>Mon, 5 Oct 2026 12:00:00 GMT</pubDate></item>
      <item><title>Stale</title><link>https://a/3</link><pubDate>Sat, 3 Oct 2026 00:00:00 GMT</pubDate></item>
    </channel></rss>`;
    const items = parseFeed(xml, { url: "https://a/rss", limit: 5 });
    expect(items.map((i) => i.title)).toEqual(["Fresh", "Recent"]);
  });

  test("parses RSS newest first, dropping undated items", () => {
    const items = parseFeed(RSS, { url: "https://example.com/rss", limit: 5 });
    expect(items.map((i) => i.title)).toEqual(["Newer & better", "Older"]);
    expect(items[0]).toMatchObject({
      id: "rss-https://example.com/rss-https://example.com/2",
      url: "https://example.com/2",
      source: "Example",
      publishedAt: "2026-10-09T01:21:00.000Z",
    });
  });

  test("applies the limit and the name override", () => {
    const items = parseFeed(RSS, { url: "https://example.com/rss", limit: 1, name: "Mine" });
    expect(items).toHaveLength(1);
    expect(items[0]?.source).toBe("Mine");
  });

  test("parses Atom, picking the alternate link", () => {
    const [item] = parseFeed(ATOM, { url: "https://example.com/atom", limit: 5 });
    expect(item).toMatchObject({
      id: "rss-https://example.com/atom-urn:1",
      title: "Post",
      url: "https://example.com/post",
      source: "Atom blog",
    });
  });

  test("keeps number-like text as written", () => {
    const xml = `<rss><channel><title>T</title><item><title>007</title><link>https://a/1</link>
      <guid>0x1F</guid><pubDate>Fri, 9 Oct 2026 06:52:00 GMT</pubDate></item></channel></rss>`;
    const [item] = parseFeed(xml, { url: "https://a/rss", limit: 1 });
    expect(item).toMatchObject({ title: "007", id: "rss-https://a/rss-0x1F" });
  });

  test("decodes numeric character references in titles", () => {
    const xml = `<rss><channel><title>T</title><item><title>Apple&#8217;s chip &amp;#8211; review</title>
      <link>https://a/1</link><pubDate>Fri, 9 Oct 2026 06:52:00 GMT</pubDate></item></channel></rss>`;
    expect(parseFeed(xml, { url: "https://a/rss", limit: 1 })[0]?.title).toBe(
      "Apple\u2019s chip \u2013 review",
    );
  });

  test("resolves relative Atom links against the feed URL", () => {
    const xml = `<feed xmlns="http://www.w3.org/2005/Atom"><title>A</title><entry><title>P</title>
      <link href="/posts/foo"/><published>2026-10-08T00:00:00Z</published></entry></feed>`;
    expect(parseFeed(xml, { url: "https://blog.example/feed.xml", limit: 1 })[0]?.url).toBe(
      "https://blog.example/posts/foo",
    );
  });

  test("decodes double-encoded named entities", () => {
    const xml = `<rss><channel><title>T</title><item><title>A &amp;amp; B</title>
      <link>https://a/1</link><pubDate>Fri, 9 Oct 2026 06:52:00 GMT</pubDate></item></channel></rss>`;
    expect(parseFeed(xml, { url: "https://a/rss", limit: 1 })[0]?.title).toBe("A & B");
  });

  test("drops links that aren't http(s)", () => {
    const xml = `<rss><channel><title>T</title>
      <item><title>JS</title><link>javascript:alert(1)</link><pubDate>Fri, 9 Oct 2026 06:52:00 GMT</pubDate></item>
      <item><title>Data</title><link>data:text/html,hi</link><pubDate>Fri, 9 Oct 2026 06:52:00 GMT</pubDate></item>
      <item><title>OK</title><link>https://a/1</link><pubDate>Fri, 9 Oct 2026 06:52:00 GMT</pubDate></item>
    </channel></rss>`;
    expect(parseFeed(xml, { url: "https://a/rss", limit: 5 }).map((i) => i.title)).toEqual(["OK"]);
  });

  test("keeps one copy of a repeated item", () => {
    const item = `<item><title>Same</title><link>https://a/1</link><pubDate>Fri, 9 Oct 2026 06:52:00 GMT</pubDate></item>`;
    const xml = `<rss><channel><title>T</title>${item}${item}</channel></rss>`;
    expect(parseFeed(xml, { url: "https://a/rss", limit: 5 })).toHaveLength(1);
  });

  test("strips tags from Atom HTML titles", () => {
    const xml = `<feed xmlns="http://www.w3.org/2005/Atom"><title>A</title><entry>
      <title type="html">&lt;b&gt;Bold&lt;/b&gt; move</title><link href="https://a/1"/>
      <published>2026-10-08T00:00:00Z</published></entry></feed>`;
    expect(parseFeed(xml, { url: "https://a/atom", limit: 1 })[0]?.title).toBe("Bold move");
  });

  test("treats an oddly shaped field as missing instead of failing the feed", () => {
    // An empty <guid> with an attribute parses to an object with no text
    const xml = `<rss><channel><title>T</title><item><title>Post</title><link>https://a/1</link>
      <guid isPermaLink="false"/><pubDate>Fri, 9 Oct 2026 06:52:00 GMT</pubDate></item></channel></rss>`;
    const [item] = parseFeed(xml, { url: "https://a/rss", limit: 1 });
    expect(item?.id).toBe("rss-https://a/rss-https://a/1");
  });

  test("rejects a document that isn't a feed", () => {
    expect(() => parseFeed("<html></html>", { url: "https://example.com", limit: 1 })).toThrow(
      "not an RSS or Atom feed",
    );
  });
});

describe("decodeEntities", () => {
  test.each([
    ["Apple&#8217;s", "Apple\u2019s"],
    ["en&#x2013;dash", "en\u2013dash"],
    ["&#X2014;", "\u2014"],
    ["no entities", "no entities"],
    ["&#99999999;", "&#99999999;"],
    ["A &amp; B &quot;C&quot; &lt;D&gt; &apos;E&apos;", "A & B \"C\" <D> 'E'"],
    ["&nbsp;", "&nbsp;"],
  ])("%p -> %p", (input, expected) => {
    expect(decodeEntities(input)).toBe(expected);
  });
});
