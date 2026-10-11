"use client";

import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";

import { cva } from "class-variance-authority";

import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon";

const TYPE_AHEAD_RESET_MS = 500;

const optionVariants = cva("cursor-pointer rounded-md px-3 py-2 text-sm text-ink", {
  variants: {
    active: { true: "bg-soft", false: "" },
    // Declared after `active` so `cn` keeps its background when both apply.
    selected: { true: "bg-accent-soft font-semibold text-accent-text", false: "" },
  },
});

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
};

const clampIndex = (index: number, length: number) => Math.min(Math.max(index, 0), length - 1);

const findTypeAheadMatch = (options: SelectOption[], query: string, startIndex: number) => {
  const ordered = options.map((_, offset) => (startIndex + offset) % options.length);
  return ordered.find((index) => options[index]?.label.toLowerCase().startsWith(query));
};

export const Select = ({ label, options, value, onChange }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const typeAhead = useRef({ query: "", lastKeyAt: 0 });
  const listboxId = useId();

  const selectedOption = options.find((option) => option.value === value);
  const optionId = (index: number) => `${listboxId}-option-${index}`;

  useEffect(() => {
    if (!isOpen) return;

    listboxRef.current?.focus();

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && rootRef.current?.contains(event.target)) return;
      setIsOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [isOpen]);

  const open = () => {
    const selectedIndex = options.findIndex((option) => option.value === value);
    setActiveIndex(Math.max(selectedIndex, 0));
    setIsOpen(true);
  };

  const closeAndFocusButton = () => {
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const select = (index: number) => {
    const option = options[index];
    if (option && option.value !== value) onChange(option.value);
    closeAndFocusButton();
  };

  const moveTypeAhead = (key: string, now: number) => {
    const isNewQuery = now - typeAhead.current.lastKeyAt > TYPE_AHEAD_RESET_MS;
    const query = (isNewQuery ? key : typeAhead.current.query + key).toLowerCase();
    typeAhead.current = { query, lastKeyAt: now };

    // A fresh query looks past the current option; a longer one may still match it.
    const startIndex = query.length === 1 ? activeIndex + 1 : activeIndex;
    const match = findTypeAheadMatch(options, query, startIndex);
    if (match !== undefined) setActiveIndex(match);
  };

  const handleButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    // Enter and Space already open it through the native click.
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      open();
    }
  };

  const handleListboxKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex(clampIndex(activeIndex + 1, options.length));
        return;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex(clampIndex(activeIndex - 1, options.length));
        return;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        return;
      case "End":
        event.preventDefault();
        setActiveIndex(options.length - 1);
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        select(activeIndex);
        return;
      case "Escape":
        event.preventDefault();
        closeAndFocusButton();
        return;
      case "Tab":
        // Moving focus back to the button first lets the browser tab on from the control.
        closeAndFocusButton();
        return;
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      moveTypeAhead(event.key, event.timeStamp);
    }
  };

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        onKeyDown={handleButtonKeyDown}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
      >
        <span>{label}:</span>{" "}
        <span className="font-semibold text-ink">{selectedOption?.label}</span>
        <Icon name="chevron-down" className={cn("text-muted", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={optionId(activeIndex)}
          onKeyDown={handleListboxKeyDown}
          className="absolute top-full right-0 z-10 mt-1 min-w-40 rounded-lg border border-line bg-surface p-1 shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                id={optionId(index)}
                role="option"
                aria-selected={isSelected}
                onClick={() => select(index)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  optionVariants({ active: index === activeIndex, selected: isSelected }),
                )}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
