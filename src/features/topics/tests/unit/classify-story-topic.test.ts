import { describe, expect, it } from "vitest";

import { classifyStoryTopic, classifyTags } from "@/features/topics/model/topics";

describe("classifyTags", () => {
  it.each([
    [["ai"], "ia"],
    [["machinelearning"], "ia"],
    [["webdev"], "frontend"],
    [["javascript"], "frontend"],
    [["react"], "frontend"],
    [["devops"], "devops"],
    [["docker"], "devops"],
    [["kubernetes"], "devops"],
    [["security"], "seguridad"],
    [["python"], "lenguajes"],
    [["rust"], "lenguajes"],
    [["go"], "lenguajes"],
    [["backend"], "backend"],
    [["database"], "backend"],
    [["node"], "backend"],
    [["nextjs"], "frontend"],
  ] as const)("classifies %j as %s", (tags, topic) => {
    expect(classifyTags(tags)).toBe(topic);
  });

  it("returns null for no tags or unknown tags", () => {
    expect(classifyTags([])).toBeNull();
    expect(classifyTags(["career", "productivity"])).toBeNull();
  });

  it("ignores case and surrounding spaces", () => {
    expect(classifyTags([" Docker "])).toBe("devops");
  });

  it("picks the first topic in priority order when several tags match", () => {
    expect(classifyTags(["webdev", "security"])).toBe("seguridad");
    expect(classifyTags(["docker", "ai"])).toBe("ia");
  });
});

describe("classifyStoryTopic", () => {
  it("uses the title when it matches a topic", () => {
    expect(classifyStoryTopic({ title: "Kubernetes in practice", tags: ["ai"] })).toBe("devops");
  });

  it("falls back to the tags when the title says nothing", () => {
    expect(classifyStoryTopic({ title: "Ten lessons from my first year", tags: ["react"] })).toBe(
      "frontend",
    );
  });

  it("classifies stories without tags by their title only", () => {
    expect(classifyStoryTopic({ title: "Rust 1.90 is out" })).toBe("lenguajes");
    expect(classifyStoryTopic({ title: "Triple-A Minesweeper" })).toBeNull();
  });
});
