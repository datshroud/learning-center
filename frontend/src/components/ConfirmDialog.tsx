import type { ReactNode } from 'react';
import { usePreferences } from '../contexts/PreferencesContext';

export function ConfirmDialog({
  open,
  title,
  children,
  onCancel,
  onConfirm
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = usePreferences();

  if (!open) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">{t(title)}</h2>
        <div className="mt-2 text-sm text-slate-600">{children}</div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="rounded-md border border-slate-300 px-4 py-2 text-sm" onClick={onCancel}>
            {t('Hủy')}
          </button>
          <button className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white" onClick={onConfirm}>
            {t('Xác nhận')}
          </button>
        </div>
      </div>
    </div>
  );
}
