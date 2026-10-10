import type { NewsStory } from "@/features/news-feed/model/news-story";

const RANKING_SIZE = 5;

/** The most discussed stories: highest points first, newest first on ties. */
export const rankStories = (stories: NewsStory[]): NewsStory[] =>
  stories
    .filter((story) => story.points > 0)
    .toSorted(
      (a, b) =>
        b.points - a.points ||
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, RANKING_SIZE);
