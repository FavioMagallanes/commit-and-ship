"use client";

import { useSyncExternalStore } from "react";

import { nextTheme, type Theme, THEME_STORAGE_KEY } from "@/features/theme/model/theme";
import { Icon } from "@/shared/ui/icon";

const THEME_CHANGE_EVENT = "themechange";
const DARK_QUERY = "(prefers-color-scheme: dark)";

const LABELS: Record<Theme, string> = { light: "Claro", dark: "Oscuro" };

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener("change", onChange);
  window.addEventListener(THEME_CHANGE_EVENT, onChange);

  return () => {
    query.removeEventListener("change", onChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
  };
};

// A theme forced on <html> wins over the system preference.
const getTheme = (): Theme => {
  const { classList } = document.documentElement;
  if (classList.contains("dark")) return "dark";
  if (classList.contains("light")) return "light";

  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
};

const applyTheme = (theme: Theme) => {
  const { classList } = document.documentElement;
  classList.remove("light", "dark");
  classList.add(theme);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked; the theme still applies for this visit.
  }

  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
};

export const ThemeToggle = () => {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light" as const);
  const other = nextTheme(theme);

  return (
    <button
      type="button"
      onClick={() => applyTheme(other)}
      aria-label={`Tema ${LABELS[theme]}. Cambiar a ${LABELS[other].toLowerCase()}`}
      className="inline-flex items-center gap-2 rounded-full border border-line bg-surface py-2 pr-4 pl-3 text-sm font-semibold text-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
    >
      <Icon name={theme === "dark" ? "moon" : "sun"} />
      {LABELS[theme]}
    </button>
  );
};
