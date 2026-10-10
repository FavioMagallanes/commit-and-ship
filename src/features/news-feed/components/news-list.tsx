import type { NewsStory } from "@/features/news-feed/model/news-story";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import { Icon } from "@/shared/ui/icon";

import { NewsItem } from "./news-item";

type NewsListProps = {
  stories: NewsStory[];
  now: Date;
};

const cardClassName = "overflow-hidden rounded-xl border border-line bg-surface";

export const NewsList = ({ stories, now }: NewsListProps) => {
  if (stories.length === 0) {
    return (
      <div className={`${cardClassName} flex flex-col items-center gap-4 px-8 py-10 text-center`}>
        <span className="flex size-16 items-center justify-center rounded-full bg-soft text-muted">
          <Icon name="search-x" />
        </span>
        <h3 className="font-heading text-xl font-bold text-ink">No encontramos novedades</h3>
        <p className="max-w-xs text-md text-muted">Probá de nuevo en unos minutos.</p>
      </div>
    );
  }

  return (
    <ul aria-label="Novedades" className={`${cardClassName} divide-y divide-line`}>
      {stories.map((story) => (
        <li key={story.id}>
          <NewsItem
            source={story.source}
            sourceName={story.sourceName}
            title={story.title}
            href={story.url}
            tag={`${story.points} puntos`}
            publishedAt={story.publishedAt}
            publishedLabel={formatRelativeTime(story.publishedAt, now)}
          />
        </li>
      ))}
    </ul>
  );
};
