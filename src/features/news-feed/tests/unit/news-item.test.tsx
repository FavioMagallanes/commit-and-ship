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

  it("shows points and comments after the source name when the source has them", () => {
    render(<NewsItem {...props} sourceName="Hacker News" points={412} commentsCount={186} />);

    expect(screen.getByText(/Hacker News · 412 pts · 186 comentarios ·/)).toBeInTheDocument();
  });

  it("uses the singular for a single comment and skips zero points", () => {
    render(<NewsItem {...props} sourceName="Hacker News" points={0} commentsCount={1} />);

    expect(screen.getByText(/Hacker News · 1 comentario ·/)).toBeInTheDocument();
    expect(screen.queryByText(/pts/)).not.toBeInTheDocument();
  });

  it("renders no tag pill when there is no topic", () => {
    render(<NewsItem {...props} tag={undefined} />);

    expect(screen.queryByText("DevOps")).not.toBeInTheDocument();
  });

  it("reads an official blog post as the blog name and its time, without counts", () => {
    render(
      <NewsItem
        {...props}
        source="blog"
        sourceName="Node.js · Blog oficial"
        points={0}
        commentsCount={0}
        publishedLabel="hace 8 h"
      />,
    );

    expect(screen.getByRole("img", { name: "Blog" })).toBeInTheDocument();
    expect(screen.getByText("hace 8 h").parentElement).toHaveTextContent(
      /^Node\.js · Blog oficial · hace 8 h$/,
    );
  });
});
