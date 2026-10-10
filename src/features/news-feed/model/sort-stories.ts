import type { NewsStory } from "@/features/news-feed/model/news-story";
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

const comparators: Record<SortOrder, (a: NewsStory, b: NewsStory) => number> = {
  recent: byNewest,
  popular: (a, b) => b.points - a.points || byNewest(a, b),
};

/** A sorted copy: newest first for `recent`, most points first (newest on ties) for `popular`. */
export const sortStories = (stories: NewsStory[], order: SortOrder): NewsStory[] =>
  stories.toSorted(comparators[order]);
