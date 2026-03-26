import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

const BASE =
  "rounded-xl border border-slate-200 bg-white p-4 shadow-lg";

export default function NotificationBubble({ children, className }: Props) {
  return <div className={className ? `${BASE} ${className}` : BASE}>{children}</div>;
}

