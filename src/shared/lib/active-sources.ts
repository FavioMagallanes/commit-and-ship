type ActiveSource = {
  name: string;
  url: string;
  /** "feed" sources fill the hour-ordered list; "conversation" ones only the En conversación card. */
  kind: "feed" | "conversation";
};

// Single source of truth for what the product aggregates today; add one when its adapter ships.
export const ACTIVE_SOURCES: ActiveSource[] = [
  { name: "Hacker News", url: "https://news.ycombinator.com", kind: "feed" },
  { name: "GitHub", url: "https://github.com", kind: "feed" },
  { name: "dev.to", url: "https://dev.to", kind: "feed" },
  { name: "Mastodon", url: "https://mastodon.social", kind: "conversation" },
];
