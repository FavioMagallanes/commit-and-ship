import { describe, expect, it } from "vitest";

import { htmlToText } from "@/features/conversation/model/html-to-text";

describe("htmlToText", () => {
  it("strips the tags and keeps the text", () => {
    expect(htmlToText("<p>Hola <strong>mundo</strong></p>")).toBe("Hola mundo");
  });

  it("separates paragraphs and line breaks with a space", () => {
    expect(htmlToText("<p>Uno</p><p>Dos<br>Tres<br />Cuatro</p>")).toBe("Uno Dos Tres Cuatro");
  });

  it("keeps the visible text of links, mentions and hashtags", () => {
    const html =
      '<p>Mirá <a href="https://example.com/a"><span class="invisible">https://</span><span class="ellipsis">example.com/</span><span class="invisible">a</span></a> de <span class="h-card"><a href="https://m.s/@bob" class="u-url mention">@<span>bob</span></a></span> <a href="https://m.s/tags/js" class="mention hashtag">#<span>js</span></a></p>';

    expect(htmlToText(html)).toBe("Mirá https://example.com/a de @bob #js");
  });

  it("decodes the common named entities", () => {
    expect(
      htmlToText("<p>a &amp; b &lt;c&gt; &quot;d&quot; &#39;e&#39; &apos;f&apos;&nbsp;g</p>"),
    ).toBe("a & b <c> \"d\" 'e' 'f' g");
  });

  it("decodes decimal and hexadecimal entities", () => {
    expect(htmlToText("caf&#233; &#x1F680; &#X41;")).toBe("café 🚀 A");
  });

  it("decodes only once, so escaped markup stays as text", () => {
    expect(htmlToText("&amp;lt;b&amp;gt; &lt;script&gt;")).toBe("&lt;b&gt; <script>");
  });

  it("leaves invalid numeric entities untouched", () => {
    expect(htmlToText("x &#xFFFFFFF; y")).toBe("x &#xFFFFFFF; y");
  });

  it("drops script and style elements together with their content", () => {
    expect(
      htmlToText("<p>Hola</p><script>alert('x')</script><style>p{color:red}</style><p>chau</p>"),
    ).toBe("Hola chau");
  });

  it("collapses whitespace and trims", () => {
    expect(htmlToText("  <p>  a \n\t b  </p>  ")).toBe("a b");
  });

  it.each(["", "<p></p>", "<br>"])("returns an empty string for %j", (html) => {
    expect(htmlToText(html)).toBe("");
  });
});
