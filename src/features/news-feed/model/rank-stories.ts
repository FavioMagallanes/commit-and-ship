import type { NewsStory } from "@/features/news-feed/model/news-story";
import { popularityScores } from "@/features/news-feed/model/popularity-score";

const RANKING_SIZE = 5;

/**
 * The most discussed stories: highest popularity within their own source first, then more
 * points, then newest. Scores are computed after dropping stories without points, so those
 * cannot inflate the percentiles of the stories that do have them.
 */
export const rankStories = (stories: NewsStory[]): NewsStory[] => {
  const withPoints = stories.filter((story) => story.points > 0);
  const scores = popularityScores(withPoints);

  return withPoints
    .toSorted(
      (a, b) =>
        (scores.get(b) ?? 0) - (scores.get(a) ?? 0) ||
        b.points - a.points ||
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, RANKING_SIZE);
};
