type ActiveSource = {
  /** Proper name, as the footer and the sources menu list it. */
  name: string;
  /** How the intro sentence names it, when the proper name does not read well there. */
  proseName?: string;
  url: string;
  /** "feed" sources fill the hour-ordered list; "conversation" ones only the En conversación card. */
  kind: "feed" | "conversation";
};

// Single source of truth for what the product aggregates today; add one when its adapter ships.
export const ACTIVE_SOURCES: ActiveSource[] = [
  { name: "Hacker News", url: "https://news.ycombinator.com", kind: "feed" },
  { name: "GitHub", url: "https://github.com", kind: "feed" },
  { name: "dev.to", url: "https://dev.to", kind: "feed" },
  {
    name: "Blogs oficiales",
    proseName: "los blogs oficiales",
    url: "https://nodejs.org/en/blog",
    kind: "feed",
  },
  { name: "Mastodon", url: "https://mastodon.social", kind: "conversation" },
];
