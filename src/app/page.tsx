import { Suspense } from "react";

import { NewsFeed } from "@/features/news-feed/components/news-feed";
import { NewsFeedSkeleton } from "@/features/news-feed/components/news-feed-skeleton";
import { ReleaseRadar } from "@/features/release-radar/components/release-radar";
import { ReleaseRadarSkeleton } from "@/features/release-radar/components/release-radar-skeleton";
import { TrendingStories } from "@/features/trending/components/trending-stories";
import { TrendingStoriesSkeleton } from "@/features/trending/components/trending-stories-skeleton";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-bold tracking-widest text-accent-text uppercase">
          Agregador de novedades tech
        </p>
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-ink">
          Commit &amp; Ship
        </h1>
        <p className="max-w-xl text-lg text-muted">
          Novedades de desarrollo de software, sin ruido.
        </p>
      </header>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-labelledby="latest-heading" className="flex flex-col gap-8">
          <h2 id="latest-heading" className="font-heading text-xl font-bold text-ink">
            Más recientes
          </h2>
          <Suspense fallback={<NewsFeedSkeleton />}>
            <NewsFeed />
          </Suspense>
        </section>
        <aside aria-label="Barra lateral" className="flex flex-col gap-8">
          <Suspense fallback={<ReleaseRadarSkeleton />}>
            <ReleaseRadar />
          </Suspense>
          <Suspense fallback={<TrendingStoriesSkeleton />}>
            <TrendingStories />
          </Suspense>
        </aside>
      </div>
    </main>
  );
}
