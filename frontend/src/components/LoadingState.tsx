import { usePreferences } from '../contexts/PreferencesContext';

export function LoadingState() {
  const { t } = usePreferences();

  return (
    <div className="flex min-h-48 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm text-slate-500">
      {t('Đang tải dữ liệu...')}
    </div>
  );
}
