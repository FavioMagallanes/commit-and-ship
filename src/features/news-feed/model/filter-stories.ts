import type { NewsStory } from "@/features/news-feed/model/news-story";
import { matchesQuery } from "@/features/search-filters/model/matches-query";

export const filterStories = (stories: NewsStory[], query: string): NewsStory[] =>
  stories.filter((story) => matchesQuery(query, [story.title, story.sourceName]));
