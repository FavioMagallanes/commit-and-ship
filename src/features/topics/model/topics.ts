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
