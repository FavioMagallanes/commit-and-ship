import { Suspense } from "react";

import { ActivityTerminal } from "@/features/activity-log/components/activity-terminal";
import { ActivityTerminalSkeleton } from "@/features/activity-log/components/activity-terminal-skeleton";
import { Conversation } from "@/features/conversation/components/conversation";
import { ConversationSkeleton } from "@/features/conversation/components/conversation-skeleton";
import { FeaturedStory } from "@/features/news-feed/components/featured-story";
import { FeaturedStorySkeleton } from "@/features/news-feed/components/featured-story-skeleton";
import { IntroStats } from "@/features/news-feed/components/intro-stats";
import { IntroStatsSkeleton } from "@/features/news-feed/components/intro-stats-skeleton";
import { NewsFeed } from "@/features/news-feed/components/news-feed";
import { NewsFeedSkeleton } from "@/features/news-feed/components/news-feed-skeleton";
import { SortSelect } from "@/features/news-feed/components/sort-select";
import { UpdatedStatus } from "@/features/news-feed/components/updated-status";
import { UpdatedStatusSkeleton } from "@/features/news-feed/components/updated-status-skeleton";
import { ReleaseRadar } from "@/features/release-radar/components/release-radar";
import { ReleaseRadarSkeleton } from "@/features/release-radar/components/release-radar-skeleton";
import { SearchBox } from "@/features/search-filters/components/search-box";
import { loadFeedControls, loadSearchQuery } from "@/features/search-filters/model/search-params";
import { TopicChips } from "@/features/topics/components/topic-chips";
import { loadTopic } from "@/features/topics/model/topic-params";
import { TrendingStories } from "@/features/trending/components/trending-stories";
import { TrendingStoriesSkeleton } from "@/features/trending/components/trending-stories-skeleton";
import { ACTIVE_SOURCES } from "@/shared/lib/active-sources";

const listSourceNames = (kind: (typeof ACTIVE_SOURCES)[number]["kind"]) =>
  new Intl.ListFormat("es", { type: "conjunction" }).format(
    ACTIVE_SOURCES.filter((source) => source.kind === kind).map((source) => source.name),
  );

const feedSourcesLabel = listSourceNames("feed");
const conversationSourcesLabel = listSourceNames("conversation");

export default function Home({ searchParams }: PageProps<"/">) {
  // Not awaited here: each block reads the query inside its own Suspense boundary.
  const query = loadSearchQuery(searchParams);
  const feedControls = loadFeedControls(searchParams);
  const sort = feedControls.then((controls) => controls.sort);
  const limit = feedControls.then((controls) => controls.limit);
  const topic = loadTopic(searchParams);

  return (
    <main className="mx-auto flex max-w-[1248px] flex-col gap-12 px-6 pt-10 pb-12 md:pt-16 lg:gap-18">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center">
        <header className="flex flex-col gap-6">
          <p className="flex items-center gap-2 text-xs font-bold tracking-widest text-accent-text uppercase">
            <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
            Agregador de novedades tech
          </p>
          <h1 className="font-heading text-4xl leading-tight font-extrabold tracking-tight text-ink">
            Novedades tech, sin ruido.
          </h1>
          <p className="max-w-xl text-lg text-muted">
            {/* Small screens have no conversation card, so their copy names only the feed. */}
            <span className="md:hidden">
              Lo que publican {feedSourcesLabel}, ordenado por hora. Sin cuentas ni algoritmos.
            </span>
            <span className="hidden md:inline">
              Reunimos en un solo lugar lo que publican {feedSourcesLabel} y lo que se conversa en{" "}
              {conversationSourcesLabel}, ordenado por hora. Sin cuentas ni algoritmos.
            </span>
          </p>
          <Suspense fallback={<IntroStatsSkeleton />}>
            <IntroStats />
          </Suspense>
          <Suspense fallback={<UpdatedStatusSkeleton />}>
            <UpdatedStatus />
          </Suspense>
          {/* The nav search is hidden below md, so small screens get this one instead. */}
          <div className="md:hidden [&>form]:max-w-none">
            <Suspense>
              <SearchBox />
            </Suspense>
          </div>
          <Suspense>
            <TopicChips />
          </Suspense>
        </header>
        <Suspense fallback={<ActivityTerminalSkeleton />}>
          <ActivityTerminal />
        </Suspense>
      </div>
      {/* One grid so small screens stack featured, sidebar and latest in that order. */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-x-10">
        <div className="empty:hidden lg:col-start-1 lg:row-start-1">
          <Suspense fallback={<FeaturedStorySkeleton />}>
            <FeaturedStory query={query} topic={topic} />
          </Suspense>
        </div>
        <aside
          aria-label="Barra lateral"
          className="flex flex-col gap-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
        >
          <Suspense fallback={<ReleaseRadarSkeleton />}>
            <ReleaseRadar query={query} />
          </Suspense>
          <div className="hidden lg:block">
            <Suspense fallback={<TrendingStoriesSkeleton />}>
              <TrendingStories />
            </Suspense>
          </div>
          <div className="hidden lg:block">
            <Suspense fallback={<ConversationSkeleton />}>
              <Conversation />
            </Suspense>
          </div>
        </aside>
        <section
          aria-labelledby="latest-heading"
          className="flex flex-col gap-8 lg:col-start-1 lg:row-start-2"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 id="latest-heading" className="font-heading text-xl font-bold text-ink">
              Más recientes
            </h2>
            <Suspense>
              <SortSelect />
            </Suspense>
          </div>
          <Suspense fallback={<NewsFeedSkeleton />}>
            <NewsFeed query={query} sort={sort} limit={limit} topic={topic} />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
