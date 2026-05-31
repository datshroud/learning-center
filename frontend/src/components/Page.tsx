import type { ReactNode } from 'react';
import { usePreferences } from '../contexts/PreferencesContext';

export function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const { t } = usePreferences();

  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">{t(title)}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm text-slate-600">{t(description)}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function SectionCard({
  title,
  children,
  className = ''
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const { t } = usePreferences();

  return (
    <section className={`rounded-lg border border-slate-200 bg-white p-5 ${className}`}>
      {title ? <h2 className="mb-4 text-base font-semibold text-slate-900">{t(title)}</h2> : null}
      {children}
    </section>
  );
}

export function ErrorAlert({ message }: { message?: string }) {
  const { t } = usePreferences();

  if (!message) {
    return null;
  }
  return (
    <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
      {t(message)}
    </div>
  );
}
