/** The latest published release of a tracked repository, normalized by its adapter. */
export type Release = {
  /** Repository in `owner/name` form. */
  repo: string;
  /** Display name, for example "Node.js". */
  name: string;
  /** Release tag as published, for example "v26.0.1". */
  version: string;
  /** Always an http(s) url. */
  url: string;
  /** ISO 8601 instant in UTC. */
  publishedAt: string;
};

export type TrackedRepo = Pick<Release, "repo" | "name">;
