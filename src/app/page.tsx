import { Suspense } from "react";

import { ActivityTerminal } from "@/features/activity-log/components/activity-terminal";
import { ActivityTerminalSkeleton } from "@/features/activity-log/components/activity-terminal-skeleton";
import { IntroStats } from "@/features/news-feed/components/intro-stats";
import { IntroStatsSkeleton } from "@/features/news-feed/components/intro-stats-skeleton";
import { NewsFeed } from "@/features/news-feed/components/news-feed";
import { NewsFeedSkeleton } from "@/features/news-feed/components/news-feed-skeleton";
import { ReleaseRadar } from "@/features/release-radar/components/release-radar";
import { ReleaseRadarSkeleton } from "@/features/release-radar/components/release-radar-skeleton";
import { loadSearchQuery } from "@/features/search-filters/model/search-params";
import { TrendingStories } from "@/features/trending/components/trending-stories";
import { TrendingStoriesSkeleton } from "@/features/trending/components/trending-stories-skeleton";
import { ACTIVE_SOURCES } from "@/shared/lib/active-sources";

const sourcesLabel = new Intl.ListFormat("es", { type: "conjunction" }).format(ACTIVE_SOURCES);

export default function Home({ searchParams }: PageProps<"/">) {
  // Not awaited here: each block reads the query inside its own Suspense boundary.
  const query = loadSearchQuery(searchParams);

  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-12 px-6 pt-10 pb-12 md:pt-16">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center">
        <header className="flex flex-col gap-6">
          <p className="flex items-center gap-2 text-xs font-bold tracking-widest text-accent-text uppercase">
            <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
            Agregador de novedades tech
          </p>
          <h1 className="font-heading text-4xl leading-tight font-extrabold tracking-tight text-ink">
            Novedades tech, sin ruido.
          </h1>
          <p className="max-w-xl text-lg text-muted">
            Reunimos en un solo lugar lo que publican {sourcesLabel}, ordenado por hora. Sin cuentas
            ni algoritmos.
          </p>
          <Suspense fallback={<IntroStatsSkeleton />}>
            <IntroStats />
          </Suspense>
        </header>
        <Suspense fallback={<ActivityTerminalSkeleton />}>
          <ActivityTerminal />
        </Suspense>
      </div>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-labelledby="latest-heading" className="flex flex-col gap-8">
          <h2 id="latest-heading" className="font-heading text-xl font-bold text-ink">
            Más recientes
          </h2>
          <Suspense fallback={<NewsFeedSkeleton />}>
            <NewsFeed query={query} />
          </Suspense>
        </section>
        <aside aria-label="Barra lateral" className="flex flex-col gap-8">
          <Suspense fallback={<ReleaseRadarSkeleton />}>
            <ReleaseRadar query={query} />
          </Suspense>
          <Suspense fallback={<TrendingStoriesSkeleton />}>
            <TrendingStories />
          </Suspense>
        </aside>
      </div>
    </main>
  );
}
