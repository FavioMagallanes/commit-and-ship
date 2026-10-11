import { describe, expect, it } from "vitest";

import type { MastodonStatus } from "@/features/conversation/model/mastodon-status";
import {
  isConversationWorthy,
  pickConversations,
} from "@/features/conversation/model/pick-conversations";

const NOW = new Date("2026-10-10T12:00:00.000Z");

const LONG_ENOUGH = "Una reflexión sobre bases de datos que vale la pena compartir hoy.";
const SCAM = "Gran crypto giveaway: enviá 1 BTC y recibí 2 de vuelta hoy mismo.";

// Varied letters, so the text never trips the repeated-character spam rule.
const textOfLength = (length: number) =>
  Array.from({ length }, (_, index) => "abcdefghij"[index % 10]).join("");

const status = (overrides: Partial<MastodonStatus> = {}): MastodonStatus => ({
  id: "1",
  url: "https://mastodon.social/@alice/1",
  created_at: "2026-10-10T10:00:00.000Z",
  content: `<p>${LONG_ENOUGH}</p>`,
  language: "es",
  sensitive: false,
  spoiler_text: "",
  in_reply_to_id: null,
  reblog: null,
  favourites_count: 0,
  reblogs_count: 0,
  account: { acct: "alice", bot: false, url: "https://mastodon.social/@alice" },
  ...overrides,
});

const account = (acct: string, bot = false) => ({
  acct,
  bot,
  url: `https://mastodon.social/@${acct}`,
});

describe("isConversationWorthy", () => {
  it("accepts a recent, plain, public post of a person", () => {
    expect(isConversationWorthy(status(), NOW)).toBe(true);
  });

  it.each<[string, Partial<MastodonStatus>]>([
    ["sensitive", { sensitive: true }],
    ["behind a content warning", { spoiler_text: "spoilers" }],
    ["a reply", { in_reply_to_id: "99" }],
    ["a reblog", { reblog: { id: "2" } }],
    ["from a bot", { account: account("newsbot", true) }],
    ["bridged by brid.gy", { account: account("someone@bsky.brid.gy") }],
    ["in another language", { language: "de" }],
    ["without a language", { language: null }],
    ["too short", { content: "<p>Nice!</p>" }],
    ["too long", { content: `<p>${textOfLength(281)}</p>` }],
    ["spam by its content", { content: `<p>${SCAM}</p>` }],
    ["without a url", { url: null }],
    ["linked with a non http(s) url", { url: "javascript:alert(1)" }],
    ["dated with an invalid date", { created_at: "yesterday" }],
    ["older than 48 hours", { created_at: "2026-10-08T11:59:59.000Z" }],
    ["dated in the future", { created_at: "2026-10-10T12:00:01.000Z" }],
  ])("rejects a post that is %s", (_case, overrides) => {
    expect(isConversationWorthy(status(overrides), NOW)).toBe(false);
  });

  it("accepts English posts and the length limits", () => {
    expect(isConversationWorthy(status({ language: "en", content: textOfLength(40) }), NOW)).toBe(
      true,
    );
    expect(isConversationWorthy(status({ content: textOfLength(280) }), NOW)).toBe(true);
    expect(isConversationWorthy(status({ content: textOfLength(39) }), NOW)).toBe(false);
  });

  it("measures the length on the text, not on the markup", () => {
    const content = `<p><a href="https://example.com/a-very-long-url-that-adds-markup">${textOfLength(30)}</a></p>`;

    expect(isConversationWorthy(status({ content }), NOW)).toBe(false);
  });

  it("accepts a post exactly 48 hours old", () => {
    expect(isConversationWorthy(status({ created_at: "2026-10-08T12:00:00.000Z" }), NOW)).toBe(
      true,
    );
  });
});

describe("pickConversations", () => {
  it("returns normalized posts with the handle, the source and plain text", () => {
    expect(
      pickConversations([status({ content: `<p>${LONG_ENOUGH} &amp; más</p>` })], NOW),
    ).toEqual([
      {
        id: "1",
        handle: "@alice",
        source: "Mastodon",
        text: `${LONG_ENOUGH} & más`,
        url: "https://mastodon.social/@alice/1",
        publishedAt: "2026-10-10T10:00:00.000Z",
      },
    ]);
  });

  it("ranks by favourites plus reblogs, then by the newest", () => {
    const posts = pickConversations(
      [
        status({
          id: "old",
          account: account("a"),
          favourites_count: 5,
          created_at: "2026-10-10T08:00:00.000Z",
        }),
        status({ id: "top", account: account("b"), favourites_count: 2, reblogs_count: 10 }),
        status({
          id: "new",
          account: account("c"),
          favourites_count: 5,
          created_at: "2026-10-10T11:00:00.000Z",
        }),
      ],
      NOW,
    );

    expect(posts.map((post) => post.id)).toEqual(["top", "new", "old"]);
  });

  it("keeps at most three posts", () => {
    const statuses = ["a", "b", "c", "d"].map((acct) =>
      status({ id: acct, account: account(acct) }),
    );

    expect(pickConversations(statuses, NOW)).toHaveLength(3);
  });

  it("keeps only the best post of each account", () => {
    const posts = pickConversations(
      [
        status({ id: "1", account: account("alice"), favourites_count: 1 }),
        status({ id: "2", account: account("Alice"), favourites_count: 9 }),
        status({ id: "3", account: account("bob") }),
      ],
      NOW,
    );

    expect(posts.map((post) => post.id)).toEqual(["2", "3"]);
  });

  it("removes duplicates that came from several tags", () => {
    const posts = pickConversations(
      [status({ id: "1" }), status({ id: "1" }), status({ id: "2", account: account("bob") })],
      NOW,
    );

    expect(posts.map((post) => post.id)).toEqual(["1", "2"]);
  });

  it("leaves out the posts that are not worth showing", () => {
    expect(
      pickConversations([status({ sensitive: true }), status({ id: "2", language: null })], NOW),
    ).toEqual([]);
  });

  it("leaves out spam even when it is the most popular post, and shows the next best", () => {
    const posts = pickConversations(
      [
        status({
          id: "spam",
          account: account("spammer"),
          content: `<p>${SCAM}</p>`,
          favourites_count: 99,
        }),
        status({ id: "good", account: account("bob"), favourites_count: 3 }),
        status({ id: "other", account: account("carol"), favourites_count: 1 }),
      ],
      NOW,
    );

    expect(posts.map((post) => post.id)).toEqual(["good", "other"]);
  });

  it("truncates the text to 200 characters with an ellipsis", () => {
    const [post] = pickConversations([status({ content: `<p>${"palabra ".repeat(30)}</p>` })], NOW);

    expect(post?.text).toHaveLength(200);
    expect(post?.text.endsWith("…")).toBe(true);
  });
});
