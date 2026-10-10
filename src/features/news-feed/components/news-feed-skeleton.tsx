export const NewsFeedSkeleton = () => (
  <div
    role="status"
    aria-label="Cargando novedades"
    className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface"
  >
    {Array.from({ length: 4 }, (_, index) => (
      <div key={index} className="flex gap-4 p-5 md:px-8 md:py-6">
        <div className="size-10 shrink-0 animate-pulse rounded-md bg-soft" />
        <div className="flex flex-1 flex-col gap-3">
          <div className="h-3 w-full max-w-md animate-pulse rounded-full bg-soft" />
          <div className="h-3 w-2/3 animate-pulse rounded-full bg-soft" />
          <div className="h-2 w-24 animate-pulse rounded-full bg-line" />
        </div>
      </div>
    ))}
  </div>
);
