/** Lowercase, accent-free text with single spaces, so searches ignore case and diacritics. */
export const normalizeText = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/** True when every word of the query appears in at least one of the fields. */
export const matchesQuery = (query: string, fields: string[]): boolean => {
  const words = normalizeText(query).split(" ").filter(Boolean);
  if (words.length === 0) return true;

  const haystack = normalizeText(fields.join(" "));
  return words.every((word) => haystack.includes(word));
};
