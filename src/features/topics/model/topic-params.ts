import { createLoader, parseAsStringLiteral } from "nuqs/server";

import { type Topic, topics } from "@/features/topics/model/topics";

/** The chosen topic lives in the url as `?topic=`; an unknown value counts as no topic. */
export const topicParser = parseAsStringLiteral(topics);

const loadTopicParams = createLoader({ topic: topicParser });

export const loadTopic = async (
  searchParams: Promise<Record<string, string | string[] | undefined>>,
): Promise<Topic | null> => (await loadTopicParams(searchParams)).topic;
