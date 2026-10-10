"use client";

import { useQueryState } from "nuqs";

import { feedControlParsers } from "@/features/search-filters/model/search-params";
import { Button } from "@/shared/ui/button";

const limitParser = feedControlParsers.limit.withOptions({ shallow: false, scroll: false });

type LoadMoreButtonProps = {
  /** Limit that shows one more page, computed on the server. */
  nextLimit: number;
};

export const LoadMoreButton = ({ nextLimit }: LoadMoreButtonProps) => {
  const [, setLimit] = useQueryState("limit", limitParser);

  return <Button onClick={() => void setLimit(nextLimit)}>Cargar más novedades</Button>;
};
