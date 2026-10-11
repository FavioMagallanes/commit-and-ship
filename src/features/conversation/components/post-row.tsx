import { ExternalLink } from "@/shared/ui/external-link";

type PostRowProps = {
  handle: string;
  network: string;
  text: string;
  href: string;
};

// The first code point, so a handle that starts with an emoji is not cut in half.
const getInitial = (handle: string) =>
  (Array.from(handle.replace(/^@/, ""))[0] ?? "").toUpperCase();

export const PostRow = ({ handle, network, text, href }: PostRowProps) => (
  <li className="flex gap-3">
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-soft text-xs font-bold text-muted"
    >
      {getInitial(handle)}
    </span>
    <div className="flex min-w-0 flex-col gap-1">
      <p className="flex items-center gap-2">
        <span className="text-sm font-semibold text-ink">{handle}</span>
        <span className="text-xs text-faint">· {network}</span>
      </p>
      <ExternalLink href={href} className="line-clamp-3 text-base break-words text-muted">
        {text}
      </ExternalLink>
    </div>
  </li>
);
