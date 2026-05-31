import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { BarChart3, BookOpen, GraduationCap, Receipt, School, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { LoadingState } from '../components/LoadingState';
import { PageHeader, SectionCard } from '../components/Page';
import { StatusBadge } from '../components/StatusBadge';
import { usePreferences } from '../contexts/PreferencesContext';
import { api, formatDate, formatMoney } from '../lib/api';
import type { AnalyticsMetric, DashboardReport, Enrollment } from '../types/domain';

function StatCard({
  label,
  value,
  icon,
  metric
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  metric: AnalyticsMetric;
}) {
  const { t } = usePreferences();

  return (
    <Link
      to={`/analytics/${metric}?period=month`}
      className="group rounded-lg border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{t(label)}</p>
        <div className="rounded-md bg-slate-100 p-2 text-slate-700 group-hover:bg-sky-50 group-hover:text-sky-700">{icon}</div>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-3 text-xs font-semibold text-sky-700 opacity-0 transition group-hover:opacity-100">
        {t('Xem biểu đồ chi tiết')}
      </p>
    </Link>
  );
}

export function DashboardPage() {
  const { t } = usePreferences();
  const [data, setData] = useState<DashboardReport | null>(null);

  useEffect(() => {
    api.get<DashboardReport>('/reports/dashboard').then((response) => setData(response.data));
  }, []);

  if (!data) {
    return <LoadingState />;
  }

  const recentColumns = [
    {
      key: 'student',
      header: t('Học viên'),
      render: (row: Enrollment) => row.student?.user.fullName ?? '-'
    },
    {
      key: 'class',
      header: t('Lớp'),
      render: (row: Enrollment) => row.classRoom?.name ?? '-'
    },
    {
      key: 'date',
      header: t('Ngày ghi danh'),
      render: (row: Enrollment) => formatDate(row.enrollDate)
    },
    {
      key: 'status',
      header: t('Trạng thái'),
      render: (row: Enrollment) => <StatusBadge value={row.status} />
    }
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Tổng quan vận hành, tuyển sinh, lớp học và học phí." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard metric="students" label="Học viên" value={data.students} icon={<GraduationCap className="h-5 w-5" />} />
        <StatCard metric="teachers" label="Giáo viên" value={data.teachers} icon={<Users className="h-5 w-5" />} />
        <StatCard metric="classes" label="Tổng lớp" value={data.classes} icon={<School className="h-5 w-5" />} />
        <StatCard metric="active-classes" label="Lớp đang học" value={data.activeClasses} icon={<BookOpen className="h-5 w-5" />} />
        <StatCard metric="unpaid-tuition" label="Khoản học phí cần xử lý" value={data.unpaidTuition} icon={<Receipt className="h-5 w-5" />} />
        <StatCard metric="revenue" label="Doanh thu đã thu" value={formatMoney(data.revenue)} icon={<BarChart3 className="h-5 w-5" />} />
      </div>
      <SectionCard title="Ghi danh gần đây" className="mt-6">
        <DataTable data={data.recentEnrollments} columns={recentColumns} />
      </SectionCard>
    </>
  );
}
