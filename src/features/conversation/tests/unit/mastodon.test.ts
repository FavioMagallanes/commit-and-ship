import { describe, expect, it, vi } from "vitest";

import {
  CONVERSATION_TAGS,
  fetchConversationStatuses,
  parseMastodonStatuses,
} from "@/features/conversation/api/mastodon";

import { MASTODON_TAG_TIMELINE } from "../fixtures/mastodon-tag-timeline";

const [firstStatus] = MASTODON_TAG_TIMELINE;

describe("parseMastodonStatuses", () => {
  it("keeps only the fields the feature reads", () => {
    expect(parseMastodonStatuses(MASTODON_TAG_TIMELINE)[0]).toEqual({
      id: "115000000000000001",
      url: "https://mastodon.social/@alice/115000000000000001",
      created_at: "2026-10-10T09:30:00.000Z",
      content: firstStatus?.content,
      language: "en",
      sensitive: false,
      spoiler_text: "",
      in_reply_to_id: null,
      reblog: null,
      favourites_count: 30,
      reblogs_count: 12,
      account: { acct: "alice", bot: false, url: "https://mastodon.social/@alice" },
    });
  });

  it("skips invalid statuses instead of failing the whole list", () => {
    const statuses = [
      { ...firstStatus, id: 42 },
      { ...firstStatus, content: null },
      { ...firstStatus, account: { acct: "x" } },
      { ...firstStatus, favourites_count: "many" },
      "not a status",
      firstStatus,
    ];

    expect(parseMastodonStatuses(statuses)).toHaveLength(1);
  });

  it("accepts a missing language as null", () => {
    const withoutLanguage: Record<string, unknown> = { ...firstStatus };
    delete withoutLanguage.language;

    expect(parseMastodonStatuses([withoutLanguage])[0]?.language).toBeNull();
  });

  it("returns an empty list when there are no statuses", () => {
    expect(parseMastodonStatuses([])).toEqual([]);
  });

  it.each([null, "nope", {}, { statuses: [] }])("throws on an unexpected response %j", (value) => {
    expect(() => parseMastodonStatuses(value)).toThrow();
  });
});

describe("fetchConversationStatuses", () => {
  it("reads every tag timeline and merges them without duplicates", async () => {
    const fetchFn = vi.fn(async () => Response.json(MASTODON_TAG_TIMELINE));

    const statuses = await fetchConversationStatuses(fetchFn);

    expect(statuses.map((status) => status.id)).toEqual([
      "115000000000000001",
      "115000000000000002",
    ]);
    const urls = fetchFn.mock.calls.map((call) => (call as unknown as [string])[0]);
    expect(urls).toEqual(
      CONVERSATION_TAGS.map(
        (tag) => `https://mastodon.social/api/v1/timelines/tag/${tag}?limit=20`,
      ),
    );
  });

  it("keeps the tags that answered when others fail", async () => {
    const fetchFn = vi.fn(async (input: string | URL | Request) =>
      String(input).includes("/webdev")
        ? Response.json(MASTODON_TAG_TIMELINE)
        : new Response("down", { status: 503 }),
    );

    await expect(fetchConversationStatuses(fetchFn)).resolves.toHaveLength(2);
  });

  it("throws when every tag fails", async () => {
    const fetchFn = vi.fn(async () => new Response("down", { status: 503 }));

    await expect(fetchConversationStatuses(fetchFn)).rejects.toThrow();
  });
});
