// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import {
  BLOG_FEEDS,
  type BlogFeed,
  fetchBlogFeed,
  fetchBlogFeeds,
  parseBlogFeed,
} from "@/features/news-feed/api/blogs";

import {
  ENTITY_BOMB_RSS,
  NEXT_JS_RSS,
  NODE_JS_RSS,
  REACT_RSS,
  RUST_ATOM,
} from "../fixtures/blog-feeds";

const feedByKey = (key: string): BlogFeed => {
  const feed = BLOG_FEEDS.find((candidate) => candidate.key === key);
  if (!feed) throw new Error(`Unknown feed ${key}`);
  return feed;
};

const nodeJs = feedByKey("nodejs");
const react = feedByKey("react");
const rust = feedByKey("rust");
const nextJs = feedByKey("nextjs");

const xmlResponse = (body: string, init?: ResponseInit) =>
  new Response(body, { status: 200, headers: { "content-type": "application/xml" }, ...init });

const BODIES: Record<string, string> = {
  [nodeJs.url]: NODE_JS_RSS,
  [react.url]: REACT_RSS,
  [rust.url]: RUST_ATOM,
  [nextJs.url]: NEXT_JS_RSS,
};

const urlOf = (input: RequestInfo | URL) =>
  typeof input === "string" ? input : input instanceof URL ? input.href : input.url;

/** Answers every feed from its fixture, except the urls given in `failing`. */
const fetchFeeds = (failing: Record<string, () => Promise<Response>> = {}) =>
  vi.fn(async (input: RequestInfo | URL): Promise<Response> => {
    const url = urlOf(input);
    const fail = failing[url];
    if (fail) return fail();
    const body = BODIES[url];
    return body === undefined ? new Response("not found", { status: 404 }) : xmlResponse(body);
  });

describe("parseBlogFeed", () => {
  it("maps RSS items to blog stories, newest first, capped at four", () => {
    const stories = parseBlogFeed(NODE_JS_RSS, nodeJs);

    expect(stories.map((story) => story.title)).toEqual([
      "Security releases: October 2026",
      "Node.js v24.9.0 (Current)",
      "Node.js v22.21.0 (LTS)",
      "Node.js v20.20.0 (LTS)",
    ]);
    expect(stories[1]).toEqual({
      id: expect.stringMatching(/^blog-nodejs-[a-z0-9]+$/),
      source: "blog",
      sourceName: "Node.js · Blog oficial",
      title: "Node.js v24.9.0 (Current)",
      url: "https://nodejs.org/en/blog/release/v24.9.0",
      publishedAt: "2026-10-09T12:00:00.000Z",
      points: 0,
      commentsCount: 0,
      tags: ["node"],
    });
  });

  it("drops items without a usable date, an http(s) link or a title", () => {
    const urls = parseBlogFeed(NODE_JS_RSS, nodeJs).map((story) => story.url);

    expect(urls).not.toContain("https://nodejs.org/en/blog/undated");
    expect(urls).not.toContain("https://nodejs.org/en/blog/bad-date");
    expect(urls).not.toContain("https://nodejs.org/en/blog/untitled");
    expect(urls.some((url) => url.includes("relative") || url.startsWith("javascript:"))).toBe(
      false,
    );
  });

  it("gives each story a stable id derived from its link", () => {
    const first = parseBlogFeed(NODE_JS_RSS, nodeJs).map((story) => story.id);
    const second = parseBlogFeed(NODE_JS_RSS, nodeJs).map((story) => story.id);

    expect(first).toEqual(second);
    expect(new Set(first).size).toBe(first.length);
  });

  it("reads a feed with a single item and decodes the entities of its title and link", () => {
    expect(parseBlogFeed(REACT_RSS, react)).toEqual([
      expect.objectContaining({
        sourceName: "React · Blog oficial",
        title: "React Labs: View Transitions & Activity — what’s next",
        url: "https://react.dev/blog/2026/10/08/react-labs?utm_source=rss&utm_medium=feed",
        publishedAt: "2026-10-08T16:00:00.000Z",
        tags: ["react"],
      }),
    ]);
  });

  it("maps Atom entries using the alternate link and published or updated date", () => {
    expect(
      parseBlogFeed(RUST_ATOM, rust).map(({ title, url, publishedAt }) => ({
        title,
        url,
        publishedAt,
      })),
    ).toEqual([
      {
        title: "Announcing Rust 1.95.0",
        url: "https://blog.rust-lang.org/2026/10/09/Rust-1.95.0/",
        publishedAt: "2026-10-09T00:00:00.000Z",
      },
      {
        title: "Faster builds with cargo & friends",
        url: "https://blog.rust-lang.org/2026/10/07/faster-builds/",
        publishedAt: "2026-10-07T10:30:00.000Z",
      },
      {
        title: "Entry whose link has no rel",
        url: "https://blog.rust-lang.org/2026/10/05/no-rel/",
        publishedAt: "2026-10-05T00:00:00.000Z",
      },
    ]);
  });

  it("leaves unknown entities as they are", () => {
    const xml = `<rss><channel><item><title>Use &amp;constructor; &constructor; &#0; &unknown;</title>
      <link>https://nodejs.org/en/blog/x</link><pubDate>Sat, 10 Oct 2026 09:00:00 GMT</pubDate>
    </item></channel></rss>`;

    expect(parseBlogFeed(xml, nodeJs)[0]?.title).toBe(
      "Use &constructor; &constructor; &#0; &unknown;",
    );
  });

  it("reads dc:date when an RSS item has no pubDate", () => {
    expect(parseBlogFeed(NEXT_JS_RSS, nextJs).map((story) => story.publishedAt)).toEqual([
      "2026-10-07T18:00:00.000Z",
      "2026-10-02T15:00:00.000Z",
    ]);
  });

  it("gives every feed a tag that classifies it into a topic", () => {
    expect(Object.fromEntries(BLOG_FEEDS.map((feed) => [feed.key, feed.tags]))).toEqual({
      nodejs: ["node"],
      react: ["react"],
      rust: ["rust"],
      nextjs: ["nextjs"],
    });
  });

  it("rejects an entity bomb quickly without expanding it", () => {
    const start = performance.now();

    expect(() => parseBlogFeed(ENTITY_BOMB_RSS, nodeJs)).toThrow(/DOCTYPE/);
    expect(performance.now() - start).toBeLessThan(1_000);
  });

  it("never expands declared entities, even if the DOCTYPE check is dodged", () => {
    const disguised = ENTITY_BOMB_RSS.replace("<!DOCTYPE", "<!-- <rss> --><!DOCTYPE");
    const start = performance.now();

    let titles: string[] = [];
    try {
      titles = parseBlogFeed(disguised, nodeJs).map((story) => story.title);
    } catch {
      // Refusing the document is just as safe as reading it unexpanded.
    }

    expect(performance.now() - start).toBeLessThan(1_000);
    expect(titles.join("")).not.toContain("lollol");
  });

  it.each([
    ["malformed XML", "<rss><channel><item><title>Broken"],
    ["plain text", "not xml at all"],
    ["an empty body", ""],
    ["an unknown root", "<html><body>Not a feed</body></html>"],
  ])("throws on %s", (_case, xml) => {
    expect(() => parseBlogFeed(xml, nodeJs)).toThrow();
  });

  it("returns no stories for a feed without items", () => {
    expect(parseBlogFeed("<rss><channel><title>Empty</title></channel></rss>", nodeJs)).toEqual([]);
  });
});

describe("fetchBlogFeed", () => {
  it("asks for a feed format and parses the body", async () => {
    const fetchFn = fetchFeeds();

    await expect(fetchBlogFeed(react, fetchFn)).resolves.toHaveLength(1);
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://react.dev/rss.xml");
    expect(new Headers(init.headers).get("accept")).toBe(
      "application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.8",
    );
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it.each([
    ["an error status", () => new Response("down", { status: 503 })],
    ["a non-200 success", () => xmlResponse(REACT_RSS, { status: 203 })],
  ])("throws on %s", async (_case, respond) => {
    const fetchFn = vi.fn(async () => respond());

    await expect(fetchBlogFeed(react, fetchFn)).rejects.toThrow();
  });

  it("refuses a body whose declared length is over 1 MB without reading it", async () => {
    const fetchFn = vi.fn(async () =>
      xmlResponse(REACT_RSS, { headers: { "content-length": String(2 * 1024 * 1024) } }),
    );

    await expect(fetchBlogFeed(react, fetchFn)).rejects.toThrow(/too large/);
  });

  it("stops reading a body over 1 MB that does not declare its length", async () => {
    const padding = `<!-- ${"x".repeat(1024 * 1024)} -->`;
    const fetchFn = vi.fn(async () => xmlResponse(REACT_RSS.replace("<rss", `${padding}<rss`)));

    await expect(fetchBlogFeed(react, fetchFn)).rejects.toThrow(/too large/);
  });

  it("throws when a feed has no usable item", async () => {
    const fetchFn = vi.fn(async () =>
      xmlResponse("<rss><channel><item><title>x</title></item></channel></rss>"),
    );

    await expect(fetchBlogFeed(react, fetchFn)).rejects.toThrow();
  });
});

describe("fetchBlogFeeds", () => {
  it("combines the stories of every feed", async () => {
    const stories = await fetchBlogFeeds(fetchFeeds());

    expect(stories.map((story) => story.id.split("-")[1])).toEqual([
      ...Array<string>(4).fill("nodejs"),
      "react",
      ...Array<string>(3).fill("rust"),
      ...Array<string>(2).fill("nextjs"),
    ]);
  });

  it("keeps the other feeds when one fails", async () => {
    const fetchFn = fetchFeeds({
      [rust.url]: async () => {
        throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
      },
      [react.url]: async () => xmlResponse("<rss><channel><item>"),
    });

    const stories = await fetchBlogFeeds(fetchFn);

    expect(new Set(stories.map((story) => story.sourceName))).toEqual(
      new Set(["Node.js · Blog oficial", "Next.js · Blog oficial"]),
    );
  });

  it("throws when every feed fails", async () => {
    const down = async () => new Response("down", { status: 503 });
    const fetchFn = fetchFeeds(Object.fromEntries(BLOG_FEEDS.map((feed) => [feed.url, down])));

    await expect(fetchBlogFeeds(fetchFn)).rejects.toThrow("Every blog feed failed");
  });
});
