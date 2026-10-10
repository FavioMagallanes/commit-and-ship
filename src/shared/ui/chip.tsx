import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/cn";

const chipVariants = cva(
  "inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text",
  {
    variants: {
      active: {
        true: "border-transparent bg-accent-soft text-accent-text",
        false: "border-line bg-surface text-muted hover:bg-soft",
      },
    },
  },
);

type ChipProps = Omit<ComponentProps<"button">, "aria-pressed"> & {
  active: boolean;
};

export const Chip = ({ active, className, type = "button", ...props }: ChipProps) => (
  <button
    type={type}
    aria-pressed={active}
    className={cn(chipVariants({ active }), className)}
    {...props}
  />
);
