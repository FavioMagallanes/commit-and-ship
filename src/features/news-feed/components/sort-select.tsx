"use client";

import { useQueryState } from "nuqs";

import {
  feedControlParsers,
  type SortOrder,
  sortOrders,
} from "@/features/search-filters/model/search-params";
import { Select } from "@/shared/ui/select";

const sortParser = feedControlParsers.sort.withOptions({ shallow: false, scroll: false });

const sortLabels: Record<SortOrder, string> = {
  recent: "Recientes",
  popular: "Populares",
};

const sortOptions = sortOrders.map((order) => ({ value: order, label: sortLabels[order] }));

const isSortOrder = (value: string): value is SortOrder =>
  sortOrders.some((order) => order === value);

export const SortSelect = () => {
  const [sort, setSort] = useQueryState("sort", sortParser);

  return (
    <Select
      label="Ordenar"
      options={sortOptions}
      value={sort}
      onChange={(value) => {
        // nuqs clears the parameter when the value is the default, so "recent" leaves no trace.
        if (isSortOrder(value)) void setSort(value);
      }}
    />
  );
};
