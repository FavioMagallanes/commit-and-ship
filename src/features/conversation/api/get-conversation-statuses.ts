import { cacheLife, cacheTag } from "next/cache";

import { fetchConversationStatuses } from "@/features/conversation/api/mastodon";
import type { MastodonStatus } from "@/features/conversation/model/mastodon-status";
import { lastGoodSnapshot } from "@/shared/lib/last-good-snapshot";

/**
 * One read of Mastodon. Plain data, so it can be stored by "use cache". A failed read may carry
 * `stale`: the last good statuses, with the instant they were read, while `fetchedAt` stays the
 * instant of the failed attempt.
 */
export type ConversationResult =
  | { status: "ok"; statuses: MastodonStatus[]; fetchedAt: string }
  | {
      status: "error";
      fetchedAt: string;
      stale?: { statuses: MastodonStatus[]; savedAt: string };
    };

/**
 * Reads Mastodon once and never throws: a failure comes back as the error branch, because an error
 * thrown inside a "use cache" scope fails the prerender, and with it the whole build.
 */
export const readConversationStatuses = async (
  fetchFn: typeof fetch = fetch,
  now: () => Date = () => new Date(),
): Promise<ConversationResult> => {
  try {
    const statuses = await fetchConversationStatuses(fetchFn);
    return { status: "ok", statuses, fetchedAt: now().toISOString() };
  } catch {
    return { status: "error", fetchedAt: now().toISOString() };
  }
};

/**
 * Cached for 15 minutes (4 requests per refresh); a failed read is retried after a minute instead.
 * The 48-hour window depends on the current time, so the posts are picked outside the cache.
 */
const getCachedConversationStatuses = async (): Promise<ConversationResult> => {
  "use cache";
  cacheTag("conversation", "mastodon");

  const result = await readConversationStatuses();
  cacheLife({ revalidate: result.status === "ok" ? 900 : 60 });
  return result;
};

const lastGoodStatuses = lastGoodSnapshot<MastodonStatus[]>("conversation");

/**
 * The cached read, plus the last good statuses when the latest refill failed. It runs outside
 * "use cache" so it sees every result the cache serves, not only the ones it fills.
 */
export const getConversationResult = async (): Promise<ConversationResult> => {
  const result = await getCachedConversationStatuses();
  if (result.status === "ok") {
    lastGoodStatuses.remember(result.statuses, result.fetchedAt);
    return result;
  }

  const saved = lastGoodStatuses.recall(new Date(result.fetchedAt));
  return saved === null
    ? result
    : { ...result, stale: { statuses: saved.value, savedAt: saved.savedAt } };
};
