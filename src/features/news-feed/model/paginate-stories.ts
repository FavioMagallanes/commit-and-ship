import type { NewsStory } from "@/features/news-feed/model/news-story";

const PAGE_SIZE = 10;

type StoriesPage = {
  visible: NewsStory[];
  hasMore: boolean;
  /** Limit that shows one more page. */
  nextLimit: number;
};

/** The first `limit` stories; a limit below 1 or not whole shows only the first page. */
export const paginateStories = (stories: NewsStory[], limit: number): StoriesPage => {
  const safeLimit = Number.isInteger(limit) && limit >= 1 ? limit : PAGE_SIZE;

  return {
    visible: stories.slice(0, safeLimit),
    hasMore: stories.length > safeLimit,
    nextLimit: safeLimit + PAGE_SIZE,
  };
};
