import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getConversationResult } from "@/features/conversation/api/get-conversation-statuses";
import { resetLastGoodSnapshots } from "@/shared/lib/last-good-snapshot";

import { MASTODON_TAG_TIMELINE } from "../fixtures/mastodon-tag-timeline";

// Outside Next there is no cache: each call runs the read, which is what these tests need.
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));

const OK_AT = "2026-10-10T10:00:00.000Z";
const FAILED_AT = "2026-10-10T13:00:00.000Z";

const answer = vi.fn(async () => Response.json(MASTODON_TAG_TIMELINE));
const serverError = vi.fn(async () => new Response("down", { status: 503 }));

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(OK_AT));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  resetLastGoodSnapshots();
});

describe("getConversationResult", () => {
  it("returns the last good statuses as stale when a later read fails", async () => {
    vi.stubGlobal("fetch", answer);
    const ok = await getConversationResult();
    expect(ok.status).toBe("ok");

    vi.setSystemTime(new Date(FAILED_AT));
    vi.stubGlobal("fetch", serverError);

    await expect(getConversationResult()).resolves.toEqual({
      status: "error",
      fetchedAt: FAILED_AT,
      stale: { statuses: ok.status === "ok" ? ok.statuses : [], savedAt: OK_AT },
    });
  });

  it("returns a plain error when nothing good was read before", async () => {
    vi.stubGlobal("fetch", serverError);

    await expect(getConversationResult()).resolves.toEqual({ status: "error", fetchedAt: OK_AT });
  });

  it("drops the last good statuses once they are older than 24 hours", async () => {
    vi.stubGlobal("fetch", answer);
    await getConversationResult();

    vi.setSystemTime(new Date("2026-10-11T10:00:01.000Z"));
    vi.stubGlobal("fetch", serverError);

    await expect(getConversationResult()).resolves.toEqual({
      status: "error",
      fetchedAt: "2026-10-11T10:00:01.000Z",
    });
  });
});
