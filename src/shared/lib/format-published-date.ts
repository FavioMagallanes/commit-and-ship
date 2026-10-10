const formatter = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/** Short Spanish date for a UTC instant, or an empty string when the instant is invalid. */
export const formatPublishedDate = (isoInstant: string): string => {
  const date = new Date(isoInstant);
  if (Number.isNaN(date.getTime())) return "";

  return formatter.format(date).replace(".", "");
};
