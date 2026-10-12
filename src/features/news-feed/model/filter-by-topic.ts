import type { NewsStory } from "@/features/news-feed/model/news-story";
import { classifyStoryTopic, type TopicFilter } from "@/features/topics/model/topics";

const matchesFilter = (story: NewsStory, filter: TopicFilter): boolean =>
  filter === "blogs" ? story.source === "blog" : classifyStoryTopic(story) === filter;

/** Stories of the chosen filter, in their original order; every story when none is chosen. */
export const filterByTopic = (stories: NewsStory[], topic: TopicFilter | null): NewsStory[] =>
  topic === null ? stories : stories.filter((story) => matchesFilter(story, topic));
