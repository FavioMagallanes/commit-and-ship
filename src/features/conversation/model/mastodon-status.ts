import { z } from "zod";

/**
 * The fields of a Mastodon status the feature reads. Everything else in the API response is
 * ignored, and every value is still untrusted external content.
 */
export const mastodonStatusSchema = z.object({
  id: z.string().min(1),
  url: z.string().nullable(),
  created_at: z.string(),
  /** HTML; only ever turned into plain text, never rendered as markup. */
  content: z.string(),
  language: z
    .string()
    .nullish()
    .transform((language) => language ?? null),
  sensitive: z.boolean(),
  spoiler_text: z.string(),
  in_reply_to_id: z
    .string()
    .nullish()
    .transform((id) => id ?? null),
  reblog: z.unknown().transform((reblog) => reblog ?? null),
  favourites_count: z.number().int().nonnegative(),
  reblogs_count: z.number().int().nonnegative(),
  account: z.object({
    acct: z.string().min(1),
    bot: z.boolean(),
    url: z.string(),
  }),
});

export type MastodonStatus = z.output<typeof mastodonStatusSchema>;
