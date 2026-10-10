import { describe, expect, it } from "vitest";

import { matchesQuery, normalizeText } from "@/features/search-filters/model/matches-query";

describe("normalizeText", () => {
  it("lowercases and strips accents", () => {
    expect(normalizeText("Programación ÁGIL")).toBe("programacion agil");
  });

  it("collapses repeated whitespace", () => {
    expect(normalizeText("  hola   mundo ")).toBe("hola mundo");
  });
});

describe("matchesQuery", () => {
  it("matches everything when the query is empty or blank", () => {
    expect(matchesQuery("", ["Rust"])).toBe(true);
    expect(matchesQuery("   ", ["Rust"])).toBe(true);
  });

  it("ignores case and accents on both sides", () => {
    expect(matchesQuery("PROGRAMACION", ["Guía de programación"])).toBe(true);
    expect(matchesQuery("guía", ["Guia rapida"])).toBe(true);
  });

  it("requires every word to appear, in any order", () => {
    expect(matchesQuery("rust bundler", ["Un bundler escrito en Rust"])).toBe(true);
    expect(matchesQuery("rust python", ["Un bundler escrito en Rust"])).toBe(false);
  });

  it("looks across all the given fields", () => {
    expect(matchesQuery("hacker rust", ["Rust bundler", "Hacker News"])).toBe(true);
  });

  it("does not match unrelated text", () => {
    expect(matchesQuery("golang", ["Rust bundler", "Hacker News"])).toBe(false);
  });
});
