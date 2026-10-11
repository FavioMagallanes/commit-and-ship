import type { NewsStory } from "@/features/news-feed/model/news-story";
import { rankStories } from "@/features/news-feed/model/rank-stories";

/** The story to highlight: the first of the ranking, and none while the user is searching. */
export const pickFeaturedStory = (stories: NewsStory[], query: string): NewsStory | null =>
  query.trim() === "" ? (rankStories(stories)[0] ?? null) : null;
