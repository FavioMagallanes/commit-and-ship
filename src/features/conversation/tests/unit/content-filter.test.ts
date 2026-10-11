import { describe, expect, it } from "vitest";

import { findContentIssue, isAcceptableText } from "@/features/conversation/model/content-filter";

const letters = (alphabet: string, length: number) =>
  Array.from({ length }, (_, index) => alphabet[index % alphabet.length]).join("");

describe("isAcceptableText", () => {
  it("accepts an ordinary post and the empty string", () => {
    expect(isAcceptableText("Migré un proyecto a monolito modular y la complejidad bajó.")).toBe(
      true,
    );
    // Length is a rule of the caller, not of the content filter.
    expect(isAcceptableText("")).toBe(true);
  });

  it.each([
    ["Check out my OnlyFans for exclusive content tonight"],
    ["New p0rn site just dropped, link in bio"],
    ["PORN everywhere on this tag"],
    ["Fotos gratis, pórno sin censura"],
    ["Nuevo contenido para adultos en mi perfil"],
    ["Daily NSFW drops for my followers"],
  ])("rejects adult content: %s", (text) => {
    expect(findContentIssue(text)).toBe("adult");
  });

  it.each([
    ["you are such a r3t4rd for using tabs"],
    ["what a RETARD take on frameworks"],
    ["sos un marïcón si usás Windows"],
    ["típico sud4c4 programando en PHP"],
  ])("rejects slurs, including leetspeak and accents: %s", (text) => {
    expect(findContentIssue(text)).toBe("slur");
  });

  it.each([
    ["Just kys already, nobody wants your takes"],
    ["you should k1ll yourself, seriously"],
    ["Mátate, nadie lee tu blog"],
    ["Ojalá te mueras con tu framework"],
  ])("rejects harassment bait: %s", (text) => {
    expect(findContentIssue(text)).toBe("harassment");
  });

  it.each([
    ["Huge crypto giveaway, send 1 ETH and get 2 back"],
    ["Claim your AIRDROP now before it ends"],
    ["DM me for the details of this remote job"],
    ["Escribime por WhatsApp para más info del curso"],
    ["Join our Telegram for daily trading signals"],
    ["Click here to win a brand new laptop"],
    ["Limited offer: every course at 90% off"],
    ["Earn $500 a day from home with this trick"],
    ["Gana 300 dólares por día sin experiencia previa"],
    ["Free m0ney for every developer who signs up"],
    ["Best online casino bonuses this week"],
    ["Sports betting tips that never lose"],
    ["Cheap v1agra shipped worldwide"],
    ["Haz clic aquí para reclamar tu premio"],
    ["Oferta limitada en cursos de programación"],
    ["Dinero fácil desde tu casa, sin jefes"],
  ])("rejects scams and spam: %s", (text) => {
    expect(findContentIssue(text)).toBe("scam");
  });

  it("matches whole words, so innocent words that contain a term pass", () => {
    const text =
      "We assess every class in the Essex office; Scunthorpe and Sussex teams use the cockpit " +
      "simulator. Un telegrama, la casa, el fagot y el sudafricano también.";

    expect(findContentIssue(text)).toBeNull();
  });

  it.each([
    ["kill -9 the stuck worker and restart it"],
    ["Merge into the master branch before the release"],
    ["The master/slave replication lag is back again"],
    ["Execute the migration off-peak, executing it at noon took ages"],
    ["Delete dead code before it rots the whole module"],
    ["Let's crack the problem of flaky tests this sprint"],
    ["This crashes in production every Friday at 5pm"],
    ["Reduce your attack surface by dropping unused deps"],
    ["Global mutable state is shooting yourself in the foot"],
    ["We are betting on TypeScript for the next decade"],
    ["Matamos el proceso con kill y el hilo principal revivió"],
    ["Our users went from 1000000 to 2000000 requests a day"],
    ["AWS, CSS and HTML are fine in a normal sentence"],
    ["C# and F# both compile to IL on the CLR"],
  ])("accepts normal developer text: %s", (text) => {
    expect(isAcceptableText(text)).toBe(true);
  });

  describe("structural spam heuristics", () => {
    it("allows up to three hashtags", () => {
      expect(findContentIssue("New release today #rust #wasm #webdev")).toBeNull();
      expect(findContentIssue("New release today #rust #wasm #webdev #tools")).toBe("hashtags");
    });

    it("allows up to two links", () => {
      const twoLinks = "Docs at https://example.com/a and notes at http://example.org/b";

      expect(findContentIssue(twoLinks)).toBeNull();
      expect(findContentIssue(`${twoLinks} plus https://example.net/c`)).toBe("links");
    });

    it("rejects shouting only above 60% capitals in texts with more than 20 letters", () => {
      expect(findContentIssue(letters("ABCDEFGHIJ", 20))).toBeNull();
      expect(findContentIssue(letters("ABCDEFGHIJ", 21))).toBe("caps");
      // 15 capitals out of 25 letters is exactly 60%.
      expect(findContentIssue(`${letters("ABCDEFGHIJKLMNO", 15)} abcdefghij`)).toBeNull();
      expect(findContentIssue(`${letters("ABCDEFGHIJKLMNOP", 16)} abcdefghi`)).toBe("caps");
    });

    it("allows up to three emojis in a row", () => {
      expect(findContentIssue("Shipped it 🔥🔥🔥")).toBeNull();
      expect(findContentIssue("Shipped 🚀 then fixed 🐛 then slept 😴 and woke ☕")).toBeNull();
      expect(findContentIssue("Coding 👩‍💻👩‍💻👩‍💻 all day")).toBeNull();
      expect(findContentIssue("Shipped it 🔥🔥🔥🔥")).toBe("emojis");
      expect(findContentIssue("Shipped it 🚀 🚀 🚀 🚀")).toBe("emojis");
    });

    it("rejects the same character repeated six or more times", () => {
      expect(findContentIssue("It finally works!!!!!")).toBeNull();
      expect(findContentIssue("It finally works!!!!!!")).toBe("repeated-character");
      expect(findContentIssue("Sooooooo good")).toBe("repeated-character");
    });
  });
});
