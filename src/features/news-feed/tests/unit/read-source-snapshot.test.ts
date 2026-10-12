import { describe, expect, it, vi } from "vitest";

import { BLOG_FEEDS } from "@/features/news-feed/api/blogs";
import { readBlogSnapshot } from "@/features/news-feed/api/get-blogs-stories";
import { readDevToSnapshot } from "@/features/news-feed/api/get-dev-to-stories";
import { readHackerNewsSnapshot } from "@/features/news-feed/api/get-hacker-news-stories";

import { NODE_JS_RSS } from "../fixtures/blog-feeds";
import { DEV_TO_TOP_ARTICLES } from "../fixtures/dev-to-top-articles";
import { HACKER_NEWS_FRONT_PAGE } from "../fixtures/hacker-news-front-page";

const NOW = new Date("2026-10-10T10:00:00.000Z");
const now = () => NOW;

const timingOut = vi.fn(async (): Promise<Response> => {
  throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
});
const serverError = vi.fn(async () => new Response("down", { status: 503 }));
const unexpectedBody = vi.fn(async () => Response.json({ unexpected: true }));

// A source that is down must come back as a value: an error thrown inside a "use cache" scope
// fails the prerender, and with it the whole build.
describe.each([
  { name: "readDevToSnapshot", read: readDevToSnapshot, body: DEV_TO_TOP_ARTICLES },
  { name: "readHackerNewsSnapshot", read: readHackerNewsSnapshot, body: HACKER_NEWS_FRONT_PAGE },
])("$name", ({ read, body }) => {
  it("returns the stories and the fetch time when the source answers", async () => {
    const snapshot = await read(
      vi.fn(async () => Response.json(body)),
      now,
    );

    expect(snapshot.status).toBe("ok");
    expect(snapshot.fetchedAt).toBe("2026-10-10T10:00:00.000Z");
    if (snapshot.status === "ok") expect(snapshot.stories.length).toBeGreaterThan(0);
  });

  it.each([
    ["the request times out", timingOut],
    ["the source answers with an error status", serverError],
    ["the response does not match the schema", unexpectedBody],
  ])("returns the error branch instead of throwing when %s", async (_case, fetchFn) => {
    await expect(read(fetchFn, now)).resolves.toEqual({
      status: "error",
      fetchedAt: "2026-10-10T10:00:00.000Z",
    });
  });
});

describe("readBlogSnapshot", () => {
  const nodeJsUrl = BLOG_FEEDS[0]?.url;

  it("is ok with the stories of the feeds that answered, even if others failed", async () => {
    const fetchFn = vi.fn(async (input: RequestInfo | URL) =>
      String(input) === nodeJsUrl
        ? new Response(NODE_JS_RSS)
        : new Response("down", { status: 503 }),
    );

    const snapshot = await readBlogSnapshot(fetchFn, now);

    expect(snapshot.status).toBe("ok");
    expect(snapshot.fetchedAt).toBe("2026-10-10T10:00:00.000Z");
    if (snapshot.status === "ok") {
      expect(snapshot.stories).toHaveLength(4);
      expect(snapshot.stories.every((story) => story.source === "blog")).toBe(true);
    }
  });

  it.each([
    ["every request times out", timingOut],
    ["every feed answers with an error status", serverError],
    ["every body is malformed XML", vi.fn(async () => new Response("<rss><channel><item>"))],
    ["no body matches a feed schema", unexpectedBody],
  ])("returns the error branch instead of throwing when %s", async (_case, fetchFn) => {
    await expect(readBlogSnapshot(fetchFn, now)).resolves.toEqual({
      status: "error",
      fetchedAt: "2026-10-10T10:00:00.000Z",
    });
  });
});
