import { ReactNode } from "react";

export function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-bg-border bg-bg-card p-4 sm:p-5 ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-semibold text-white">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-negative/30 bg-negative/10 px-4 py-3 text-sm text-negative">
      <p className="font-medium">Errore nel caricamento dati</p>
      <p className="mt-0.5 text-negative/80">{message}</p>
    </div>
  );
}

export function SkeletonBlock({ className = "h-24" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-bg-panel ${className}`} />;
}
