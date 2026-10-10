import type { NewsStory } from "@/features/news-feed/model/news-story";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Stories published within the last 24 hours. Invalid dates never count. */
export const countRecentStories = (stories: NewsStory[], now: Date): number =>
  stories.filter((story) => {
    const published = new Date(story.publishedAt).getTime();
    return !Number.isNaN(published) && now.getTime() - published < DAY_MS;
  }).length;
