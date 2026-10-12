import type { NewsStory } from "@/features/news-feed/model/news-story";
import { rankStories } from "@/features/news-feed/model/rank-stories";

/**
 * The story to highlight: the first of the ranking, and none while the user is searching. A lone
 * story is never highlighted: the list below keeps it, and a list left empty would wrongly say
 * there is nothing to show (and the same story would otherwise appear twice).
 */
export const pickFeaturedStory = (stories: NewsStory[], query: string): NewsStory | null =>
  query.trim() === "" && stories.length > 1 ? (rankStories(stories)[0] ?? null) : null;
