import { afterEach, describe, expect, it } from "vitest";

import {
  lastGoodSnapshot,
  MAX_SNAPSHOT_AGE_MS,
  resetLastGoodSnapshots,
} from "@/shared/lib/last-good-snapshot";

const SAVED_AT = "2026-10-10T10:00:00.000Z";
const at = (iso: string) => new Date(iso);

afterEach(() => {
  resetLastGoodSnapshots();
});

describe("lastGoodSnapshot", () => {
  it("recalls nothing before anything was remembered", () => {
    const slot = lastGoodSnapshot<string[]>("hacker-news");

    expect(slot.recall(at("2026-10-10T11:00:00.000Z"))).toBeNull();
  });

  it("recalls the last remembered value with the instant it was saved", () => {
    const slot = lastGoodSnapshot<string[]>("hacker-news");
    slot.remember(["first"], "2026-10-10T09:00:00.000Z");
    slot.remember(["second"], SAVED_AT);

    expect(slot.recall(at("2026-10-10T13:00:00.000Z"))).toEqual({
      value: ["second"],
      savedAt: SAVED_AT,
    });
  });

  it("returns the stored value as is, inside a frozen entry", () => {
    const slot = lastGoodSnapshot<string[]>("dev-to");
    const value = ["story"];
    slot.remember(value, SAVED_AT);

    const recalled = slot.recall(at("2026-10-10T10:30:00.000Z"));

    expect(recalled?.value).toBe(value);
    expect(Object.isFrozen(recalled)).toBe(true);
  });

  it("keeps an entry up to 24 hours old and drops it after that", () => {
    const slot = lastGoodSnapshot<string[]>("blogs");
    slot.remember(["post"], SAVED_AT);
    const savedTime = at(SAVED_AT).getTime();

    expect(slot.recall(new Date(savedTime + MAX_SNAPSHOT_AGE_MS))).not.toBeNull();
    expect(slot.recall(new Date(savedTime + MAX_SNAPSHOT_AGE_MS + 1))).toBeNull();
    // Once dropped it stays dropped, even if asked again with an earlier clock.
    expect(slot.recall(at("2026-10-10T10:30:00.000Z"))).toBeNull();
  });

  it("does not recall an entry saved with an invalid instant", () => {
    const slot = lastGoodSnapshot<string[]>("releases");
    slot.remember(["release"], "not a date");

    expect(slot.recall(at(SAVED_AT))).toBeNull();
  });

  it("keeps each key apart", () => {
    const releases = lastGoodSnapshot<string[]>("releases");
    const conversation = lastGoodSnapshot<number>("conversation");
    releases.remember(["v1"], SAVED_AT);

    expect(conversation.recall(at(SAVED_AT))).toBeNull();
    expect(releases.recall(at(SAVED_AT))?.value).toEqual(["v1"]);
  });

  it("forgets every key on reset", () => {
    const hackerNews = lastGoodSnapshot<string[]>("hacker-news");
    const conversation = lastGoodSnapshot<number>("conversation");
    hackerNews.remember(["story"], SAVED_AT);
    conversation.remember(3, SAVED_AT);

    resetLastGoodSnapshots();

    expect(hackerNews.recall(at(SAVED_AT))).toBeNull();
    expect(conversation.recall(at(SAVED_AT))).toBeNull();
  });
});
