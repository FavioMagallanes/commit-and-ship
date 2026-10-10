export const ActivityTerminalSkeleton = () => (
  <div
    role="status"
    aria-label="Cargando novedades recientes"
    className="flex h-48 flex-col gap-3 rounded-xl bg-terminal p-5"
  >
    <div className="h-3 w-32 animate-pulse rounded-full bg-terminal-muted/30" />
    <div className="h-3 w-48 animate-pulse rounded-full bg-terminal-muted/30" />
    <div className="h-3 w-full animate-pulse rounded-full bg-terminal-muted/30" />
  </div>
);
