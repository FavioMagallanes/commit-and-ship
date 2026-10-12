import { connection } from "next/server";

import { retryConversation } from "@/features/conversation/actions/retry-conversation";
import {
  type ConversationResult,
  getConversationResult,
} from "@/features/conversation/api/get-conversation-statuses";
import type { ConversationPost } from "@/features/conversation/model/conversation-post";
import { pickConversations } from "@/features/conversation/model/pick-conversations";
import { CardHeader } from "@/shared/ui/card-header";
import { ErrorBanner, StaleContentBanner } from "@/shared/ui/error-banner";
import { RetryButton } from "@/shared/ui/retry-button";

import { PostRow } from "./post-row";

type ConversationProps = {
  loadStatuses?: () => Promise<ConversationResult>;
  now?: Date;
};

const loadOrNull = async (loadStatuses: () => Promise<ConversationResult>) => {
  try {
    return await loadStatuses();
  } catch {
    return null;
  }
};

const PostList = ({ posts }: { posts: ConversationPost[] }) =>
  posts.length === 0 ? (
    <p className="text-base text-muted">Todavía no hay conversaciones para mostrar.</p>
  ) : (
    <ul className="flex flex-col gap-6">
      {posts.map((post) => (
        <PostRow
          key={post.id}
          handle={post.handle}
          network={post.source}
          text={post.text}
          href={post.url}
        />
      ))}
    </ul>
  );

const renderBody = (result: ConversationResult | null, now: Date) => {
  if (result?.status === "ok") return <PostList posts={pickConversations(result.statuses, now)} />;

  if (result?.stale !== undefined) {
    return (
      <>
        <StaleContentBanner
          title="No pudimos actualizar las conversaciones"
          savedAt={result.stale.savedAt}
          now={now}
          action={<RetryButton action={retryConversation} />}
        />
        <PostList posts={pickConversations(result.stale.statuses, now)} />
      </>
    );
  }

  return (
    <ErrorBanner
      title="No pudimos cargar las conversaciones"
      action={<RetryButton action={retryConversation} />}
    >
      El resto de las fuentes funciona con normalidad.
    </ErrorBanner>
  );
};

export const Conversation = async ({
  loadStatuses = getConversationResult,
  now,
}: ConversationProps) => {
  const result = await loadOrNull(loadStatuses);
  // The 48-hour window depends on the current time, so the card renders per request (the data
  // stays cached).
  if (!now) await connection();

  return (
    <section
      aria-labelledby="conversation-heading"
      className="flex flex-col gap-6 rounded-xl border border-line bg-surface p-6"
    >
      <CardHeader id="conversation-heading" title="En conversación" />
      {renderBody(result, now ?? new Date())}
    </section>
  );
};
