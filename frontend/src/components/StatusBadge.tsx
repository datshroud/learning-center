import { usePreferences } from '../contexts/PreferencesContext';

const styles: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  ENROLLING: 'bg-sky-50 text-sky-700 ring-sky-200',
  NOT_OPENED: 'bg-slate-50 text-slate-700 ring-slate-200',
  POSTPONED: 'bg-amber-50 text-amber-700 ring-amber-200',
  FINISHED: 'bg-zinc-100 text-zinc-700 ring-zinc-200',
  CANCELLED: 'bg-rose-50 text-rose-700 ring-rose-200',
  PAID: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  PARTIAL: 'bg-amber-50 text-amber-700 ring-amber-200',
  UNPAID: 'bg-rose-50 text-rose-700 ring-rose-200',
  OVERDUE: 'bg-red-50 text-red-700 ring-red-200',
  PRESENT: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  ABSENT: 'bg-rose-50 text-rose-700 ring-rose-200',
  LATE: 'bg-amber-50 text-amber-700 ring-amber-200',
  STUDENT: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  TEACHER: 'bg-violet-50 text-violet-700 ring-violet-200',
  STAFF: 'bg-blue-50 text-blue-700 ring-blue-200',
  ADMIN: 'bg-zinc-900 text-white ring-zinc-900'
};

const labels: Record<string, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Tạm ngưng',
  LOCKED: 'Đã khóa',
  ENROLLING: 'Tuyển sinh',
  NOT_OPENED: 'Chưa mở',
  POSTPONED: 'Tạm hoãn',
  FINISHED: 'Kết thúc',
  CANCELLED: 'Đã hủy',
  PAID: 'Đã thanh toán',
  PARTIAL: 'Một phần',
  UNPAID: 'Chưa đóng',
  OVERDUE: 'Quá hạn',
  PRESENT: 'Có mặt',
  ABSENT: 'Vắng',
  LATE: 'Đi muộn',
  ADMIN: 'Quản trị',
  STAFF: 'Nhân viên',
  TEACHER: 'Giáo viên',
  STUDENT: 'Học viên'
};

export function StatusBadge({ value }: { value?: string }) {
  const { t } = usePreferences();

  if (!value) {
    return <span>-</span>;
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
        styles[value] ?? 'bg-slate-50 text-slate-700 ring-slate-200'
      }`}
    >
      {t(labels[value] ?? value)}
    </span>
  );
}
