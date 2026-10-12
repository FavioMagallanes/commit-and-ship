import { createLoader, parseAsStringLiteral } from "nuqs/server";

import { type TopicFilter, topicFilters } from "@/features/topics/model/topics";

/** The chosen topic lives in the url as `?topic=`; an unknown value counts as no topic. */
export const topicParser = parseAsStringLiteral(topicFilters);

const loadTopicParams = createLoader({ topic: topicParser });

export const loadTopic = async (
  searchParams: Promise<Record<string, string | string[] | undefined>>,
): Promise<TopicFilter | null> => (await loadTopicParams(searchParams)).topic;
