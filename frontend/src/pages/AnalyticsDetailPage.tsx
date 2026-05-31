import { ArrowLeft, BarChart3, CalendarDays, Download, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { BarChart, DonutChart, LineChart } from '../components/Charts';
import { DataTable, type Column } from '../components/DataTable';
import { LoadingState } from '../components/LoadingState';
import { PageHeader, SectionCard } from '../components/Page';
import { StatusBadge } from '../components/StatusBadge';
import { usePreferences } from '../contexts/PreferencesContext';
import { api, formatDate, formatMoney } from '../lib/api';
import type { AnalyticsMetric, AnalyticsPeriod, AnalyticsReport } from '../types/domain';

const metricLabels: Record<AnalyticsMetric, string> = {
  students: 'Học viên',
  teachers: 'Giáo viên',
  classes: 'Tổng lớp',
  'active-classes': 'Lớp đang học',
  'unpaid-tuition': 'Học phí cần xử lý',
  revenue: 'Doanh thu'
};

const periodLabels: Record<AnalyticsPeriod, string> = {
  day: 'Ngày',
  month: 'Tháng',
  year: 'Năm'
};

type AnyRecord = Record<string, any>;
type Translate = (key: string, options?: Record<string, string | number>) => string;
const PAGE_SIZE = 10;

function valueLabel(metric: AnalyticsMetric, value: number) {
  if (metric === 'revenue' || metric === 'unpaid-tuition') {
    return formatMoney(value);
  }
  return value.toLocaleString('vi-VN');
}

function recordsForTable(metric: AnalyticsMetric, records: unknown[]): AnyRecord[] {
  return records as AnyRecord[];
}

function tableColumns(metric: AnalyticsMetric, t: Translate): Column<AnyRecord>[] {
  if (metric === 'students') {
    return [
      { key: 'name', header: 'Học viên', render: (row) => row.user?.fullName ?? '-' },
      { key: 'code', header: 'Mã', render: (row) => row.studentCode ?? '-' },
      { key: 'school', header: 'Trường', render: (row) => row.school ?? '-' },
      { key: 'phone', header: 'Điện thoại', render: (row) => row.user?.phone ?? row.parents?.[0]?.phone ?? '-' },
      { key: 'createdAt', header: 'Ngày tạo', render: (row) => formatDate(row.createdAt) }
    ];
  }
  if (metric === 'teachers') {
    return [
      { key: 'name', header: 'Giáo viên', render: (row) => row.user?.fullName ?? '-' },
      { key: 'code', header: 'Mã', render: (row) => row.teacherCode ?? '-' },
      { key: 'specialization', header: 'Chuyên môn', render: (row) => row.specialization ?? '-' },
      { key: 'classes', header: 'Số lớp', render: (row) => row.assignments?.length ?? 0 },
      { key: 'createdAt', header: 'Ngày tạo', render: (row) => formatDate(row.createdAt) }
    ];
  }
  if (metric === 'classes') {
    return [
      { key: 'name', header: 'Lớp', render: (row) => row.name ?? '-' },
      { key: 'course', header: 'Khóa', render: (row) => row.course?.name ?? '-' },
      { key: 'subject', header: 'Môn', render: (row) => row.course?.subject?.name ?? '-' },
      { key: 'size', header: 'Sĩ số', render: (row) => `${row.currentStudents ?? 0}/${row.maxStudents ?? 0}` },
      { key: 'status', header: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> }
    ];
  }
  if (metric === 'active-classes') {
    return [
      { key: 'class', header: 'Lớp', render: (row) => row.classRoom?.name ?? '-' },
      { key: 'topic', header: 'Buổi học', render: (row) => row.topic ?? '-' },
      { key: 'date', header: 'Ngày học', render: (row) => formatDate(row.sessionDate) },
      { key: 'status', header: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> }
    ];
  }
  if (metric === 'unpaid-tuition') {
    return [
      { key: 'student', header: 'Học viên', render: (row) => row.student?.user?.fullName ?? '-' },
      { key: 'class', header: 'Lớp', render: (row) => row.enrollment?.classRoom?.name ?? '-' },
      { key: 'remaining', header: 'Còn phải thu', render: (row) => formatMoney(Number(row.amountDue ?? 0) - Number(row.amountPaid ?? 0)) },
      { key: 'dueDate', header: 'Hạn đóng', render: (row) => formatDate(row.dueDate) },
      { key: 'status', header: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> }
    ];
  }
  return [
    { key: 'student', header: 'Học viên', render: (row) => row.tuitionPayment?.student?.user?.fullName ?? '-' },
    { key: 'class', header: 'Lớp', render: (row) => row.tuitionPayment?.enrollment?.classRoom?.name ?? '-' },
    { key: 'amount', header: 'Số tiền', render: (row) => formatMoney(row.totalAmount) },
    { key: 'method', header: 'Phương thức', render: (row) => t(row.payment?.method ?? '-') },
    { key: 'date', header: 'Ngày thu', render: (row) => formatDate(row.invoiceDate) }
  ];
}

function breakdownForRecord(metric: AnalyticsMetric, row: AnyRecord) {
  if (metric === 'students') {
    return row.school ?? 'Chưa có trường';
  }
  if (metric === 'teachers') {
    return row.specialization ?? 'Chưa có chuyên môn';
  }
  if (metric === 'classes') {
    return row.status ?? 'Khác';
  }
  if (metric === 'active-classes') {
    return row.status ?? 'Khác';
  }
  if (metric === 'unpaid-tuition') {
    return row.status ?? 'Khác';
  }
  return row.payment?.method ?? 'Khác';
}

function searchableText(metric: AnalyticsMetric, row: AnyRecord) {
  if (metric === 'students') {
    return [
      row.user?.fullName,
      row.studentCode,
      row.school,
      row.user?.phone,
      row.parents?.[0]?.phone,
      row.user?.email
    ].join(' ');
  }
  if (metric === 'teachers') {
    return [
      row.user?.fullName,
      row.teacherCode,
      row.specialization,
      row.qualification,
      row.user?.phone,
      row.user?.email
    ].join(' ');
  }
  if (metric === 'classes') {
    return [
      row.name,
      row.course?.name,
      row.course?.subject?.name,
      row.status
    ].join(' ');
  }
  if (metric === 'active-classes') {
    return [
      row.classRoom?.name,
      row.topic,
      row.status,
      row.classRoom?.course?.name,
      row.classRoom?.course?.subject?.name
    ].join(' ');
  }
  if (metric === 'unpaid-tuition') {
    return [
      row.student?.user?.fullName,
      row.enrollment?.classRoom?.name,
      row.status,
      row.dueDate,
      row.student?.user?.phone
    ].join(' ');
  }
  return [
    row.tuitionPayment?.student?.user?.fullName,
    row.tuitionPayment?.enrollment?.classRoom?.name,
    row.payment?.method,
    row.invoiceDate
  ].join(' ');
}

const csvValue = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

function exportRows(metric: AnalyticsMetric, rows: AnyRecord[], title: string) {
  const columnsByMetric: Record<AnalyticsMetric, Array<{ header: string; value: (row: AnyRecord) => string | number }>> = {
    students: [
      { header: 'Học viên', value: (row) => row.user?.fullName ?? '-' },
      { header: 'Mã', value: (row) => row.studentCode ?? '-' },
      { header: 'Trường', value: (row) => row.school ?? '-' },
      { header: 'Điện thoại', value: (row) => row.user?.phone ?? row.parents?.[0]?.phone ?? '-' },
      { header: 'Ngày tạo', value: (row) => formatDate(row.createdAt) }
    ],
    teachers: [
      { header: 'Giáo viên', value: (row) => row.user?.fullName ?? '-' },
      { header: 'Mã', value: (row) => row.teacherCode ?? '-' },
      { header: 'Chuyên môn', value: (row) => row.specialization ?? '-' },
      { header: 'Số lớp', value: (row) => row.assignments?.length ?? 0 },
      { header: 'Ngày tạo', value: (row) => formatDate(row.createdAt) }
    ],
    classes: [
      { header: 'Lớp', value: (row) => row.name ?? '-' },
      { header: 'Khóa', value: (row) => row.course?.name ?? '-' },
      { header: 'Môn', value: (row) => row.course?.subject?.name ?? '-' },
      { header: 'Sĩ số', value: (row) => `${row.currentStudents ?? 0}/${row.maxStudents ?? 0}` },
      { header: 'Trạng thái', value: (row) => row.status ?? '-' }
    ],
    'active-classes': [
      { header: 'Lớp', value: (row) => row.classRoom?.name ?? '-' },
      { header: 'Buổi học', value: (row) => row.topic ?? '-' },
      { header: 'Ngày học', value: (row) => formatDate(row.sessionDate) },
      { header: 'Trạng thái', value: (row) => row.status ?? '-' }
    ],
    'unpaid-tuition': [
      { header: 'Học viên', value: (row) => row.student?.user?.fullName ?? '-' },
      { header: 'Lớp', value: (row) => row.enrollment?.classRoom?.name ?? '-' },
      { header: 'Còn phải thu', value: (row) => Number(row.amountDue ?? 0) - Number(row.amountPaid ?? 0) },
      { header: 'Hạn đóng', value: (row) => formatDate(row.dueDate) },
      { header: 'Trạng thái', value: (row) => row.status ?? '-' }
    ],
    revenue: [
      { header: 'Học viên', value: (row) => row.tuitionPayment?.student?.user?.fullName ?? '-' },
      { header: 'Lớp', value: (row) => row.tuitionPayment?.enrollment?.classRoom?.name ?? '-' },
      { header: 'Số tiền', value: (row) => Number(row.totalAmount ?? 0) },
      { header: 'Phương thức', value: (row) => row.payment?.method ?? '-' },
      { header: 'Ngày thu', value: (row) => formatDate(row.invoiceDate) }
    ]
  };
  const columns = columnsByMetric[metric];
  const csv = [
    columns.map((column) => csvValue(column.header)).join(','),
    ...rows.map((row) => columns.map((column) => csvValue(column.value(row))).join(','))
  ].join('\r\n');
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.toLowerCase().replaceAll(/\s+/g, '-')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function AnalyticsDetailPage() {
  const { t } = usePreferences();
  const { metric = 'students' } = useParams<{ metric: AnalyticsMetric }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPeriod = (searchParams.get('period') ?? 'month') as AnalyticsPeriod;
  const [period, setPeriod] = useState<AnalyticsPeriod>(initialPeriod);
  const [data, setData] = useState<AnalyticsReport | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setData(null);
    api
      .get<AnalyticsReport>(`/reports/analytics/${metric}?period=${period}`)
      .then((response) => setData(response.data));
    setSearchParams({ period });
  }, [metric, period, setSearchParams]);

  const records = useMemo(() => (data ? recordsForTable(data.metric, data.records) : []), [data]);
  const filteredRecords = useMemo(() => {
    if (!data) {
      return [];
    }

    const normalizedSearch = search.trim().toLowerCase();
    return records.filter((row) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        searchableText(data.metric, row).toLowerCase().includes(normalizedSearch);
      const matchesFilter = filter === 'all' || breakdownForRecord(data.metric, row) === filter;
      return matchesSearch && matchesFilter;
    });
  }, [data, filter, records, search]);
  const visibleRecords = filteredRecords.slice(0, visibleCount);
  const hasMoreRecords = visibleCount < filteredRecords.length;

  useEffect(() => {
    setSearch('');
    setFilter('all');
    setVisibleCount(PAGE_SIZE);
  }, [metric, period]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, filter]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMoreRecords) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((count) => Math.min(count + PAGE_SIZE, filteredRecords.length));
        }
      },
      {
        root: null,
        rootMargin: '160px',
        threshold: 0.1
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [filteredRecords.length, hasMoreRecords, visibleCount]);

  if (!data) {
    return <LoadingState />;
  }

  return (
    <>
      <PageHeader
        title={data.title}
        description={data.subtitle}
        action={
          <div className="flex flex-wrap gap-2">
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
              <ArrowLeft className="h-4 w-4" />
              {t('Dashboard')}
            </Link>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
              type="button"
              onClick={() => exportRows(data.metric, filteredRecords, data.title)}
            >
              <Download className="h-4 w-4" />
              {t('Xuất báo cáo')}
            </button>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{t('Chỉ số đang xem')}</p>
          <p className="text-lg font-bold text-slate-950">{t(metricLabels[data.metric])}</p>
        </div>
        <div className="flex rounded-md border border-slate-200 bg-slate-50 p-1">
          {(['day', 'month', 'year'] as AnalyticsPeriod[]).map((item) => (
            <button
              key={item}
              className={`rounded px-4 py-2 text-sm font-semibold ${
                period === item ? 'bg-sky-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-950'
              }`}
              onClick={() => setPeriod(item)}
            >
              {t(periodLabels[item])}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SectionCard>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">{t('Tổng cộng')}</p>
            <BarChart3 className="h-5 w-5 text-sky-700" />
          </div>
          <p className="mt-3 text-2xl font-black text-slate-950">{valueLabel(data.metric, data.total)}</p>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">{t('Kỳ hiện tại')}</p>
            <CalendarDays className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-black text-slate-950">{valueLabel(data.metric, data.current)}</p>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">{t('Kỳ trước')}</p>
            <CalendarDays className="h-5 w-5 text-slate-500" />
          </div>
          <p className="mt-3 text-2xl font-black text-slate-950">{valueLabel(data.metric, data.previous)}</p>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">{t('Tăng trưởng')}</p>
            <TrendingUp className="h-5 w-5 text-amber-600" />
          </div>
          <p className={`mt-3 text-2xl font-black ${data.changePercent >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {data.changePercent >= 0 ? '+' : ''}
            {data.changePercent}%
          </p>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.8fr)]">
        <SectionCard title={t('Xu hướng theo {{period}}', { period: t(periodLabels[period]).toLowerCase() })}>
          <LineChart points={data.series} />
        </SectionCard>
        <SectionCard title="Tỷ trọng">
          <DonutChart data={data.breakdown} />
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="So sánh từng mốc thời gian">
          <BarChart points={data.series} />
        </SectionCard>
      </div>

      <SectionCard title="Dữ liệu chi tiết" className="mt-6">
        <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(260px,1fr)_260px_auto]">
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            {t('Tìm kiếm')}
            <input
              className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-sky-600"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('Nhập tên, lớp, mã, trạng thái...')}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            {t('Lọc theo nhóm')}
            <select
              className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-sky-600"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="all">{t('Tất cả')}</option>
              {data.breakdown.map((item) => (
                <option key={item.label} value={item.label}>
                  {t(item.label)}
                </option>
              ))}
            </select>
          </label>
          <div className="self-end rounded-md bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
            {t('Hiển thị {{shown}}/{{total}}', {
              shown: Math.min(visibleRecords.length, filteredRecords.length),
              total: filteredRecords.length
            })}
          </div>
        </div>

        <DataTable data={visibleRecords} columns={tableColumns(data.metric, t)} />

        <div ref={loadMoreRef} className="mt-4 flex min-h-12 items-center justify-center rounded-md border border-dashed border-slate-200 text-sm text-slate-500">
          {hasMoreRecords
            ? t('Kéo xuống để tải thêm 10 dòng...')
            : filteredRecords.length > 0
              ? t('Đã tải hết dữ liệu phù hợp.')
              : t('Không có dữ liệu phù hợp bộ lọc.')}
        </div>
      </SectionCard>
    </>
  );
}
