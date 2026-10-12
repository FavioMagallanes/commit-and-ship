import { describe, expect, it } from "vitest";

import { formatStoryMeta } from "@/features/news-feed/model/format-story-meta";

describe("formatStoryMeta", () => {
  it("joins the source with points and comments", () => {
    expect(formatStoryMeta("Hacker News", 412, 186)).toBe(
      "Hacker News · 412 pts · 186 comentarios",
    );
  });

  it("uses the singular for one comment and skips zero values", () => {
    expect(formatStoryMeta("Hacker News", 0, 1)).toBe("Hacker News · 1 comentario");
    expect(formatStoryMeta("dev.to", undefined, undefined)).toBe("dev.to");
  });

  it("shows only the blog name for an official blog post, which has no counts", () => {
    expect(formatStoryMeta("Node.js · Blog oficial", 0, 0)).toBe("Node.js · Blog oficial");
  });
});
