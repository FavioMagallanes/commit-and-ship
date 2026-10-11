import type { ConversationPost } from "@/features/conversation/model/conversation-post";
import { htmlToText } from "@/features/conversation/model/html-to-text";
import type { MastodonStatus } from "@/features/conversation/model/mastodon-status";

// The card is read by a Spanish-speaking audience that also reads English tech posts.
const ALLOWED_LANGUAGES = new Set(["es", "en"]);
// Shorter posts are usually reactions without context; longer ones do not fit three lines.
const MIN_TEXT_LENGTH = 40;
const MAX_TEXT_LENGTH = 280;
const MAX_AGE_MS = 48 * 60 * 60 * 1000;
const SHOWN_TEXT_LENGTH = 200;
const MAX_POSTS = 3;

const isHttpUrl = (value: string) => {
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
};

const isRecent = (createdAt: string, now: Date) => {
  const publishedAt = Date.parse(createdAt);
  if (Number.isNaN(publishedAt)) return false;
  const ageMs = now.getTime() - publishedAt;
  return ageMs >= 0 && ageMs <= MAX_AGE_MS;
};

/**
 * Whether a status is a recent, self-contained post written by a person, safe to show without a
 * content warning. Bridged accounts (brid.gy) repost other networks, so they are left out.
 */
export const isConversationWorthy = (status: MastodonStatus, now: Date): boolean => {
  const textLength = htmlToText(status.content).length;

  return (
    !status.sensitive &&
    status.spoiler_text.trim() === "" &&
    status.in_reply_to_id === null &&
    status.reblog === null &&
    !status.account.bot &&
    !status.account.acct.toLowerCase().includes("brid.gy") &&
    status.language !== null &&
    ALLOWED_LANGUAGES.has(status.language) &&
    textLength >= MIN_TEXT_LENGTH &&
    textLength <= MAX_TEXT_LENGTH &&
    status.url !== null &&
    isHttpUrl(status.url) &&
    isRecent(status.created_at, now)
  );
};

const truncate = (text: string, maxLength: number) => {
  // Code points, so an emoji is never cut in half.
  const characters = Array.from(text);
  if (characters.length <= maxLength) return text;
  return `${characters
    .slice(0, maxLength - 1)
    .join("")
    .trimEnd()}…`;
};

const engagement = (status: MastodonStatus) => status.favourites_count + status.reblogs_count;

const byEngagementThenNewest = (a: MastodonStatus, b: MastodonStatus) =>
  engagement(b) - engagement(a) || Date.parse(b.created_at) - Date.parse(a.created_at);

const toConversationPost = (status: MastodonStatus, url: string): ConversationPost => ({
  id: status.id,
  handle: `@${status.account.acct}`,
  source: "Mastodon",
  text: truncate(htmlToText(status.content), SHOWN_TEXT_LENGTH),
  url,
  publishedAt: new Date(status.created_at).toISOString(),
});

/** The most popular worthy posts, one per account and without the duplicates of several tags. */
export const pickConversations = (statuses: MastodonStatus[], now: Date): ConversationPost[] => {
  const seenIds = new Set<string>();
  const unique = statuses.filter((status) => {
    if (seenIds.has(status.id)) return false;
    seenIds.add(status.id);
    return true;
  });

  const seenAccounts = new Set<string>();
  const posts: ConversationPost[] = [];
  for (const status of unique
    .filter((candidate) => isConversationWorthy(candidate, now))
    .sort(byEngagementThenNewest)) {
    const account = status.account.acct.toLowerCase();
    if (posts.length === MAX_POSTS) break;
    if (seenAccounts.has(account) || status.url === null) continue;
    seenAccounts.add(account);
    posts.push(toConversationPost(status, status.url));
  }
  return posts;
};
