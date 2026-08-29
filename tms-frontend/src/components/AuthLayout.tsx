import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface border border-border rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-text-primary mb-6 text-center">{title}</h1>
        {children}
        {footer && <div className="mt-4 text-center text-sm text-text-secondary">{footer}</div>}
      </div>
    </div>
  );
}