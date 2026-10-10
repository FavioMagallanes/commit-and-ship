import type { NewsStory } from "@/features/news-feed/model/news-story";
import { formatPublishedDate } from "@/shared/lib/format-published-date";
import { Icon } from "@/shared/ui/icon";

import { NewsItem } from "./news-item";

type NewsListProps = {
  stories: NewsStory[];
};

export const NewsList = ({ stories }: NewsListProps) => {
  if (stories.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-muted">
        <Icon name="search-x" />
        <p>No hay novedades para mostrar.</p>
      </div>
    );
  }

  return (
    <ul aria-label="Novedades" className="divide-y divide-line">
      {stories.map((story) => (
        <li key={story.id}>
          <NewsItem
            source={story.source}
            sourceName={story.sourceName}
            title={story.title}
            href={story.url}
            tag={`${story.points} puntos`}
            publishedAt={story.publishedAt}
            publishedLabel={formatPublishedDate(story.publishedAt)}
          />
        </li>
      ))}
    </ul>
  );
};
