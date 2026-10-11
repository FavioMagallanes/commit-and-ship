import { z } from "zod";

import {
  type MastodonStatus,
  mastodonStatusSchema,
} from "@/features/conversation/model/mastodon-status";

// Public tag timelines need no key; mastodon.social allows 300 requests every 5 minutes per IP.
export const CONVERSATION_TAGS = ["webdev", "javascript", "programming", "opensource"];
const STATUSES_PER_TAG = 20;
const REQUEST_TIMEOUT_MS = 8_000;

const responseSchema = z.array(z.unknown());

const tagTimelineUrl = (tag: string) =>
  `https://mastodon.social/api/v1/timelines/tag/${encodeURIComponent(tag)}?limit=${STATUSES_PER_TAG}`;

export const parseMastodonStatuses = (data: unknown): MastodonStatus[] =>
  responseSchema.parse(data).flatMap((status) => {
    const parsed = mastodonStatusSchema.safeParse(status);
    return parsed.success ? [parsed.data] : [];
  });

const fetchTagTimeline = async (tag: string, fetchFn: typeof fetch) => {
  const response = await fetchFn(tagTimelineUrl(tag), {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Mastodon #${tag} request failed with status ${response.status}`);
  }

  return parseMastodonStatuses(await response.json());
};

/**
 * Statuses of every tag, without duplicates. A tag that fails is skipped; it only throws when
 * every tag failed, so a partial outage still fills the card.
 */
export const fetchConversationStatuses = async (
  fetchFn: typeof fetch = fetch,
): Promise<MastodonStatus[]> => {
  const results = await Promise.allSettled(
    CONVERSATION_TAGS.map((tag) => fetchTagTimeline(tag, fetchFn)),
  );
  const answered = results.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );
  if (answered.length === 0) throw new Error("Mastodon could not be read");

  const seenIds = new Set<string>();
  return answered.flat().filter((status) => {
    if (seenIds.has(status.id)) return false;
    seenIds.add(status.id);
    return true;
  });
};
