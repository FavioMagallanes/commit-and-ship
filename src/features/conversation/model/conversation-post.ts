/** A post from a social network, normalized and ready to show in "En conversación". */
export type ConversationPost = {
  id: string;
  /** "@" plus the account, for example "@alice" or "@bruno@fosstodon.org". */
  handle: string;
  source: "Mastodon";
  /** Plain text, already shortened for the card. */
  text: string;
  /** Always an http(s) url. */
  url: string;
  /** ISO 8601 instant in UTC. */
  publishedAt: string;
};
