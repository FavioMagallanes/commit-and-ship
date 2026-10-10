export const FeaturedStorySkeleton = () => (
  <div
    role="status"
    aria-label="Cargando noticia destacada"
    className="flex flex-col gap-6 rounded-xl border border-line bg-surface p-6 md:p-8"
  >
    <div className="h-6 w-24 animate-pulse rounded-full bg-soft" />
    <div className="flex flex-col gap-3">
      <div className="h-5 w-full animate-pulse rounded-full bg-soft" />
      <div className="h-5 w-2/3 animate-pulse rounded-full bg-soft" />
    </div>
    <div className="h-4 w-48 animate-pulse rounded-full bg-line" />
  </div>
);
