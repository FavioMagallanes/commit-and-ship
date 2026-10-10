import { Icon } from "@/shared/ui/icon";

type ErrorBannerProps = {
  children: string;
};

export const ErrorBanner = ({ children }: ErrorBannerProps) => (
  <div
    role="alert"
    className="flex items-center gap-3 rounded-md border border-danger-line bg-danger-bg p-4 text-danger-text"
  >
    <Icon name="alert" />
    <p>{children}</p>
  </div>
);
