import { updateTag } from "next/cache";

import { describe, expect, it, vi } from "vitest";

import { retryNews } from "@/features/news-feed/actions/retry-news";

vi.mock("next/cache", () => ({ updateTag: vi.fn() }));

describe("retryNews", () => {
  it('expires only the "news" cache tag', async () => {
    await retryNews();

    expect(updateTag).toHaveBeenCalledTimes(1);
    expect(updateTag).toHaveBeenCalledWith("news");
  });
});
