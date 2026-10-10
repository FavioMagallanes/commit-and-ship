import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "border-transparent bg-accent text-on-accent hover:opacity-90",
        secondary: "border-line bg-surface text-ink hover:bg-soft",
        danger: "border-danger-line bg-danger-bg text-danger-text hover:opacity-90",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export const Button = ({ variant, className, type = "button", ...props }: ButtonProps) => (
  <button type={type} className={cn(buttonVariants({ variant }), className)} {...props} />
);
