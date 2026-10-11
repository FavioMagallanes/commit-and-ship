"use client";

import { useQueryState } from "nuqs";

import { topicParser } from "@/features/topics/model/topic-params";
import { type Topic, topicLabels, topics } from "@/features/topics/model/topics";
import { Chip } from "@/shared/ui/chip";

const topicQueryParser = topicParser.withOptions({ shallow: false, scroll: false });

export const TopicChips = () => {
  const [selected, setSelected] = useQueryState("topic", topicQueryParser);

  // Clicking the chip that is already pressed goes back to every topic.
  const toggle = (topic: Topic) => void setSelected(selected === topic ? null : topic);

  return (
    <section aria-label="Filtrar por tema">
      <ul className="flex flex-nowrap gap-2 overflow-x-auto pb-1 lg:flex-wrap">
        <li className="shrink-0">
          <Chip active={selected === null} onClick={() => void setSelected(null)}>
            Todo
          </Chip>
        </li>
        {topics.map((topic) => (
          <li key={topic} className="shrink-0">
            <Chip active={selected === topic} onClick={() => toggle(topic)}>
              {topicLabels[topic]}
            </Chip>
          </li>
        ))}
      </ul>
    </section>
  );
};
