import { updateTag } from "next/cache";

import { describe, expect, it, vi } from "vitest";

import { retryReleases } from "@/features/release-radar/actions/retry-releases";

vi.mock("next/cache", () => ({ updateTag: vi.fn() }));

describe("retryReleases", () => {
  it('expires only the "releases" cache tag', async () => {
    await retryReleases();

    expect(updateTag).toHaveBeenCalledTimes(1);
    expect(updateTag).toHaveBeenCalledWith("releases");
  });
});
