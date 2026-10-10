import Link from "next/link";

import { ThemeToggle } from "@/features/theme/components/theme-toggle";

export const SiteNav = () => (
  <header className="mx-auto flex h-19 max-w-[1200px] items-center justify-between px-6">
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
      <span className="font-heading text-lg font-bold text-ink">Commit &amp; Ship</span>
    </Link>
    <ThemeToggle />
  </header>
);
