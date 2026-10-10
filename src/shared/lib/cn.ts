import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Our type scale adds `text-md` (16px), which tailwind-merge does not know.
 * Declaring it as a font size keeps it from being mistaken for a text color,
 * so `cn("text-md", "text-ink")` keeps both classes. Custom colors need no config.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["md"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
