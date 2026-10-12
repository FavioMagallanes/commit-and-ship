import { describe, expect, it } from "vitest";

import { loadTopic } from "@/features/topics/model/topic-params";

const load = (params: Record<string, string | string[] | undefined>) =>
  loadTopic(Promise.resolve(params));

describe("loadTopic", () => {
  it("reads a known topic from the url", async () => {
    await expect(load({ topic: "ia" })).resolves.toBe("ia");
    await expect(load({ topic: "devops", q: "rust" })).resolves.toBe("devops");
  });

  it("reads the blogs source filter from the url", async () => {
    await expect(load({ topic: "blogs" })).resolves.toBe("blogs");
  });

  it("ignores an unknown topic", async () => {
    await expect(load({ topic: "Blogs" })).resolves.toBeNull();
    await expect(load({ topic: "blog" })).resolves.toBeNull();
    await expect(load({ topic: "herramientas" })).resolves.toBeNull();
    await expect(load({ topic: "IA" })).resolves.toBeNull();
  });

  it("is null when the url has no topic", async () => {
    await expect(load({})).resolves.toBeNull();
  });
});
