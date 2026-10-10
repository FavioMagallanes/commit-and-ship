import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NewsItem } from "@/features/news-feed/components/news-item";

const props = {
  source: "dev",
  sourceName: "dev.to",
  title: "Guía práctica de observabilidad para equipos pequeños",
  href: "https://dev.to/post",
  tag: "DevOps",
  publishedAt: "2026-10-09T08:00:00Z",
  publishedLabel: "hace 1 d",
} as const;

describe("NewsItem", () => {
  it("is an article whose heading links to the original", () => {
    render(<NewsItem {...props} />);

    const article = screen.getByRole("article");
    expect(article).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3 })).toContainElement(
      screen.getByRole("link", { name: props.title }),
    );
    expect(screen.getByRole("link", { name: props.title })).toHaveAttribute("href", props.href);
  });

  it("shows the source logo, the tag and the source name with the publication time", () => {
    render(<NewsItem {...props} />);

    expect(screen.getByRole("img", { name: "dev.to" })).toBeInTheDocument();
    expect(screen.getByText("DevOps")).toBeInTheDocument();
    expect(screen.getByText("hace 1 d")).toHaveAttribute("datetime", props.publishedAt);
    expect(screen.getByText(/dev\.to ·/)).toBeInTheDocument();
  });
});
