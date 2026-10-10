import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/cn";

const chipVariants = cva(
  "inline-flex items-center rounded-full border px-4 py-2 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text",
  {
    variants: {
      active: {
        true: "border-transparent bg-ink text-canvas",
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
