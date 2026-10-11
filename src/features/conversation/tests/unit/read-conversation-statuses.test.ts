import { describe, expect, it, vi } from "vitest";

import { readConversationStatuses } from "@/features/conversation/api/get-conversation-statuses";

import { MASTODON_TAG_TIMELINE } from "../fixtures/mastodon-tag-timeline";

const timingOut = vi.fn(async (): Promise<Response> => {
  throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
});
const serverError = vi.fn(async () => new Response("down", { status: 503 }));
const unexpectedBody = vi.fn(async () => Response.json({ unexpected: true }));

// Mastodon being down must come back as a value: an error thrown inside a "use cache" scope fails
// the prerender, and with it the whole build.
describe("readConversationStatuses", () => {
  it("returns the statuses when Mastodon answers", async () => {
    const result = await readConversationStatuses(
      vi.fn(async () => Response.json(MASTODON_TAG_TIMELINE)),
    );

    expect(result.status).toBe("ok");
    if (result.status === "ok") expect(result.statuses).toHaveLength(2);
  });

  it("is still ok when only some tags answer", async () => {
    let calls = 0;
    const flaky = vi.fn(async () => {
      calls += 1;
      return calls === 1 ? Response.json(MASTODON_TAG_TIMELINE) : new Response("", { status: 503 });
    });

    const result = await readConversationStatuses(flaky);

    expect(result.status).toBe("ok");
  });

  it.each([
    ["the requests time out", timingOut],
    ["Mastodon answers with an error status", serverError],
    ["the response does not match the schema", unexpectedBody],
  ])("returns the error branch instead of throwing when %s", async (_case, fetchFn) => {
    await expect(readConversationStatuses(fetchFn)).resolves.toEqual({ status: "error" });
  });
});
