"use client";

import { useId } from "react";

import { useQueryState } from "nuqs";

import {
  feedControlParsers,
  type SortOrder,
  sortOrders,
} from "@/features/search-filters/model/search-params";

const sortParser = feedControlParsers.sort.withOptions({ shallow: false, scroll: false });

const sortLabels: Record<SortOrder, string> = {
  recent: "Recientes",
  popular: "Populares",
};

const isSortOrder = (value: string): value is SortOrder =>
  sortOrders.some((order) => order === value);

export const SortSelect = () => {
  const [sort, setSort] = useQueryState("sort", sortParser);
  const selectId = useId();

  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <label htmlFor={selectId}>Ordenar:</label>
      {/* The visible label ends in a colon; the accessible name leaves it out. */}
      <select
        id={selectId}
        aria-label="Ordenar"
        value={sort}
        onChange={(event) => {
          const { value } = event.target;
          // nuqs clears the parameter when the value is the default, so "recent" leaves no trace.
          if (isSortOrder(value)) void setSort(value);
        }}
        className="rounded-md border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
      >
        {sortOrders.map((order) => (
          <option key={order} value={order}>
            {sortLabels[order]}
          </option>
        ))}
      </select>
    </div>
  );
};
