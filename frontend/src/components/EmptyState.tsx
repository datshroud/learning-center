import { Inbox } from 'lucide-react';
import { usePreferences } from '../contexts/PreferencesContext';

export function EmptyState({ title = 'Chưa có dữ liệu' }: { title?: string }) {
  const { t } = usePreferences();

  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-slate-500">
      <Inbox className="mb-3 h-8 w-8" />
      <p className="text-sm font-medium">{t(title)}</p>
    </div>
  );
}
