// Trimmed copy of a real dev.to /api/articles response: only the fields the adapter reads, plus noise.
export const DEV_TO_TOP_ARTICLES = [
  {
    type_of: "article",
    id: 2901234,
    title: "Building a RAG pipeline with pgvector",
    url: "https://dev.to/someone/building-a-rag-pipeline-with-pgvector-1a2b",
    comments_count: 14,
    public_reactions_count: 212,
    published_timestamp: "2026-10-09T15:51:05Z",
    tag_list: ["ai", "postgres", "tutorial"],
    tags: "ai, postgres, tutorial",
    user: { name: "Someone", username: "someone" },
  },
  {
    type_of: "article",
    id: 2905678,
    title: "What I learned shipping my first side project",
    url: "https://dev.to/other/what-i-learned-shipping-my-first-side-project-3c4d",
    comments_count: 3,
    public_reactions_count: 45,
    published_timestamp: "2026-10-10T09:00:00Z",
    tag_list: [],
    tags: "",
    user: { name: "Other", username: "other" },
  },
];
