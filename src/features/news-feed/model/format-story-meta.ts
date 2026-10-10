/** "Hacker News · 412 pts · 186 comentarios": the source plus whatever counts it has. */
export const formatStoryMeta = (
  sourceName: string,
  points: number | undefined,
  commentsCount: number | undefined,
): string =>
  [
    sourceName,
    ...(points ? [`${points} pts`] : []),
    ...(commentsCount
      ? [`${commentsCount} ${commentsCount === 1 ? "comentario" : "comentarios"}`]
      : []),
  ].join(" · ");
