export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

export const nextTheme = (theme: Theme): Theme => (theme === "dark" ? "light" : "dark");

/**
 * Runs before first paint so a remembered theme never flashes the wrong one. It only reads
 * our own storage key; no external data reaches it.
 */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark"){document.documentElement.classList.add(t)}}catch(e){}`;
