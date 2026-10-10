// Keep in sync with the sources the home page really aggregates.
const SOURCES = ["Hacker News", "GitHub"];

export const SiteFooter = () => (
  <footer className="mx-auto max-w-[1200px] px-6">
    <hr className="border-line" />
    <div className="flex flex-col gap-2 py-8 md:flex-row md:items-center md:justify-between">
      <p className="text-base text-muted">Commit &amp; Ship · Agregador de novedades tech</p>
      <p className="text-sm text-faint">Fuentes: {SOURCES.join(" · ")}</p>
    </div>
  </footer>
);
