import { retryNews } from "@/features/news-feed/actions/retry-news";
import { getNewsStories } from "@/features/news-feed/api/get-news-snapshot";
import type { NewsStory } from "@/features/news-feed/model/news-story";
import { rankStories } from "@/features/news-feed/model/rank-stories";
import { CardHeader } from "@/shared/ui/card-header";
import { ErrorBanner } from "@/shared/ui/error-banner";
import { RetryButton } from "@/shared/ui/retry-button";

import { RankingRow } from "./ranking-row";

type TrendingStoriesProps = {
  loadStories?: () => Promise<NewsStory[]>;
};

const loadOrNull = async (loadStories: () => Promise<NewsStory[]>) => {
  try {
    return await loadStories();
  } catch {
    return null;
  }
};

export const TrendingStories = async ({ loadStories = getNewsStories }: TrendingStoriesProps) => {
  const stories = await loadOrNull(loadStories);

  return (
    <section
      aria-labelledby="trending-heading"
      className="flex flex-col gap-6 rounded-xl border border-line bg-surface p-6"
    >
      <CardHeader id="trending-heading" title="Lo más hablado hoy" />
      {stories === null ? (
        <ErrorBanner
          title="No pudimos cargar lo más hablado"
          action={<RetryButton action={retryNews} />}
        >
          El resto de las fuentes funciona con normalidad.
        </ErrorBanner>
      ) : (
        <ol className="flex flex-col gap-6">
          {rankStories(stories).map((story, index) => (
            <RankingRow
              key={story.id}
              rank={index + 1}
              title={story.title}
              href={story.url}
              points={story.points}
            />
          ))}
        </ol>
      )}
    </section>
  );
};
