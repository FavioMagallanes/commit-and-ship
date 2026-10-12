import type { ReactNode } from "react";

import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import { Icon } from "@/shared/ui/icon";

type ErrorBannerProps = {
  title: string;
  children: string;
  /** Optional control under the message, such as a retry button. */
  action?: ReactNode;
};

export const ErrorBanner = ({ title, children, action }: ErrorBannerProps) => (
  <div
    role="alert"
    className="flex flex-col gap-2 rounded-xl border border-danger-line bg-danger-bg p-5 text-danger-text"
  >
    <p className="flex items-center gap-2 font-heading text-md font-bold">
      <Icon name="alert" />
      {title}
    </p>
    <p className="text-base">{children}</p>
    {action ? <div className="pt-1">{action}</div> : null}
  </div>
);

type StaleContentBannerProps = {
  title: string;
  /** ISO 8601 instant in UTC when the saved content was read. */
  savedAt: string;
  now: Date;
  action?: ReactNode;
};

/** Error banner placed above saved content, telling how old that content is. */
export const StaleContentBanner = ({ title, savedAt, now, action }: StaleContentBannerProps) => {
  const age = formatRelativeTime(savedAt, now);

  return (
    <ErrorBanner title={title} action={action}>
      {age === "" ? "Mostramos contenido guardado." : `Mostramos contenido guardado de ${age}`}
    </ErrorBanner>
  );
};
