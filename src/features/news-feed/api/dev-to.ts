import { z } from "zod";

import type { NewsStory } from "@/features/news-feed/model/news-story";

// top=1 asks for the most popular articles of the last day.
const TOP_ARTICLES_URL = "https://dev.to/api/articles?per_page=30&top=1";
const REQUEST_TIMEOUT_MS = 8_000;

const responseSchema = z.array(z.unknown());

const articleSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  url: z.string(),
  published_timestamp: z.iso.datetime({ offset: true }),
  public_reactions_count: z.number().nullish(),
  comments_count: z.number().nullish(),
  tag_list: z.array(z.string()).nullish(),
});

const isHttpUrl = (value: string) => {
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
};

export const parseDevToArticles = (data: unknown): NewsStory[] =>
  responseSchema.parse(data).flatMap((article) => {
    const parsed = articleSchema.safeParse(article);
    // The article url is the only link there is, so an unsafe one drops the article.
    if (!parsed.success || !isHttpUrl(parsed.data.url)) return [];

    const {
      id,
      title,
      url,
      published_timestamp,
      public_reactions_count,
      comments_count,
      tag_list,
    } = parsed.data;

    return [
      {
        id: `devto-${id}`,
        source: "dev",
        sourceName: "dev.to",
        title,
        url,
        publishedAt: new Date(published_timestamp).toISOString(),
        points: public_reactions_count ?? 0,
        commentsCount: comments_count ?? 0,
        tags: tag_list ?? [],
      },
    ];
  });

export const fetchDevToTopArticles = async (
  fetchFn: typeof fetch = fetch,
): Promise<NewsStory[]> => {
  const response = await fetchFn(TOP_ARTICLES_URL, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`dev.to request failed with status ${response.status}`);
  }

  return parseDevToArticles(await response.json());
};
