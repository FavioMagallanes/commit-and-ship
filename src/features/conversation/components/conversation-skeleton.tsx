export const ConversationSkeleton = () => (
  <div
    role="status"
    aria-label="Cargando conversaciones"
    className="flex flex-col gap-6 rounded-xl border border-line bg-surface p-6"
  >
    {Array.from({ length: 3 }, (_, index) => (
      <div key={index} className="flex gap-3">
        <div className="size-8 shrink-0 animate-pulse rounded-full bg-soft" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-3 w-24 animate-pulse rounded-full bg-soft" />
          <div className="h-2 w-full animate-pulse rounded-full bg-line" />
          <div className="h-2 w-3/4 animate-pulse rounded-full bg-line" />
        </div>
      </div>
    ))}
  </div>
);
