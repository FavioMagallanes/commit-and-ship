"use client";

import { useEffect, useState, useTransition } from "react";

import { Button } from "@/shared/ui/button";

type RetryButtonProps = {
  /** Server action fixed to one feature's cache tag; the client never chooses what to expire. */
  action: () => Promise<void>;
};

// Each retry hits a public API whose rate limits we share, so the button rests between tries.
const COOLDOWN_MS = 10_000;

export const RetryButton = ({ action }: RetryButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const [isCoolingDown, setIsCoolingDown] = useState(false);

  useEffect(() => {
    if (!isCoolingDown) return;
    const timer = setTimeout(() => setIsCoolingDown(false), COOLDOWN_MS);
    return () => clearTimeout(timer);
  }, [isCoolingDown]);

  const retry = () =>
    startTransition(async () => {
      try {
        await action();
      } catch {
        // A failed retry leaves the banner as it was; the cooldown still applies.
      } finally {
        setIsCoolingDown(true);
      }
    });

  return (
    <>
      <Button
        variant="danger"
        className="self-start"
        disabled={isPending || isCoolingDown}
        onClick={retry}
      >
        {isPending ? "Reintentando…" : "Reintentar"}
      </Button>
      <span role="status" className="sr-only">
        {isPending ? "Reintentando…" : ""}
      </span>
    </>
  );
};
