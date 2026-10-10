"use client";

import { useEffect, useRef } from "react";

import { debounce, parseAsString, useQueryState } from "nuqs";

import { Icon } from "@/shared/ui/icon";

// Typing updates the field at once; the url (and so the server render) follows after a pause.
const queryParser = parseAsString
  .withDefault("")
  .withOptions({ shallow: false, limitUrlUpdates: debounce(300) });

export const SearchBox = () => {
  const [query, setQuery] = useQueryState("q", queryParser);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focusOnShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", focusOnShortcut);
    return () => window.removeEventListener("keydown", focusOnShortcut);
  }, []);

  return (
    <form
      role="search"
      onSubmit={(event) => event.preventDefault()}
      className="flex h-11 w-full max-w-105 items-center gap-2 rounded-md border border-line bg-surface px-4 text-muted focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent-text"
    >
      <Icon name="search" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => void setQuery(event.target.value)}
        aria-label="Buscar novedades"
        placeholder="Buscar novedades, versiones…"
        className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-faint"
      />
      <kbd
        aria-hidden="true"
        className="hidden rounded-sm bg-soft px-2 py-1 font-mono text-xs font-semibold text-muted md:block"
      >
        Ctrl K
      </kbd>
    </form>
  );
};
