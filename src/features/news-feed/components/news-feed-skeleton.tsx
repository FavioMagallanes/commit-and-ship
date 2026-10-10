export const NewsFeedSkeleton = () => (
  <div role="status" aria-label="Cargando novedades" className="flex flex-col gap-4">
    {Array.from({ length: 6 }, (_, index) => (
      <div key={index} className="h-20 animate-pulse rounded-md bg-soft" />
    ))}
  </div>
);
