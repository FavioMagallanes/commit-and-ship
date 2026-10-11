type DenyCategory = "adult" | "slur" | "harassment" | "scam";

// Public hashtag timelines are not curated, so the card filters what it shows. The lists are
// intentionally conservative: only high-confidence terms, never words with an ordinary technical
// meaning ("kill", "slave", "execute", "dead", "crack", "attack"). Extend them by adding entries;
// every term is normalized like the text, and multi-word entries match as whole-word phrases.
const DENY_TERMS: Record<DenyCategory, readonly string[]> = {
  adult: [
    "porn",
    "porno",
    "pornhub",
    "nsfw",
    "nudes",
    "hentai",
    "onlyfans",
    "sexcam",
    "contenido para adultos",
    "fotos desnudas",
  ],
  // Written in leetspeak so the source does not spell slurs out; normalization reads them back.
  slur: [
    "n1gg3r",
    "n1gg3rs",
    "n1gg4",
    "f4gg0t",
    "f4gg0ts",
    "r3t4rd",
    "r3t4rds",
    "r3t4rd3d",
    "tr4nny",
    "k1k3",
    "m4r1c0n",
    "m4r1c0n3s",
    "sud4c4",
    "sud4c4s",
    "n3gr4t4",
  ],
  harassment: [
    "kill yourself",
    "kys",
    "neck yourself",
    "matate",
    "suicidate",
    "muerete",
    "ojala te mueras",
  ],
  // "betting" alone is left out on purpose: "betting on TypeScript" is ordinary tech English.
  scam: [
    "crypto giveaway",
    "bitcoin giveaway",
    "free crypto",
    "free bitcoin",
    "airdrop",
    "airdrops",
    "dm me",
    "whatsapp",
    "telegram",
    "click here",
    "limited offer",
    "limited time offer",
    "free money",
    "casino",
    "casinos",
    "sports betting",
    "betting tips",
    "online betting",
    "viagra",
    "cialis",
    "haz clic aqui",
    "clic aqui",
    "click aqui",
    "oferta limitada",
    "dinero gratis",
    "dinero facil",
    "apuestas deportivas",
  ],
};

export type ContentIssue =
  DenyCategory | "hashtags" | "links" | "caps" | "emojis" | "repeated-character";

// "earn $", "gana 300 dólares": promises of money, checked before leetspeak turns "$" into "s".
const MONEY_BAIT =
  /\b(?:earn|gana|gane|ganar)\s*(?:[$€£]|\d[\d.,]*\s*(?:[$€£]|usd|dolares|euros)(?!\p{L}))/u;

const MAX_HASHTAGS = 3;
const MAX_LINKS = 2;
const MIN_LETTERS_FOR_CAPS = 21;
const MAX_CAPS_RATIO = 0.6;

// A hashtag starts the text or follows a space, so "C#" is not one.
const HASHTAG = /(?:^|\s)#[\p{L}\p{N}_]+/gu;
const LINK = /\bhttps?:\/\/\S+/gi;
// Four or more emojis in a row, spaces allowed; a ZWJ sequence or a skin tone counts as one.
const EMOJI_RUN =
  /(?:\p{Extended_Pictographic}(?:\u{FE0F}|[\u{1F3FB}-\u{1F3FF}]|\u{200D}\p{Extended_Pictographic})*\s*){4,}/u;
// Digits are left out, so "1000000" is a number and not spam.
const REPEATED_CHARACTER = /([^\s\d])\1{5,}/u;

const LEET: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  $: "s",
};

const stripAccents = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

const toTokens = (text: string) =>
  Array.from(stripAccents(text), (character) => LEET[character] ?? character)
    .join("")
    .replace(/(\p{L})\1{2,}/gu, "$1$1")
    .split(/[^\p{L}]+/u)
    .filter((token) => token !== "");

// Spaces around both sides make phrase matching respect word boundaries.
const toPhrase = (text: string) => ` ${toTokens(text).join(" ")} `;

const DENY_CATEGORIES: readonly DenyCategory[] = ["adult", "slur", "harassment", "scam"];

const DENY_PHRASES = DENY_CATEGORIES.flatMap((category) =>
  DENY_TERMS[category].map((term) => ({ category, phrase: toPhrase(term) })),
);

const capsRatioIsTooHigh = (text: string) => {
  const cased = Array.from(text).filter(
    (character) => character.toLowerCase() !== character.toUpperCase(),
  );
  const capitals = cased.filter((character) => character !== character.toLowerCase());
  return cased.length >= MIN_LETTERS_FOR_CAPS && capitals.length / cased.length > MAX_CAPS_RATIO;
};

const findStructuralIssue = (text: string): ContentIssue | null => {
  if ((text.match(HASHTAG) ?? []).length > MAX_HASHTAGS) return "hashtags";
  if ((text.match(LINK) ?? []).length > MAX_LINKS) return "links";
  if (capsRatioIsTooHigh(text)) return "caps";
  if (EMOJI_RUN.test(text)) return "emojis";
  if (REPEATED_CHARACTER.test(text)) return "repeated-character";
  return null;
};

/**
 * Why a post text should not be shown, or null when it is acceptable. Matching is on whole
 * words after normalizing case, accents, leetspeak and long letter runs, so "class" or
 * "Scunthorpe" never match a shorter term they contain.
 */
export const findContentIssue = (text: string): ContentIssue | null => {
  const phrase = toPhrase(text);
  const denied = DENY_PHRASES.find((entry) => phrase.includes(entry.phrase));
  if (denied) return denied.category;
  if (MONEY_BAIT.test(stripAccents(text))) return "scam";
  return findStructuralIssue(text);
};

export const isAcceptableText = (text: string): boolean => findContentIssue(text) === null;
