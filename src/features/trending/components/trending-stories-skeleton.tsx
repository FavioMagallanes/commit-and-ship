export const TrendingStoriesSkeleton = () => (
  <div
    role="status"
    aria-label="Cargando lo más hablado"
    className="flex flex-col gap-6 rounded-xl border border-line bg-surface p-6"
  >
    {Array.from({ length: 5 }, (_, index) => (
      <div key={index} className="flex gap-4">
        <div className="h-5 w-3 animate-pulse rounded-full bg-soft" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-3 w-full animate-pulse rounded-full bg-soft" />
          <div className="h-2 w-12 animate-pulse rounded-full bg-line" />
        </div>
      </div>
    ))}
  </div>
);
