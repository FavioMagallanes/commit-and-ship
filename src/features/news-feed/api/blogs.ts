import { XMLParser, XMLValidator } from "fast-xml-parser";
import { z } from "zod";

import type { NewsStory } from "@/features/news-feed/model/news-story";

export type BlogFeed = {
  /** Short slug used in story ids, for example "nodejs". */
  key: string;
  name: string;
  url: string;
  /** Topic hints for `classifyTags`, since blog posts carry no tags of their own. */
  tags: string[];
};

export const BLOG_FEEDS: readonly BlogFeed[] = [
  { key: "nodejs", name: "Node.js", url: "https://nodejs.org/en/feed/blog.xml", tags: ["node"] },
  { key: "react", name: "React", url: "https://react.dev/rss.xml", tags: ["react"] },
  { key: "rust", name: "Rust", url: "https://blog.rust-lang.org/feed.xml", tags: ["rust"] },
  { key: "nextjs", name: "Next.js", url: "https://nextjs.org/feed.xml", tags: ["nextjs"] },
];

const REQUEST_TIMEOUT_MS = 8_000;
const MAX_BODY_BYTES = 1024 * 1024;
const MAX_STORIES_PER_FEED = 4;
const ACCEPT = "application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.8";

// Entities stay unexpanded (no DOCTYPE or entity-expansion DoS) and every value stays a string;
// the few standard entities a title or link may carry are decoded below instead.
const parser = new XMLParser({
  ignoreAttributes: false,
  processEntities: false,
  htmlEntities: false,
  parseTagValue: false,
  parseAttributeValue: false,
});

// A Map, not an object literal, so "&constructor;" cannot reach Object.prototype.
const NAMED_ENTITIES: ReadonlyMap<string, string> = new Map([
  ["amp", "&"],
  ["lt", "<"],
  ["gt", ">"],
  ["quot", '"'],
  ["apos", "'"],
  ["nbsp", "\u00a0"],
  ["hellip", "…"],
  ["mdash", "—"],
  ["ndash", "–"],
  ["lsquo", "‘"],
  ["rsquo", "’"],
  ["ldquo", "“"],
  ["rdquo", "”"],
]);

const decodeCodePoint = (codePoint: number, original: string) =>
  codePoint > 0 && codePoint <= 0x10ffff && (codePoint < 0xd800 || codePoint > 0xdfff)
    ? String.fromCodePoint(codePoint)
    : original;

// One pass per call, so "&amp;lt;" becomes "&lt;": no entity ever expands into another one.
const decodeEntities = (text: string): string =>
  text.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (match, body: string) => {
    if (body.startsWith("#x") || body.startsWith("#X")) {
      return decodeCodePoint(Number.parseInt(body.slice(2), 16), match);
    }
    if (body.startsWith("#")) return decodeCodePoint(Number.parseInt(body.slice(1), 10), match);
    return NAMED_ENTITIES.get(body) ?? match;
  });

/** A text node: a plain string, or `{ "#text" }` when the element also has attributes. */
const textSchema = z
  .union([z.string(), z.object({ "#text": z.string() })])
  .transform((value) => (typeof value === "string" ? value : value["#text"]));

const rssDocumentSchema = z.object({
  rss: z.object({ channel: z.object({ item: z.unknown().optional() }) }),
});

const atomDocumentSchema = z.object({
  feed: z.object({ entry: z.unknown().optional() }),
});

const rssItemSchema = z.object({
  title: textSchema,
  link: textSchema,
  pubDate: textSchema.optional(),
  "dc:date": textSchema.optional(),
});

// Atom says whether a title is text or escaped HTML; HTML needs a second round of decoding.
const atomTitleSchema = z
  .union([z.string(), z.object({ "#text": z.string(), "@_type": z.string().optional() })])
  .transform((value) =>
    typeof value === "string"
      ? value
      : value["@_type"] === "html"
        ? decodeEntities(value["#text"])
        : value["#text"],
  );

const atomEntrySchema = z.object({
  title: atomTitleSchema,
  link: z.unknown(),
  published: textSchema.optional(),
  updated: textSchema.optional(),
});

const atomLinkSchema = z.object({ "@_href": z.string(), "@_rel": z.string().optional() });

/** What every item looks like before normalization, whatever the feed format. */
type RawEntry = { title: string; link: string; date: string | undefined };

const toList = (value: unknown): unknown[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

const stripTags = (text: string): string => text.replace(/<\/?[a-z][^>]*>/gi, "");

// Tags come raw from CDATA or escaped as entities (Atom type="html"), so strip on both sides.
const toPlainText = (text: string): string =>
  stripTags(decodeEntities(stripTags(text)))
    .replace(/\s+/g, " ")
    .trim();

const toHttpUrl = (value: string): string | null => {
  try {
    const url = new URL(decodeEntities(value.trim()));
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
};

const toIsoInstant = (value: string | undefined): string | null => {
  if (value === undefined || value.trim() === "") return null;
  const time = new Date(value.trim()).getTime();
  return Number.isNaN(time) ? null : new Date(time).toISOString();
};

// FNV-1a: a short id that stays the same for the same link across reads.
const hashOf = (text: string): string => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
};

const readRssItems = (items: unknown): RawEntry[] =>
  toList(items).flatMap((item) => {
    const parsed = rssItemSchema.safeParse(item);
    if (!parsed.success) return [];
    const { title, link, pubDate } = parsed.data;
    return [{ title, link, date: pubDate ?? parsed.data["dc:date"] }];
  });

// Atom may list several links; the page is the "alternate" one, which is also the default rel.
const alternateHref = (links: unknown): string | undefined =>
  toList(links)
    .flatMap((link) => {
      const parsed = atomLinkSchema.safeParse(link);
      return parsed.success ? [parsed.data] : [];
    })
    .find((link) => (link["@_rel"] ?? "alternate") === "alternate")?.["@_href"];

const readAtomEntries = (entries: unknown): RawEntry[] =>
  toList(entries).flatMap((entry) => {
    const parsed = atomEntrySchema.safeParse(entry);
    if (!parsed.success) return [];
    const link = alternateHref(parsed.data.link);
    if (link === undefined) return [];
    return [{ title: parsed.data.title, link, date: parsed.data.published ?? parsed.data.updated }];
  });

const readEntries = (document: unknown): RawEntry[] => {
  const rss = rssDocumentSchema.safeParse(document);
  if (rss.success) return readRssItems(rss.data.rss.channel.item);

  const atom = atomDocumentSchema.safeParse(document);
  if (atom.success) return readAtomEntries(atom.data.feed.entry);

  throw new Error("The document is neither an RSS 2.0 nor an Atom feed");
};

// Only the prolog, before the root element, can hold a DOCTYPE; post bodies may quote one in CDATA.
const hasDoctype = (xml: string) => {
  const root = xml.search(/<(rss|feed)[\s>]/);
  return /<!DOCTYPE/i.test(root === -1 ? xml : xml.slice(0, root));
};

/**
 * The newest posts of one blog feed, RSS 2.0 or Atom. Items without a title, an absolute http(s)
 * link or a valid date are dropped one by one; a document that is not a feed throws.
 */
export const parseBlogFeed = (xml: string, feed: BlogFeed): NewsStory[] => {
  // No feed we read declares a DOCTYPE; one is how entity bombs and external entities arrive.
  // The parser does not expand entities either way: this just refuses such a feed early.
  if (hasDoctype(xml)) throw new Error(`${feed.name} feed declares a DOCTYPE`);

  const validation = XMLValidator.validate(xml);
  if (validation !== true) throw new Error(`${feed.name} feed is not valid XML`);

  const document: unknown = parser.parse(xml);

  return readEntries(document)
    .flatMap((entry): NewsStory[] => {
      const title = toPlainText(entry.title);
      const url = toHttpUrl(entry.link);
      const publishedAt = toIsoInstant(entry.date);
      if (title === "" || url === null || publishedAt === null) return [];

      return [
        {
          id: `blog-${feed.key}-${hashOf(url)}`,
          source: "blog",
          sourceName: `${feed.name} · Blog oficial`,
          title,
          url,
          publishedAt,
          points: 0,
          commentsCount: 0,
          tags: feed.tags,
        },
      ];
    })
    .toSorted((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, MAX_STORIES_PER_FEED);
};

// Streams the body so an oversized feed is cut off at the limit instead of buffered whole.
const readCappedText = async (response: Response, feed: BlogFeed): Promise<string> => {
  const declaredLength = response.headers.get("content-length");
  if (declaredLength !== null && Number(declaredLength) > MAX_BODY_BYTES) {
    await response.body?.cancel();
    throw new Error(`${feed.name} feed is too large`);
  }
  if (response.body === null) return "";

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new Error(`${feed.name} feed is too large`);
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
};

export const fetchBlogFeed = async (
  feed: BlogFeed,
  fetchFn: typeof fetch = fetch,
): Promise<NewsStory[]> => {
  const response = await fetchFn(feed.url, {
    headers: { Accept: ACCEPT },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (response.status !== 200) {
    await response.body?.cancel();
    throw new Error(`${feed.name} feed request failed with status ${response.status}`);
  }

  const stories = parseBlogFeed(await readCappedText(response, feed), feed);
  if (stories.length === 0) throw new Error(`${feed.name} feed has no usable posts`);
  return stories;
};

/** The newest posts of every official blog. A failing feed is left out; all failing throws. */
export const fetchBlogFeeds = async (
  fetchFn: typeof fetch = fetch,
  feeds: readonly BlogFeed[] = BLOG_FEEDS,
): Promise<NewsStory[]> => {
  const results = await Promise.allSettled(feeds.map((feed) => fetchBlogFeed(feed, fetchFn)));

  if (!results.some((result) => result.status === "fulfilled")) {
    throw new AggregateError(
      results.map((result) => (result.status === "rejected" ? result.reason : null)),
      "Every blog feed failed",
    );
  }

  return results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
};
