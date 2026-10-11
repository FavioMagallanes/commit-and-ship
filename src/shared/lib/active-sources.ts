type ActiveSource = {
  name: string;
  url: string;
};

// Single source of truth for what the product aggregates today; add one when its adapter ships.
export const ACTIVE_SOURCES: ActiveSource[] = [
  { name: "Hacker News", url: "https://news.ycombinator.com" },
  { name: "GitHub", url: "https://github.com" },
  { name: "dev.to", url: "https://dev.to" },
  { name: "Mastodon", url: "https://mastodon.social" },
];
