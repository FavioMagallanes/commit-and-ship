import { Icon } from "@/shared/ui/icon";

type ErrorBannerProps = {
  title: string;
  children: string;
};

export const ErrorBanner = ({ title, children }: ErrorBannerProps) => (
  <div
    role="alert"
    className="flex flex-col gap-2 rounded-xl border border-danger-line bg-danger-bg p-5 text-danger-text"
  >
    <p className="flex items-center gap-2 font-heading text-md font-bold">
      <Icon name="alert" />
      {title}
    </p>
    <p className="text-base">{children}</p>
  </div>
);
