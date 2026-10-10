import { Suspense } from "react";

import { NewsFeed } from "@/features/news-feed/components/news-feed";
import { NewsFeedSkeleton } from "@/features/news-feed/components/news-feed-skeleton";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
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
      <section aria-labelledby="latest-heading" className="flex flex-col gap-4">
        <h2 id="latest-heading" className="font-heading text-xl font-bold text-ink">
          Más recientes
        </h2>
        <Suspense fallback={<NewsFeedSkeleton />}>
          <NewsFeed />
        </Suspense>
      </section>
    </main>
  );
}
