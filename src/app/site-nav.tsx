import { Suspense } from "react";
import Link from "next/link";

import { SearchBox } from "@/features/search-filters/components/search-box";
import { ThemeToggle } from "@/features/theme/components/theme-toggle";

export const SiteNav = () => (
  <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 py-4 md:h-19 md:flex-nowrap md:py-0">
    <Link
      href="/"
      aria-label="Commit & Ship, ir al inicio"
      className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-text"
    >
      <span
        aria-hidden="true"
        className="flex size-7 items-center justify-center rounded-sm bg-accent font-mono text-sm font-bold text-on-accent"
      >
        &gt;_
      </span>
      <span className="font-heading text-lg font-bold whitespace-nowrap text-ink">
        Commit &amp; Ship
      </span>
    </Link>
    <div className="order-last w-full md:order-none md:flex md:w-auto md:flex-1 md:justify-center">
      <Suspense>
        <SearchBox />
      </Suspense>
    </div>
    <ThemeToggle />
  </header>
);
