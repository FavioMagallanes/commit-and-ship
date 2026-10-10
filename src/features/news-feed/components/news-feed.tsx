import { getHackerNewsStories } from "@/features/news-feed/api/get-hacker-news-stories";
import type { NewsStory } from "@/features/news-feed/model/news-story";
import { Icon } from "@/shared/ui/icon";

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
      <div
        role="alert"
        className="flex items-center gap-3 rounded-md border border-danger-line bg-danger-bg p-4 text-danger-text"
      >
        <Icon name="alert" />
        <p>No pudimos cargar Hacker News. Probá de nuevo en unos minutos.</p>
      </div>
    );
  }

  return <NewsList stories={stories} />;
};
