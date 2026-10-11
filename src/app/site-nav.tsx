import { Suspense } from "react";
import Link from "next/link";

import { SearchBox } from "@/features/search-filters/components/search-box";
import { ThemeToggle } from "@/features/theme/components/theme-toggle";
import { SourcesMenu } from "@/shared/ui/sources-menu";

export const SiteNav = () => (
  <header className="mx-auto flex max-w-[1200px] flex-nowrap items-center justify-between gap-4 px-6 py-4 md:h-19 md:py-0">
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
    {/* The mobile page shows its own search field below the intro. */}
    <div className="hidden md:flex md:flex-1 md:justify-center">
      <Suspense>
        <SearchBox />
      </Suspense>
    </div>
    <div className="flex items-center gap-2 md:gap-6">
      <SourcesMenu />
      {/* Mobile shows [theme, menu]; desktop keeps the design order [Fuentes, theme]. */}
      <div className="order-first flex md:order-none">
        <ThemeToggle />
      </div>
    </div>
  </header>
);
