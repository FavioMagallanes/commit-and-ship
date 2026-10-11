import { connection } from "next/server";

import { getConversationStatuses } from "@/features/conversation/api/get-conversation-statuses";
import type { MastodonStatus } from "@/features/conversation/model/mastodon-status";
import { pickConversations } from "@/features/conversation/model/pick-conversations";
import { CardHeader } from "@/shared/ui/card-header";
import { ErrorBanner } from "@/shared/ui/error-banner";

import { PostRow } from "./post-row";

type ConversationProps = {
  loadStatuses?: () => Promise<MastodonStatus[]>;
  now?: Date;
};

const loadOrNull = async (loadStatuses: () => Promise<MastodonStatus[]>) => {
  try {
    return await loadStatuses();
  } catch {
    return null;
  }
};

export const Conversation = async ({
  loadStatuses = getConversationStatuses,
  now,
}: ConversationProps) => {
  const statuses = await loadOrNull(loadStatuses);
  // The 48-hour window depends on the current time, so the card renders per request (the data
  // stays cached).
  if (!now) await connection();
  const posts = statuses === null ? null : pickConversations(statuses, now ?? new Date());

  return (
    <section
      aria-labelledby="conversation-heading"
      className="flex flex-col gap-6 rounded-xl border border-line bg-surface p-6"
    >
      <CardHeader id="conversation-heading" title="En conversación" />
      {posts === null ? (
        <ErrorBanner title="No pudimos cargar las conversaciones">
          El resto de las fuentes funciona con normalidad.
        </ErrorBanner>
      ) : posts.length === 0 ? (
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
      )}
    </section>
  );
};
