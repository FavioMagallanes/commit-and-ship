import { describe, expect, it } from "vitest";

import {
  classifyTopic,
  topicFilterLabels,
  topicFilters,
  topicLabels,
  topics,
} from "@/features/topics/model/topics";

describe("topics", () => {
  it("lists the topics in display order with their labels", () => {
    expect(topics.map((topic) => topicLabels[topic])).toEqual([
      "IA",
      "Frontend",
      "Backend",
      "DevOps",
      "Seguridad",
      "Lenguajes",
    ]);
  });

  it("offers every topic plus the Blogs source filter, last", () => {
    expect(topicFilters.map((filter) => topicFilterLabels[filter])).toEqual([
      "IA",
      "Frontend",
      "Backend",
      "DevOps",
      "Seguridad",
      "Lenguajes",
      "Blogs",
    ]);
  });

  it("never classifies a title as blogs, which is a source and not a topic", () => {
    expect(classifyTopic("Our new blogs post about blogs")).toBeNull();
  });
});

describe("classifyTopic", () => {
  it.each([
    ["OpenAI releases a new GPT model", "ia"],
    ["Show HN: A local LLM that runs on a Raspberry Pi", "ia"],
    ["Cómo la Inteligencia Artificial cambia el soporte técnico", "ia"],
    ["React 20 ships a faster renderer for the DOM", "frontend"],
    ["Una guía de CSS moderno para principiantes", "frontend"],
    ["Next.js adds partial prerendering by default", "frontend"],
    ["Postgres 18 brings faster index builds", "backend"],
    ["Diseñando una API con GraphQL", "backend"],
    ["Kubernetes 1.34 drops Docker shim leftovers", "devops"],
    ["Linux kernel 7.0 is out", "devops"],
    ["Terraform y la infraestructura como código", "devops"],
    ["Critical vulnerability found in OpenSSH", "seguridad"],
    ["Cifrado de extremo a extremo para todos", "seguridad"],
    ["Ransomware gang hits hospitals", "seguridad"],
    ["Rust 1.90 stabilizes async closures", "lenguajes"],
    ["Python 3.15 removes the GIL", "lenguajes"],
    ["Novedades de C++ 26", "lenguajes"],
    ["Why C# still matters", "lenguajes"],
  ])("classifies %j as %s", (title, topic) => {
    expect(classifyTopic(title)).toBe(topic);
  });

  it("returns null for an unrelated title", () => {
    expect(classifyTopic("Triple-A Minesweeper")).toBeNull();
    expect(classifyTopic("Guía de programación")).toBeNull();
  });

  it("picks the first topic in priority order when several match", () => {
    expect(classifyTopic("A vulnerability in the Rust standard library")).toBe("seguridad");
    expect(classifyTopic("Writing an AI agent in Python")).toBe("ia");
    expect(classifyTopic("A TypeScript API for React apps")).toBe("lenguajes");
    expect(classifyTopic("Deploying a React app with Docker")).toBe("frontend");
    expect(classifyTopic("Running Postgres on Kubernetes")).toBe("backend");
  });

  it("matches whole words, never substrings", () => {
    expect(classifyTopic("In trust we build")).toBeNull();
    expect(classifyTopic("He said it was fine")).toBeNull();
    expect(classifyTopic("Django turns twenty")).toBeNull();
    expect(classifyTopic("Hitting the target")).toBeNull();
  });

  it("ignores case and accents", () => {
    expect(classifyTopic("INTELIGENCIA ARTIFICIAL en la escuela")).toBe("ia");
    expect(classifyTopic("Seguridad y privacidad")).toBe("seguridad");
    expect(classifyTopic("Un compilador escrito a mano")).toBe("lenguajes");
  });

  it("handles keywords with symbols and dots", () => {
    expect(classifyTopic("Learning c++ the hard way")).toBe("lenguajes");
    expect(classifyTopic("Migrating from nextjs to Remix")).toBe("frontend");
    expect(classifyTopic("CI/CD pipelines that do not hurt")).toBe("devops");
  });
});
