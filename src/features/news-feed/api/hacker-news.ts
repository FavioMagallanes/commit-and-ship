import { z } from "zod";

import type { NewsStory } from "@/features/news-feed/model/news-story";

const FRONT_PAGE_URL = "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30";
const DISCUSSION_URL = "https://news.ycombinator.com/item?id=";
const REQUEST_TIMEOUT_MS = 8_000;

const responseSchema = z.object({ hits: z.array(z.unknown()) });

const hitSchema = z.object({
  objectID: z.string().min(1),
  title: z.string().min(1),
  url: z.string().nullish(),
  points: z.number().nullish(),
  num_comments: z.number().nullish(),
  created_at: z.iso.datetime(),
});

const isHttpUrl = (value: string) => {
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
};

export const parseHackerNewsFrontPage = (data: unknown): NewsStory[] => {
  const { hits } = responseSchema.parse(data);

  return hits.flatMap((hit) => {
    const parsed = hitSchema.safeParse(hit);
    if (!parsed.success) return [];

    const { objectID, title, url, points, num_comments, created_at } = parsed.data;

    return [
      {
        id: `hn-${objectID}`,
        source: "hn",
        sourceName: "Hacker News",
        title,
        // Ask HN and similar posts have no external link, so they point to the discussion.
        url: url && isHttpUrl(url) ? url : `${DISCUSSION_URL}${objectID}`,
        publishedAt: new Date(created_at).toISOString(),
        points: points ?? 0,
        commentsCount: num_comments ?? 0,
      },
    ];
  });
};

export const fetchHackerNewsFrontPage = async (
  fetchFn: typeof fetch = fetch,
): Promise<NewsStory[]> => {
  const response = await fetchFn(FRONT_PAGE_URL, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Hacker News request failed with status ${response.status}`);
  }

  return parseHackerNewsFrontPage(await response.json());
};
