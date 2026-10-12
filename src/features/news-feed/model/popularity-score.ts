import type { NewsStory } from "@/features/news-feed/model/news-story";

/**
 * Points are not comparable across sources (Hacker News votes run in the hundreds, dev.to
 * reactions in the tens), so each story is scored by its percentile within its own source:
 * the share of same-source stories with strictly fewer points. Equal points share a score,
 * the only story of a source gets 1, and every score is in [0, 1]. A story without points
 * (official blog posts never have any) scores 0, so it never outranks a story that has them.
 */
export const popularityScores = (stories: NewsStory[]): ReadonlyMap<NewsStory, number> => {
  const pointsBySource = new Map<NewsStory["source"], number[]>();
  for (const story of stories) {
    const sourcePoints = pointsBySource.get(story.source);
    if (sourcePoints) sourcePoints.push(story.points);
    else pointsBySource.set(story.source, [story.points]);
  }

  return new Map(
    stories.map((story) => {
      const sourcePoints = pointsBySource.get(story.source) ?? [];
      if (story.points <= 0) return [story, 0];
      if (sourcePoints.length <= 1) return [story, 1];
      const fewer = sourcePoints.filter((points) => points < story.points).length;
      return [story, fewer / (sourcePoints.length - 1)];
    }),
  );
};
