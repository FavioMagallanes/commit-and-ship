import { getHackerNewsStories } from "@/features/news-feed/api/get-hacker-news-stories";
import type { NewsStory } from "@/features/news-feed/model/news-story";
import { ErrorBanner } from "@/shared/ui/error-banner";

import { NewsList } from "./news-list";

type NewsFeedProps = {
  loadStories?: () => Promise<NewsStory[]>;
};

const loadOrNull = async (loadStories: () => Promise<NewsStory[]>) => {
  try {
    return await loadStories();
  } catch {
    return null;
  }
};

export const NewsFeed = async ({ loadStories = getHackerNewsStories }: NewsFeedProps) => {
  const stories = await loadOrNull(loadStories);

  if (stories === null) {
    return (
      <ErrorBanner>No pudimos cargar Hacker News. Prob� de nuevo en unos minutos.</ErrorBanner>
    );
  }

  return <NewsList stories={stories} />;
};
