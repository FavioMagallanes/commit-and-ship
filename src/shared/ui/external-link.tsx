import type { ComponentProps } from "react";

// Links to third-party content always open in a new tab and never receive the opener.
export const ExternalLink = (props: Omit<ComponentProps<"a">, "target" | "rel">) => (
  <a target="_blank" rel="noopener noreferrer" {...props} />
);
