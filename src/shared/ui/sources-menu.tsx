"use client";

import { useEffect, useId, useRef, useState } from "react";

import { ACTIVE_SOURCES } from "@/shared/lib/active-sources";
import { ExternalLink } from "@/shared/ui/external-link";
import { Icon } from "@/shared/ui/icon";

export const SourcesMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && rootRef.current?.contains(event.target)) return;
      setIsOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      buttonRef.current?.focus();
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative">
      {/* One button for both breakpoints: an icon on mobile, the design's text link on desktop. */}
      <button
        ref={buttonRef}
        type="button"
        aria-label="Menú de fuentes"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-surface text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text md:size-auto md:rounded-sm md:border-0 md:bg-transparent md:text-sm md:font-medium"
      >
        <Icon name="menu" size={20} className="md:hidden" />
        <span className="hidden md:inline">Fuentes</span>
      </button>
      {isOpen && (
        <nav
          id={panelId}
          aria-label="Fuentes"
          className="absolute top-full right-0 z-10 mt-2 min-w-56 rounded-lg border border-line bg-surface p-1 shadow-lg"
        >
          <p className="px-3 pt-2 pb-1 text-xs font-semibold text-faint">Fuentes que agregamos</p>
          <ul>
            {ACTIVE_SOURCES.map((source) => (
              <li key={source.url}>
                <ExternalLink
                  href={source.url}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-ink hover:bg-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
                >
                  {source.name}
                  <Icon name="arrow-up-right" className="text-muted" />
                </ExternalLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
};
