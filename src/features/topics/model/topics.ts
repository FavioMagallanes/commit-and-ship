import { normalizeText } from "@/features/search-filters/model/matches-query";

/** The closed set of topics, in the order the filter shows them. */
export const topics = ["ia", "frontend", "backend", "devops", "seguridad", "lenguajes"] as const;

export type Topic = (typeof topics)[number];

export const topicLabels: Record<Topic, string> = {
  ia: "IA",
  frontend: "Frontend",
  backend: "Backend",
  devops: "DevOps",
  seguridad: "Seguridad",
  lenguajes: "Lenguajes",
};

/**
 * What the chips filter by, in display order: every topic plus "blogs", which keeps the official
 * blog posts by their source instead of by keywords, so they are never a topic pill.
 */
export const topicFilters = [...topics, "blogs"] as const;

export type TopicFilter = (typeof topicFilters)[number];

export const topicFilterLabels: Record<TopicFilter, string> = { ...topicLabels, blogs: "Blogs" };

// Keywords are normalized (lowercase, accent-free). When a title matches several topics, the
// first one in this list wins: security news matters most, generic tech words matter least.
const topicKeywords: ReadonlyArray<readonly [Topic, readonly string[]]> = [
  [
    "seguridad",
    [
      "security",
      "seguridad",
      "vulnerability",
      "vulnerabilities",
      "vulnerabilidad",
      "vulnerabilidades",
      "cve",
      "exploit",
      "exploits",
      "malware",
      "ransomware",
      "breach",
      "breaches",
      "phishing",
      "zero-day",
      "encryption",
      "cifrado",
      "password",
      "passwords",
      "authentication",
      "privacy",
      "privacidad",
      "leak",
      "leaked",
      "backdoor",
    ],
  ],
  [
    "ia",
    [
      "ai",
      "ia",
      "llm",
      "llms",
      "gpt",
      "chatgpt",
      "openai",
      "anthropic",
      "claude",
      "gemini",
      "copilot",
      "machine learning",
      "neural",
      "rag",
      "embeddings",
      "agent",
      "agents",
      "agente",
      "agentes",
      "inteligencia artificial",
    ],
  ],
  [
    "lenguajes",
    [
      "rust",
      "python",
      "typescript",
      "javascript",
      "java",
      "kotlin",
      "swift",
      "c++",
      "c#",
      "zig",
      "golang",
      "haskell",
      "ruby",
      "php",
      "elixir",
      "lisp",
      "scala",
      "compiler",
      "compilers",
      "compilador",
      "programming language",
      "language",
    ],
  ],
  [
    "frontend",
    [
      "react",
      "vue",
      "svelte",
      "angular",
      "css",
      "html",
      "frontend",
      "front-end",
      "tailwind",
      "next.js",
      "nextjs",
      "browser",
      "browsers",
      "dom",
      "web components",
      "ui",
      "ux",
    ],
  ],
  [
    "backend",
    [
      "backend",
      "back-end",
      "api",
      "apis",
      "database",
      "databases",
      "postgres",
      "postgresql",
      "mysql",
      "sqlite",
      "redis",
      "sql",
      "graphql",
      "grpc",
      "microservice",
      "microservices",
      "kafka",
      "server",
      "servers",
    ],
  ],
  [
    "devops",
    [
      "devops",
      "docker",
      "kubernetes",
      "k8s",
      "ci/cd",
      "terraform",
      "ansible",
      "nginx",
      "cloud",
      "aws",
      "deployment",
      "deploy",
      "observability",
      "infrastructure",
      "infraestructura",
      "linux",
      "kernel",
    ],
  ],
];

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

// Letters, digits, "+" and "#" count as part of a word, so "c++" and "c#" are whole words while
// "rust" never matches inside "trust".
const keywordPattern = (keyword: string): RegExp =>
  new RegExp(`(?<![a-z0-9+#])${escapeRegExp(keyword)}(?![a-z0-9+#])`);

const topicPatterns = topicKeywords.map(
  ([topic, keywords]) => [topic, keywords.map(keywordPattern)] as const,
);

/** The topic of a story from its title, or null when no keyword matches. */
export const classifyTopic = (title: string): Topic | null => {
  const text = normalizeText(title);
  const match = topicPatterns.find(([, patterns]) =>
    patterns.some((pattern) => pattern.test(text)),
  );
  return match ? match[0] : null;
};

// dev.to tags are single lowercase words; blog feeds reuse them as topic hints. Same priority as
// the title keywords.
const topicTags: ReadonlyArray<readonly [Topic, ReadonlySet<string>]> = [
  ["seguridad", new Set(["security", "cybersecurity", "infosec", "privacy"])],
  ["ia", new Set(["ai", "machinelearning", "deeplearning", "llm", "genai", "openai", "chatgpt"])],
  [
    "lenguajes",
    new Set(["python", "rust", "go", "golang", "java", "kotlin", "swift", "cpp", "csharp"]),
  ],
  [
    "frontend",
    new Set(["webdev", "javascript", "react", "nextjs", "vue", "svelte", "angular", "css", "html"]),
  ],
  ["backend", new Set(["backend", "database", "api", "node", "postgres", "sql", "graphql"])],
  ["devops", new Set(["devops", "docker", "kubernetes", "aws", "cloud", "linux", "terraform"])],
];

/** The topic of a set of tags, or null when none of them is known. */
export const classifyTags = (tags: readonly string[]): Topic | null => {
  const normalized = tags.map((tag) => normalizeText(tag).trim());
  const match = topicTags.find(([, known]) => normalized.some((tag) => known.has(tag)));
  return match ? match[0] : null;
};

/** The topic of a story: its title decides first, its tags only when the title says nothing. */
export const classifyStoryTopic = ({
  title,
  tags = [],
}: {
  title: string;
  tags?: readonly string[];
}): Topic | null => classifyTopic(title) ?? classifyTags(tags);
