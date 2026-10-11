import type { NewsStory } from "@/features/news-feed/model/news-story";
import { classifyTopic, type Topic } from "@/features/topics/model/topics";

/** Stories of the chosen topic, in their original order; every story when no topic is chosen. */
export const filterByTopic = (stories: NewsStory[], topic: Topic | null): NewsStory[] =>
  topic === null ? stories : stories.filter((story) => classifyTopic(story.title) === topic);
