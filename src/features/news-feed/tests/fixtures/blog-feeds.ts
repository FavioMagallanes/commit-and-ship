// Hand-trimmed copies of the real feeds: same shapes and namespaces, few items, fixed dates.

/** Node.js blog, RSS 2.0: CDATA titles, more items than the cap and a few broken ones. */
export const NODE_JS_RSS = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Node.js Blog</title>
    <link>https://nodejs.org/en</link>
    <description>Node.js Blog</description>
    <lastBuildDate>Sat, 10 Oct 2026 09:00:00 GMT</lastBuildDate>
    <item>
      <title><![CDATA[Node.js v24.9.0 (Current)]]></title>
      <link>https://nodejs.org/en/blog/release/v24.9.0</link>
      <guid>https://nodejs.org/en/blog/release/v24.9.0</guid>
      <pubDate>Fri, 09 Oct 2026 12:00:00 GMT</pubDate>
      <description><![CDATA[<p>Release notes</p>]]></description>
    </item>
    <item>
      <title><![CDATA[Security releases: <em>October</em> 2026]]></title>
      <link>https://nodejs.org/en/blog/vulnerability/october-2026-security-releases</link>
      <pubDate>Sat, 10 Oct 2026 08:00:00 +0000</pubDate>
    </item>
    <item>
      <title>Node.js v22.21.0 (LTS)</title>
      <link>https://nodejs.org/en/blog/release/v22.21.0</link>
      <pubDate>Thu, 08 Oct 2026 10:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Node.js v20.20.0 (LTS)</title>
      <link>https://nodejs.org/en/blog/release/v20.20.0</link>
      <pubDate>Wed, 07 Oct 2026 10:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Node.js v18.21.0 (Maintenance)</title>
      <link>https://nodejs.org/en/blog/release/v18.21.0</link>
      <pubDate>Tue, 06 Oct 2026 10:00:00 GMT</pubDate>
    </item>
    <item>
      <title>An item without a date</title>
      <link>https://nodejs.org/en/blog/undated</link>
    </item>
    <item>
      <title>An item with a bad date</title>
      <link>https://nodejs.org/en/blog/bad-date</link>
      <pubDate>sometime last week</pubDate>
    </item>
    <item>
      <title>An item with a relative link</title>
      <link>/en/blog/relative</link>
      <pubDate>Sat, 10 Oct 2026 09:00:00 GMT</pubDate>
    </item>
    <item>
      <title>An item with a script link</title>
      <link>javascript:alert(1)</link>
      <pubDate>Sat, 10 Oct 2026 09:30:00 GMT</pubDate>
    </item>
    <item>
      <title>   </title>
      <link>https://nodejs.org/en/blog/untitled</link>
      <pubDate>Sat, 10 Oct 2026 09:45:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

/** React blog, RSS 2.0 with a single item: the parser returns an object, not an array. */
export const REACT_RSS = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <title>React Blog</title>
    <link>https://react.dev/blog</link>
    <item>
      <title>React Labs: View Transitions &amp; Activity &#8212; what&#x2019;s next</title>
      <link>https://react.dev/blog/2026/10/08/react-labs?utm_source=rss&amp;utm_medium=feed</link>
      <guid>https://react.dev/blog/2026/10/08/react-labs</guid>
      <pubDate>Thu, 08 Oct 2026 16:00:00 GMT</pubDate>
      <author>The React Team</author>
    </item>
  </channel>
</rss>`;

/** Rust blog, Atom: link arrays, escaped HTML titles and entries with only `updated`. */
export const RUST_ATOM = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">
  <generator uri="https://www.getzola.org/">Zola</generator>
  <title>Rust Blog</title>
  <link rel="self" type="application/atom+xml" href="https://blog.rust-lang.org/feed.xml"/>
  <link rel="alternate" type="text/html" href="https://blog.rust-lang.org"/>
  <updated>2026-10-09T00:00:00+00:00</updated>
  <id>https://blog.rust-lang.org/feed.xml</id>
  <entry xml:lang="en">
    <title>Announcing Rust 1.95.0</title>
    <published>2026-10-09T00:00:00+00:00</published>
    <updated>2026-10-09T00:00:00+00:00</updated>
    <author><name>The Rust Release Team</name></author>
    <link rel="alternate" type="text/html" href="https://blog.rust-lang.org/2026/10/09/Rust-1.95.0/"/>
    <id>https://blog.rust-lang.org/2026/10/09/Rust-1.95.0/</id>
    <content type="html">&lt;p&gt;The Rust team is happy to announce...&lt;/p&gt;</content>
  </entry>
  <entry xml:lang="en">
    <title type="html">Faster builds with &lt;code&gt;cargo&lt;/code&gt; &amp;amp; friends</title>
    <updated>2026-10-07T12:30:00+02:00</updated>
    <link rel="self" href="https://blog.rust-lang.org/feed/entry-2.xml"/>
    <link rel="alternate" href="https://blog.rust-lang.org/2026/10/07/faster-builds/"/>
    <id>https://blog.rust-lang.org/2026/10/07/faster-builds/</id>
  </entry>
  <entry>
    <title>Entry whose link has no rel</title>
    <published>2026-10-05T00:00:00Z</published>
    <link href="https://blog.rust-lang.org/2026/10/05/no-rel/"/>
  </entry>
  <entry>
    <title>Entry with only a self link</title>
    <published>2026-10-06T00:00:00Z</published>
    <link rel="self" href="https://blog.rust-lang.org/feed/entry-4.xml"/>
  </entry>
  <entry>
    <title>Entry without a date</title>
    <link rel="alternate" href="https://blog.rust-lang.org/2026/10/04/undated/"/>
  </entry>
</feed>`;

/** Next.js blog, RSS 2.0: one item dated with dc:date instead of pubDate. */
export const NEXT_JS_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Next.js Blog</title>
    <link>https://nextjs.org/blog</link>
    <atom:link href="https://nextjs.org/feed.xml" rel="self" type="application/rss+xml"/>
    <item>
      <title>Next.js 16.4</title>
      <link>https://nextjs.org/blog/next-16-4</link>
      <pubDate>Wed, 07 Oct 2026 18:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Building APIs with Next.js</title>
      <link>https://nextjs.org/blog/building-apis</link>
      <dc:date>2026-10-02T15:00:00Z</dc:date>
    </item>
  </channel>
</rss>`;

/** Billion laughs: nested entity declarations that would expand to gigabytes if resolved. */
export const ENTITY_BOMB_RSS = `<?xml version="1.0"?>
<!DOCTYPE lolz [
  <!ENTITY lol "lol">
  <!ENTITY lol1 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
  <!ENTITY lol2 "&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;">
  <!ENTITY lol3 "&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;">
  <!ENTITY lol4 "&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;">
  <!ENTITY lol5 "&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;">
  <!ENTITY lol6 "&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;">
  <!ENTITY lol7 "&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;">
  <!ENTITY lol8 "&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;">
  <!ENTITY lol9 "&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;">
]>
<rss version="2.0">
  <channel>
    <item>
      <title>&lol9;</title>
      <link>https://example.com/lol</link>
      <pubDate>Sat, 10 Oct 2026 09:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;
