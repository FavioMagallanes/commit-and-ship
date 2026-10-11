import { describe, expect, it, vi } from "vitest";

import { readDevToSnapshot } from "@/features/news-feed/api/get-dev-to-stories";
import { readHackerNewsSnapshot } from "@/features/news-feed/api/get-hacker-news-stories";

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
