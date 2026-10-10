import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/cn";

const pillVariants = cva("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", {
  variants: {
    tone: {
      neutral: "bg-soft text-muted",
      accent: "bg-accent-soft text-accent-text",
      solid: "bg-accent text-on-accent",
    },
  },
  defaultVariants: { tone: "neutral" },
});

type PillProps = ComponentProps<"span"> & VariantProps<typeof pillVariants>;

export const Pill = ({ tone, className, ...props }: PillProps) => (
  <span className={cn(pillVariants({ tone }), className)} {...props} />
);
