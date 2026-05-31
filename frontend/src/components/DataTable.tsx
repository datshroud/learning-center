import type { ReactNode } from 'react';
import { usePreferences } from '../contexts/PreferencesContext';
import { EmptyState } from './EmptyState';

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

export function DataTable<T>({
  data,
  columns
}: {
  data: T[];
  columns: Column<T>[];
}) {
  const { t } = usePreferences();

  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {t(column.header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-slate-50">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 align-top text-slate-700">
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
