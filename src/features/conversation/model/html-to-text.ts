const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

const MAX_CODE_POINT = 0x10ffff;

const decodeNumericEntity = (entity: string, digits: string, radix: number) => {
  const codePoint = Number.parseInt(digits, radix);
  const isSurrogate = codePoint >= 0xd800 && codePoint <= 0xdfff;
  if (codePoint <= 0 || codePoint > MAX_CODE_POINT || isSurrogate) return entity;
  return String.fromCodePoint(codePoint);
};

// One pass, so "&amp;lt;" becomes "&lt;" and never "<".
const decodeEntities = (text: string) =>
  text.replace(/&(?:#(\d+)|#x([\da-f]+)|([a-z]+));/gi, (entity, decimal, hex, name) => {
    if (decimal) return decodeNumericEntity(entity, decimal, 10);
    if (hex) return decodeNumericEntity(entity, hex, 16);
    return NAMED_ENTITIES[String(name).toLowerCase()] ?? entity;
  });

/**
 * Turns the HTML of a Mastodon post into plain text. The result is shown as text, never as
 * markup, so tags are removed before entities are decoded: an escaped "&lt;script&gt;" stays text.
 */
export const htmlToText = (html: string): string => {
  const withoutCode = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ");
  const withBreaks = withoutCode.replace(/<br\s*\/?>|<\/p\s*>/gi, " ");
  const withoutTags = withBreaks.replace(/<[^>]*>/g, "");

  return decodeEntities(withoutTags).replace(/\s+/g, " ").trim();
};
