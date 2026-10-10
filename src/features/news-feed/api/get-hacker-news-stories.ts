import { cacheLife, cacheTag } from "next/cache";

import { fetchHackerNewsFrontPage } from "@/features/news-feed/api/hacker-news";
import type { NewsStory } from "@/features/news-feed/model/news-story";

/** Front page of Hacker News, cached on the server and revalidated every 10 minutes. */
export const getHackerNewsStories = async (): Promise<NewsStory[]> => {
  "use cache";
  cacheLife({ revalidate: 600 });
  cacheTag("news", "hacker-news");

  return fetchHackerNewsFrontPage();
};
