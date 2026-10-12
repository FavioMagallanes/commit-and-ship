import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getBlogSnapshot } from "@/features/news-feed/api/get-blogs-stories";
import { getDevToSnapshot } from "@/features/news-feed/api/get-dev-to-stories";
import { getHackerNewsSnapshot } from "@/features/news-feed/api/get-hacker-news-stories";
import { resetLastGoodSnapshots } from "@/shared/lib/last-good-snapshot";

import { NODE_JS_RSS } from "../fixtures/blog-feeds";
import { DEV_TO_TOP_ARTICLES } from "../fixtures/dev-to-top-articles";
import { HACKER_NEWS_FRONT_PAGE } from "../fixtures/hacker-news-front-page";

// Outside Next there is no cache: each call runs the read, which is what these tests need.
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));

const OK_AT = "2026-10-10T10:00:00.000Z";
const FAILED_AT = "2026-10-10T13:00:00.000Z";

const serverError = async () => new Response("down", { status: 503 });

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(OK_AT));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  resetLastGoodSnapshots();
});

describe.each([
  {
    name: "getHackerNewsSnapshot",
    load: getHackerNewsSnapshot,
    answer: async () => Response.json(HACKER_NEWS_FRONT_PAGE),
  },
  {
    name: "getDevToSnapshot",
    load: getDevToSnapshot,
    answer: async () => Response.json(DEV_TO_TOP_ARTICLES),
  },
  {
    name: "getBlogSnapshot",
    load: getBlogSnapshot,
    answer: async (input: RequestInfo | URL) =>
      String(input).includes("nodejs.org")
        ? new Response(NODE_JS_RSS)
        : new Response("down", { status: 503 }),
  },
])("$name", ({ load, answer }) => {
  it("returns the last good stories as stale when a later read fails", async () => {
    vi.stubGlobal("fetch", vi.fn(answer));
    const ok = await load();
    expect(ok.status).toBe("ok");

    vi.setSystemTime(new Date(FAILED_AT));
    vi.stubGlobal("fetch", vi.fn(serverError));
    const failed = await load();

    expect(failed).toEqual({
      status: "error",
      fetchedAt: FAILED_AT,
      stale: { stories: ok.status === "ok" ? ok.stories : [], savedAt: OK_AT },
    });
  });

  it("returns a plain error when nothing good was read before", async () => {
    vi.stubGlobal("fetch", vi.fn(serverError));

    await expect(load()).resolves.toEqual({ status: "error", fetchedAt: OK_AT });
  });

  it("drops the last good stories once they are older than 24 hours", async () => {
    vi.stubGlobal("fetch", vi.fn(answer));
    await load();

    vi.setSystemTime(new Date("2026-10-11T10:00:01.000Z"));
    vi.stubGlobal("fetch", vi.fn(serverError));

    await expect(load()).resolves.toEqual({
      status: "error",
      fetchedAt: "2026-10-11T10:00:01.000Z",
    });
  });
});
