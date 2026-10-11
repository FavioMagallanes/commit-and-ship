import { updateTag } from "next/cache";

import { describe, expect, it, vi } from "vitest";

import { retryConversation } from "@/features/conversation/actions/retry-conversation";

vi.mock("next/cache", () => ({ updateTag: vi.fn() }));

describe("retryConversation", () => {
  it('expires only the "conversation" cache tag', async () => {
    await retryConversation();

    expect(updateTag).toHaveBeenCalledTimes(1);
    expect(updateTag).toHaveBeenCalledWith("conversation");
  });
});
