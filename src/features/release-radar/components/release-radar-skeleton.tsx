export const ReleaseRadarSkeleton = () => (
  <div
    role="status"
    aria-label="Cargando radar de versiones"
    className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-6"
  >
    {Array.from({ length: 5 }, (_, index) => (
      <div key={index} className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-3 w-24 animate-pulse rounded-full bg-soft" />
          <div className="h-2 w-16 animate-pulse rounded-full bg-line" />
        </div>
        <div className="h-3 w-12 animate-pulse rounded-full bg-soft" />
      </div>
    ))}
  </div>
);
