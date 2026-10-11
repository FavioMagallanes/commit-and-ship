import type { NewsStory } from "@/features/news-feed/model/news-story";
import { popularityScores } from "@/features/news-feed/model/popularity-score";
import type { SortOrder } from "@/features/search-filters/model/search-params";

export type { SortOrder };

const timeOf = (story: NewsStory) => {
  const time = new Date(story.publishedAt).getTime();
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
};

// Comparing with `<` instead of subtracting keeps two invalid dates (-Infinity) as a tie, not NaN.
const byNewest = (a: NewsStory, b: NewsStory) => {
  const timeA = timeOf(a);
  const timeB = timeOf(b);
  if (timeA === timeB) return 0;
  return timeA > timeB ? -1 : 1;
};

const byPopularity = (stories: NewsStory[]) => {
  const scores = popularityScores(stories);
  return (a: NewsStory, b: NewsStory) =>
    (scores.get(b) ?? 0) - (scores.get(a) ?? 0) || b.points - a.points || byNewest(a, b);
};

/**
 * A sorted copy: newest first for `recent`; for `popular`, highest popularity within its own
 * source first, then more points, then newest.
 */
export const sortStories = (stories: NewsStory[], order: SortOrder): NewsStory[] =>
  stories.toSorted(order === "popular" ? byPopularity(stories) : byNewest);
