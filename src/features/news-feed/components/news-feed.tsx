import { connection } from "next/server";

import { getHackerNewsStories } from "@/features/news-feed/api/get-hacker-news-stories";
import type { NewsStory } from "@/features/news-feed/model/news-story";
import { ErrorBanner } from "@/shared/ui/error-banner";

import { NewsList } from "./news-list";

type NewsFeedProps = {
  loadStories?: () => Promise<NewsStory[]>;
  now?: Date;
};

const loadOrNull = async (loadStories: () => Promise<NewsStory[]>) => {
  try {
    return await loadStories();
  } catch {
    return null;
  }
};

export const NewsFeed = async ({ loadStories = getHackerNewsStories, now }: NewsFeedProps) => {
  const stories = await loadOrNull(loadStories);
  // Relative times depend on the current time, so this renders per request (the data stays cached).
  if (!now) await connection();

  if (stories === null) {
    return (
      <ErrorBanner title="No pudimos cargar Hacker News">
        El resto de las fuentes funciona con normalidad.
      </ErrorBanner>
    );
  }

  return <NewsList stories={stories} now={now ?? new Date()} />;
};
