// Trimmed copy of a real Algolia response: only the fields the adapter reads, plus noise.
export const HACKER_NEWS_FRONT_PAGE = {
  hits: [
    {
      objectID: "50022292",
      title: "Triple-A Minesweeper",
      url: "https://minesweeper.mikelacher.com/",
      points: 1316,
      num_comments: 261,
      created_at: "2026-10-09T15:51:05Z",
      author: "robin_reala",
      _tags: ["story", "front_page"],
    },
    {
      // Ask HN posts have no external url.
      objectID: "50031111",
      title: "Ask HN: What are you building this week?",
      url: null,
      points: 120,
      num_comments: 88,
      created_at: "2026-10-10T09:00:00Z",
      author: "someone",
      _tags: ["story", "ask_hn", "front_page"],
    },
  ],
  nbHits: 2,
  page: 0,
};
