import { cacheLife, cacheTag } from "next/cache";

import { fetchConversationStatuses } from "@/features/conversation/api/mastodon";
import type { MastodonStatus } from "@/features/conversation/model/mastodon-status";

/** One read of Mastodon. Plain data, so it can be stored by "use cache". */
type StatusesResult = { status: "ok"; statuses: MastodonStatus[] } | { status: "error" };

/**
 * Reads Mastodon once and never throws: a failure comes back as the error branch, because an error
 * thrown inside a "use cache" scope fails the prerender, and with it the whole build.
 */
export const readConversationStatuses = async (
  fetchFn: typeof fetch = fetch,
): Promise<StatusesResult> => {
  try {
    return { status: "ok", statuses: await fetchConversationStatuses(fetchFn) };
  } catch {
    return { status: "error" };
  }
};

/**
 * Cached for 15 minutes (4 requests per refresh); a failed read is retried after a minute instead.
 * The 48-hour window depends on the current time, so the posts are picked outside the cache.
 */
const getCachedConversationStatuses = async (): Promise<StatusesResult> => {
  "use cache";
  cacheTag("conversation", "mastodon");

  const result = await readConversationStatuses();
  cacheLife({ revalidate: result.status === "ok" ? 900 : 60 });
  return result;
};

/** Recent statuses of the tracked tags. Throws, outside the cache, when Mastodon failed. */
export const getConversationStatuses = async (): Promise<MastodonStatus[]> => {
  const result = await getCachedConversationStatuses();
  if (result.status === "error") throw new Error("Mastodon could not be read");
  return result.statuses;
};
