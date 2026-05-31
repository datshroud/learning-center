import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  KeyRound,
  Lock,
  MessageSquare,
  MoreVertical,
  Plus,
  Receipt,
  ReceiptText,
  Save,
  Search,
  ShoppingCart,
  Star,
  Trash2,
  Upload,
  UserPen,
  UsersRound,
  X
} from 'lucide-react';
import { CalendarBoard } from '../components/CalendarBoard';
import { DataTable } from '../components/DataTable';
import { FormField, SelectField } from '../components/FormField';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert, PageHeader, SectionCard } from '../components/Page';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { api, dayLabel, formatDate, formatMoney, getErrorMessage } from '../lib/api';
import type {
  AttendanceDetail,
  ClassRoom,
  Course,
  Enrollment,
  Role,
  Room,
  Schedule,
  Score,
  StudentProfile,
  StudySession,
  Subject,
  TeacherProfile,
  TuitionPayment,
  User
} from '../types/domain';

const valueOf = (form: HTMLFormElement, name: string) =>
  String(new FormData(form).get(name) ?? '').trim();

const valuesOf = (form: HTMLFormElement, name: string) =>
  new FormData(form)
    .getAll(name)
    .map(String)
    .map((value) => value.trim())
    .filter(Boolean);

function SubmitButton({ children = 'Lưu' }: { children?: string }) {
  const { t } = usePreferences();

  return (
    <button type="submit" className="h-10 rounded-md bg-sky-700 px-4 text-sm font-semibold text-white">
      {t(children)}
    </button>
  );
}

function ModalShell({
  title,
  children,
  onClose
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const { t } = usePreferences();

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <section className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-950">{t(title)}</h2>
          <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600" type="button" onClick={onClose}>
            {t('Hủy')}
          </button>
        </div>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}

function useList<T>(url: string, reloadKey: number) {
  const [data, setData] = useState<T[] | null>(null);
  useEffect(() => {
    let active = true;
    api.get<T[]>(url).then((response) => {
      if (active) {
        setData(response.data);
      }
    });
    return () => {
      active = false;
    };
  }, [url, reloadKey]);
  return data;
}

type StudentProfileTab =
  | 'overview'
  | 'appointments'
  | 'discussions'
  | 'invoices'
  | 'transactions'
  | 'attendance'
  | 'statistics'
  | 'scores';

type StudentAttendanceRow = {
  id: string;
  scheduleName: string;
  classRoomId: string;
  classRoomName: string;
  time: string;
  packageName: string;
  status?: 'PRESENT' | 'ABSENT' | 'LATE';
  note: string;
  searchText: string;
};

const profileTabs: Array<{
  key: StudentProfileTab;
  label: string;
  icon: ReactNode;
  activeClass: string;
  dotClass: string;
}> = [
  { key: 'overview', label: 'Tổng quan', icon: <FileText className="h-4 w-4" />, activeClass: 'border-sky-400 bg-sky-50 text-sky-700', dotClass: 'bg-sky-500' },
  { key: 'appointments', label: 'Lịch hẹn', icon: <CalendarDays className="h-4 w-4" />, activeClass: 'border-rose-400 bg-rose-50 text-rose-700', dotClass: 'bg-rose-500' },
  { key: 'discussions', label: 'Thảo luận', icon: <MessageSquare className="h-4 w-4" />, activeClass: 'border-amber-400 bg-amber-50 text-amber-700', dotClass: 'bg-amber-500' },
  { key: 'invoices', label: 'Hóa đơn', icon: <Receipt className="h-4 w-4" />, activeClass: 'border-emerald-400 bg-emerald-50 text-emerald-700', dotClass: 'bg-emerald-500' },
  { key: 'transactions', label: 'Giao dịch', icon: <CreditCard className="h-4 w-4" />, activeClass: 'border-cyan-400 bg-cyan-50 text-cyan-700', dotClass: 'bg-cyan-500' },
  { key: 'attendance', label: 'Điểm danh', icon: <ClipboardCheck className="h-4 w-4" />, activeClass: 'border-indigo-500 bg-indigo-50 text-indigo-700', dotClass: 'bg-indigo-600' },
  { key: 'statistics', label: 'Thống kê', icon: <BarChart3 className="h-4 w-4" />, activeClass: 'border-slate-500 bg-slate-100 text-slate-800', dotClass: 'bg-slate-600' },
  { key: 'scores', label: 'Điểm và đánh giá', icon: <Star className="h-4 w-4" />, activeClass: 'border-pink-400 bg-pink-50 text-pink-700', dotClass: 'bg-pink-500' }
];

const csvValue = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

const formatSessionTime = (date?: string, time?: string) => {
  if (!date) {
    return '-';
  }
  return time ? `${formatDate(date)} ${time}` : formatDate(date);
};

function buildAttendanceRows(student: StudentProfile): StudentAttendanceRow[] {
  return (student.enrollments ?? [])
    .flatMap((enrollment) => {
      const classRoom = enrollment.classRoom;
      if (!classRoom) {
        return [];
      }
      return (classRoom.studySessions ?? []).map((session, index) => {
        const detail = session.attendance?.details?.find((item) => item.studentId === student.id);
        const primarySchedule = classRoom.schedules?.[0];
        const scheduleName = session.topic || `Buổi ${index + 1}`;
        const classRoomName = classRoom.name;
        const packageName = classRoom.course?.name ?? classRoom.course?.subject?.name ?? '-';
        const time = formatSessionTime(session.sessionDate, primarySchedule?.startTime);
        const note = detail?.note ?? session.topic ?? '';

        return {
          id: session.id,
          scheduleName,
          classRoomId: classRoom.id,
          classRoomName,
          time,
          packageName,
          status: detail?.status,
          note,
          searchText: [scheduleName, classRoomName, packageName, time, note, detail?.status ?? 'Chưa điểm danh']
            .join(' ')
            .toLowerCase()
        };
      });
    })
    .sort((left, right) => left.time.localeCompare(right.time));
}

function downloadAttendanceCsv(student: StudentProfile, rows: StudentAttendanceRow[]) {
  const header = ['STT', 'Lịch học', 'Lớp học', 'Thời gian', 'Gói dịch vụ', 'Điểm danh', 'Ghi chú'];
  const body = rows.map((row, index) => [
    index + 1,
    row.scheduleName,
    row.classRoomName,
    row.time,
    row.packageName,
    row.status ?? 'Chưa điểm danh',
    row.note || '-'
  ]);
  const csv = [header, ...body].map((row) => row.map(csvValue).join(',')).join('\r\n');
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${student.studentCode}-diem-danh.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadReportsCsv(
  revenue: { totalDue: number; totalPaid: number; totalDebt: number; items: TuitionPayment[] },
  attendance: { present: number; absent: number; late: number },
  learning: { average: number; totalScores: number }
) {
  const summaryRows = [
    ['Nhóm báo cáo', 'Chỉ số', 'Giá trị'],
    ['Doanh thu', 'Tổng phải thu', revenue.totalDue],
    ['Doanh thu', 'Đã thu', revenue.totalPaid],
    ['Doanh thu', 'Công nợ', revenue.totalDebt],
    ['Chuyên cần', 'Có mặt', attendance.present],
    ['Chuyên cần', 'Vắng', attendance.absent],
    ['Chuyên cần', 'Đi muộn', attendance.late],
    ['Kết quả học tập', 'Điểm trung bình', learning.average.toFixed(2)],
    ['Kết quả học tập', 'Tổng số điểm', learning.totalScores]
  ];
  const tuitionRows = [
    [],
    ['Chi tiết học phí'],
    ['STT', 'Học viên', 'Mã học viên', 'Phải thu', 'Đã thu', 'Công nợ', 'Trạng thái', 'Hạn đóng'],
    ...revenue.items.map((item, index) => [
      index + 1,
      item.student?.user.fullName ?? '-',
      item.student?.studentCode ?? '-',
      item.amountDue,
      item.amountPaid,
      Number(item.amountDue) - Number(item.amountPaid),
      item.status,
      formatDate(item.dueDate)
    ])
  ];
  const csv = [...summaryRows, ...tuitionRows].map((row) => row.map((value) => csvValue(value ?? '')).join(',')).join('\r\n');
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bao-cao-tong-hop-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function StudentProfileDialog({ student, onClose }: { student: StudentProfile; onClose: () => void }) {
  const { t } = usePreferences();
  const [activeTab, setActiveTab] = useState<StudentProfileTab>('overview');
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceClassId, setAttendanceClassId] = useState('all');

  const classRooms = useMemo(() => {
    const map = new Map<string, NonNullable<Enrollment['classRoom']>>();
    student.enrollments?.forEach((enrollment) => {
      if (enrollment.classRoom) {
        map.set(enrollment.classRoom.id, enrollment.classRoom);
      }
    });
    return Array.from(map.values());
  }, [student]);

  const attendanceRows = useMemo(() => buildAttendanceRows(student), [student]);

  const filteredAttendanceRows = useMemo(() => {
    const normalizedSearch = attendanceSearch.trim().toLowerCase();
    return attendanceRows.filter((row) => {
      const matchesClass = attendanceClassId === 'all' || row.classRoomId === attendanceClassId;
      const matchesSearch = !normalizedSearch || row.searchText.includes(normalizedSearch);
      return matchesClass && matchesSearch;
    });
  }, [attendanceClassId, attendanceRows, attendanceSearch]);

  const invoices = useMemo(
    () =>
      (student.tuitionPayments ?? []).flatMap((tuition) =>
        (tuition.invoices ?? []).map((invoice) => ({
          ...invoice,
          className: tuition.enrollment?.classRoom?.name ?? '-',
          status: tuition.status
        }))
      ),
    [student]
  );

  const transactions = useMemo(
    () =>
      (student.tuitionPayments ?? []).flatMap((tuition) =>
        (tuition.payments ?? []).map((payment) => ({
          ...payment,
          className: tuition.enrollment?.classRoom?.name ?? '-',
          tuitionStatus: tuition.status
        }))
      ),
    [student]
  );

  const appointments = useMemo(
    () =>
      classRooms.flatMap((classRoom) =>
        (classRoom.studySessions ?? []).map((session, index) => ({
          id: session.id,
          className: classRoom.name,
          name: session.topic || `Buổi ${index + 1}`,
          time: formatSessionTime(session.sessionDate, classRoom.schedules?.[0]?.startTime),
          room: classRoom.schedules?.map((schedule) => schedule.room?.name).filter(Boolean).join(', ') || '-',
          status: session.status
        }))
      ),
    [classRooms]
  );

  const activeEnrollments = (student.enrollments ?? []).filter((enrollment) => enrollment.status === 'ACTIVE');
  const totalDue = (student.tuitionPayments ?? []).reduce((sum, item) => sum + Number(item.amountDue), 0);
  const totalPaid = (student.tuitionPayments ?? []).reduce((sum, item) => sum + Number(item.amountPaid), 0);
  const averageScore =
    !student.scores?.length
      ? 0
      : student.scores.reduce((sum, score) => sum + Number(score.value), 0) / student.scores.length;
  const attendedCount = attendanceRows.filter((row) => row.status === 'PRESENT' || row.status === 'LATE').length;
  const attendanceRate = attendanceRows.length === 0 ? 0 : Math.round((attendedCount / attendanceRows.length) * 100);
  const parent = student.parents?.[0];

  const renderOverview = () => (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-md border border-slate-200 bg-white p-4">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-sky-100 text-lg font-black text-sky-700">
            {student.user.fullName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-xl font-black text-slate-950">{student.user.fullName}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">{student.studentCode}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge value={student.user.status} />
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {student.school ?? t('Chưa có trường')}
              </span>
            </div>
          </div>
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ['Điện thoại', student.user.phone ?? '-'],
            ['Email', student.user.email ?? '-'],
            ['Ngày sinh', formatDate(student.dateOfBirth)],
            ['Địa chỉ', student.address ?? '-'],
            ['Phụ huynh', parent?.fullName ?? '-'],
            ['SĐT phụ huynh', parent?.phone ?? '-']
          ].map(([label, value]) => (
            <div key={label} className="rounded-md bg-slate-50 p-3">
              <dt className="text-xs font-semibold uppercase text-slate-500">{t(label)}</dt>
              <dd className="mt-1 text-sm font-bold text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-bold uppercase text-slate-500">{t('Tổng quan học tập')}</h3>
        <div className="mt-4 grid gap-3">
          {[
            ['Lớp đang học', activeEnrollments.length],
            ['Khoản học phí', student.tuitionPayments?.length ?? 0],
            ['Đã thu', formatMoney(totalPaid)],
            ['Còn phải thu', formatMoney(Math.max(totalDue - totalPaid, 0))],
            ['Điểm trung bình', averageScore.toFixed(2)],
            ['Tỷ lệ chuyên cần', `${attendanceRate}%`]
          ].map(([label, value]) => (
            <div key={String(label)} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 last:border-0">
              <span className="text-sm text-slate-500">{t(String(label))}</span>
              <span className="text-sm font-black text-slate-950">{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="lg:col-span-2">
        <DataTable
          data={student.enrollments ?? []}
          columns={[
            { key: 'class', header: 'Lớp học', render: (row) => row.classRoom?.name ?? '-' },
            { key: 'course', header: 'Khóa học', render: (row) => row.classRoom?.course?.name ?? '-' },
            { key: 'date', header: 'Ngày ghi danh', render: (row) => formatDate(row.enrollDate) },
            { key: 'tuition', header: 'Học phí', render: (row) => formatMoney(row.tuitionPayment?.amountDue) },
            { key: 'status', header: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> }
          ]}
        />
      </section>
    </div>
  );

  const renderAttendance = () => (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            className={`rounded-md px-3 py-2 text-sm font-bold ${attendanceClassId === 'all' ? 'bg-sky-600 text-white' : 'border border-slate-200 text-slate-700'}`}
            type="button"
            onClick={() => setAttendanceClassId('all')}
          >
            All {attendedCount}/{attendanceRows.length}
          </button>
          {classRooms.map((classRoom) => {
            const rows = attendanceRows.filter((row) => row.classRoomId === classRoom.id);
            const attended = rows.filter((row) => row.status === 'PRESENT' || row.status === 'LATE').length;
            return (
              <button
                key={classRoom.id}
                className={`rounded-md px-3 py-2 text-sm font-bold ${attendanceClassId === classRoom.id ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' : 'border border-slate-200 text-slate-700'}`}
                type="button"
                onClick={() => setAttendanceClassId(classRoom.id)}
              >
                {classRoom.name} {attended}/{rows.length}
              </button>
            );
          })}
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700"
          type="button"
          onClick={() => downloadAttendanceCsv(student, filteredAttendanceRows)}
        >
          <Download className="h-4 w-4" />
          {t('Tải xuống')}
        </button>
      </div>

      <label className="mt-4 flex h-10 max-w-xs items-center gap-2 rounded-full border border-slate-300 bg-white px-3 text-sm text-slate-500">
        <Search className="h-4 w-4" />
        <input
          className="min-w-0 flex-1 border-0 bg-transparent outline-none"
          placeholder={t('Nhấn enter để tìm kiếm')}
          value={attendanceSearch}
          onChange={(event) => setAttendanceSearch(event.target.value)}
        />
      </label>

      <div className="mt-4">
        <DataTable
          data={filteredAttendanceRows}
          columns={[
            { key: 'index', header: 'STT', render: (row) => filteredAttendanceRows.indexOf(row) + 1 },
            { key: 'schedule', header: 'Lịch học', render: (row) => <span className="font-semibold text-sky-700">{row.scheduleName}</span> },
            { key: 'class', header: 'Lớp học', render: (row) => <span className="font-semibold text-sky-700">{row.classRoomName}</span> },
            { key: 'time', header: 'Thời gian', render: (row) => row.time },
            { key: 'package', header: 'Gói dịch vụ', render: (row) => row.packageName },
            {
              key: 'attendance',
              header: 'Điểm danh',
              render: (row) =>
                row.status ? <StatusBadge value={row.status} /> : <span className="text-slate-500">{t('Chưa điểm danh')}</span>
            },
            { key: 'note', header: 'Ghi chú', render: (row) => row.note || '-' }
          ]}
        />
      </div>
    </div>
  );

  const renderCurrentTab = () => {
    if (activeTab === 'overview') {
      return renderOverview();
    }
    if (activeTab === 'appointments') {
      return (
        <DataTable
          data={appointments}
          columns={[
            { key: 'name', header: 'Buổi học', render: (row) => row.name },
            { key: 'class', header: 'Lớp học', render: (row) => row.className },
            { key: 'time', header: 'Thời gian', render: (row) => row.time },
            { key: 'room', header: 'Phòng', render: (row) => row.room },
            { key: 'status', header: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> }
          ]}
        />
      );
    }
    if (activeTab === 'invoices') {
      return (
        <DataTable
          data={invoices}
          columns={[
            { key: 'id', header: 'Mã hóa đơn', render: (row) => row.id },
            { key: 'class', header: 'Lớp học', render: (row) => row.className },
            { key: 'date', header: 'Ngày lập', render: (row) => formatDate(row.invoiceDate) },
            { key: 'amount', header: 'Số tiền', render: (row) => formatMoney(row.totalAmount) },
            { key: 'status', header: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> }
          ]}
        />
      );
    }
    if (activeTab === 'transactions') {
      return (
        <DataTable
          data={transactions}
          columns={[
            { key: 'date', header: 'Ngày thu', render: (row) => formatDate(row.paymentDate) },
            { key: 'class', header: 'Lớp học', render: (row) => row.className },
            { key: 'amount', header: 'Số tiền', render: (row) => formatMoney(row.amount) },
            { key: 'method', header: 'Phương thức', render: (row) => t(row.method) },
            { key: 'note', header: 'Ghi chú', render: (row) => row.note ?? '-' }
          ]}
        />
      );
    }
    if (activeTab === 'attendance') {
      return renderAttendance();
    }
    if (activeTab === 'statistics') {
      return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['Tổng buổi học', attendanceRows.length],
            ['Đã tham gia', attendedCount],
            ['Tỷ lệ chuyên cần', `${attendanceRate}%`],
            ['Điểm trung bình', averageScore.toFixed(2)]
          ].map(([label, value]) => (
            <section key={String(label)} className="rounded-md border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-500">{t(String(label))}</p>
              <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
            </section>
          ))}
        </div>
      );
    }
    if (activeTab === 'scores') {
      return (
        <DataTable
          data={student.scores ?? []}
          columns={[
            { key: 'exam', header: 'Bài kiểm tra', render: (row) => row.exam?.name ?? '-' },
            { key: 'class', header: 'Lớp học', render: (row) => row.exam?.classRoom?.name ?? '-' },
            { key: 'date', header: 'Ngày kiểm tra', render: (row) => formatDate(row.exam?.examDate) },
            { key: 'score', header: 'Điểm', render: (row) => `${row.value}/${row.exam?.maxScore ?? 10}` },
            { key: 'comment', header: 'Nhận xét', render: (row) => row.comment ?? '-' }
          ]}
        />
      );
    }
    return (
      <DataTable
        data={[
          { label: 'Ghi chú hồ sơ', value: student.address ?? '-' },
          { label: 'Phụ huynh', value: parent ? `${parent.fullName} - ${parent.phone}` : '-' },
          { label: 'Nhận xét gần nhất', value: student.scores?.find((score) => score.comment)?.comment ?? '-' }
        ]}
        columns={[
          { key: 'label', header: 'Nội dung', render: (row) => row.label },
          { key: 'value', header: 'Chi tiết', render: (row) => row.value }
        ]}
      />
    );
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-3">
      <section className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-500">{student.studentCode}</p>
            <h2 className="truncate text-xl font-black text-slate-950">{student.user.fullName}</h2>
          </div>
          <button
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
            type="button"
            aria-label={t('Đóng')}
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">
          <div className="mb-5 flex flex-wrap gap-2">
            {profileTabs.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-bold ${
                    isActive ? tab.activeClass : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.icon}
                  {t(tab.label)}
                  <span className={`h-2 w-2 rounded-full ${isActive ? tab.dotClass : 'bg-slate-300'}`} />
                </button>
              );
            })}
          </div>
          {renderCurrentTab()}
        </div>
        <div className="flex justify-end border-t border-slate-200 px-5 py-4">
          <button className="rounded-md bg-indigo-700 px-4 py-2 text-sm font-bold text-white" type="button" onClick={onClose}>
            {t('Đóng')}
          </button>
        </div>
      </section>
    </div>
  );
}

export function UsersPage() {
  const { t } = usePreferences();
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState('');
  const [role, setRole] = useState<Role>('STAFF');
  const users = useList<User>('/users', reloadKey);
  const userStatusOptions: User['status'][] = ['ACTIVE', 'INACTIVE', 'LOCKED'];

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = event.currentTarget;
    const payload: Record<string, unknown> = {
      fullName: valueOf(form, 'fullName'),
      username: valueOf(form, 'username'),
      password: valueOf(form, 'password') || undefined,
      role,
      phone: valueOf(form, 'phone') || undefined,
      email: valueOf(form, 'email') || undefined
    };

    if (role === 'STUDENT') {
      payload.student = {
        studentCode: valueOf(form, 'studentCode'),
        school: valueOf(form, 'school') || undefined
      };
    }

    if (role === 'TEACHER') {
      payload.teacher = {
        teacherCode: valueOf(form, 'teacherCode'),
        specialization: valueOf(form, 'specialization') || undefined,
        qualification: valueOf(form, 'qualification') || undefined
      };
    }

    if (role === 'STAFF') {
      payload.staff = {
        staffCode: valueOf(form, 'staffCode'),
        position: valueOf(form, 'position') || undefined
      };
    }

    try {
      await api.post('/users', payload);
      form.reset();
      setRole('STAFF');
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function updateUserStatus(id: string, status: User['status']) {
    setError('');
    try {
      await api.patch(`/users/${id}/status`, { status });
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (!users) {
    return <LoadingState />;
  }
  return (
    <>
      <PageHeader title="Quản lý tài khoản" description="Theo dõi tài khoản người dùng và trạng thái phân quyền." />
      <ErrorAlert message={error} />
      <SectionCard title="Tạo tài khoản">
        <form className="grid gap-4 md:grid-cols-3" onSubmit={createUser}>
          <FormField label="Họ tên" name="fullName" required />
          <FormField label="Tài khoản" name="username" required />
          <FormField label="Mật khẩu" name="password" type="password" placeholder="123456" minLength={6} />
          <SelectField label="Vai trò" name="role" value={role} onChange={(event) => setRole(event.target.value as Role)}>
            <option value="STAFF">Nhân viên</option>
            <option value="TEACHER">Giáo viên</option>
            <option value="STUDENT">Học viên</option>
            <option value="ADMIN">Quản trị</option>
          </SelectField>
          <FormField label="Điện thoại" name="phone" />
          <FormField label="Email" name="email" type="email" />
          {role === 'STAFF' ? (
            <>
              <FormField label="Mã nhân viên" name="staffCode" required />
              <FormField label="Vị trí" name="position" placeholder="Tư vấn tuyển sinh" />
            </>
          ) : null}
          {role === 'TEACHER' ? (
            <>
              <FormField label="Mã giáo viên" name="teacherCode" required />
              <FormField label="Chuyên môn" name="specialization" placeholder="Toán THPT" />
              <FormField label="Bằng cấp" name="qualification" placeholder="Cử nhân Sư phạm" />
            </>
          ) : null}
          {role === 'STUDENT' ? (
            <>
              <FormField label="Mã học viên" name="studentCode" required />
              <FormField label="Trường học" name="school" />
            </>
          ) : null}
          <div className="self-end md:col-span-3">
            <SubmitButton>Tạo tài khoản</SubmitButton>
          </div>
        </form>
      </SectionCard>
      <div className="mt-6">
      <DataTable
        data={users}
        columns={[
          { key: 'fullName', header: 'Họ tên', render: (row) => row.fullName },
          { key: 'username', header: 'Tài khoản', render: (row) => row.username },
          { key: 'role', header: 'Vai trò', render: (row) => <StatusBadge value={row.role} /> },
          { key: 'status', header: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> },
          { key: 'phone', header: 'Điện thoại', render: (row) => row.phone ?? '-' },
          {
            key: 'actions',
            header: 'Cập nhật',
            render: (row) => (
              <select
                className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-700"
                value={row.status}
                onChange={(event) => updateUserStatus(row.id, event.target.value as User['status'])}
              >
                {userStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {t(status)}
                  </option>
                ))}
              </select>
            )
          }
        ]}
      />
      </div>
    </>
  );
}

export function StaffPage() {
  const users = useList<User>('/users', 0);
  if (!users) {
    return <LoadingState />;
  }
  const staff = users.filter((user) => user.role === 'STAFF');
  return (
    <>
      <PageHeader title="Quản lý nhân viên" description="Danh sách tài khoản nhân viên trung tâm." />
      <DataTable
        data={staff}
        columns={[
          { key: 'fullName', header: 'Họ tên', render: (row) => row.fullName },
          { key: 'username', header: 'Tài khoản', render: (row) => row.username },
          { key: 'phone', header: 'Điện thoại', render: (row) => row.phone ?? '-' },
          { key: 'email', header: 'Email', render: (row) => row.email ?? '-' },
          { key: 'status', header: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> }
        ]}
      />
    </>
  );
}

type StudentFormStep = 'info' | 'files';

type StudentImportRow = {
  studentCode: string;
  fullName: string;
  username: string;
  customerRole?: 'Học sinh' | 'Phụ huynh';
  email?: string;
  password?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  school?: string;
  parentCode?: string;
  parentName?: string;
  parentPhone?: string;
  relationship?: string;
};

const studentImportHeaders = [
  'Mã số',
  'Họ và tên',
  'Tài khoản đăng nhập',
  'Thư điện tử',
  'Mật khẩu',
  'Giới tính',
  'Vai trò khách hàng',
  'Loại điện thoại',
  'Số điện thoại',
  'Sinh nhật (ngày/tháng/năm)',
  'Địa chỉ',
  'Mô tả',
  'Facebook',
  'Mã số phụ huynh',
  'Tên phụ huynh',
  'Số điện thoại phụ huynh',
  'Quan hệ',
  'Trường học'
];

const customerRoleOptions = ['Học sinh', 'Phụ huynh'] as const;
const genderOptions = ['Nam', 'Nữ', 'Khác'] as const;
const phoneTypeOptions = ['Số di động', 'Số nhà', 'Cơ quan'] as const;
const relationshipOptions = ['Bố', 'Mẹ', 'Người giám hộ', 'Phụ huynh'] as const;
const toApiCustomerRole = (role?: StudentImportRow['customerRole']) => (role === 'Phụ huynh' ? 'PARENT' : 'STUDENT');
const fromApiCustomerRole = (role?: StudentProfile['customerRole']) => (role === 'PARENT' ? 'Phụ huynh' : 'Học sinh');

const studentImportTemplateRows = [
  ['HV-000001', 'Học viên 1', 'hocvien1', 'hv1@gmail.com', '123456', 'Nữ', 'Học sinh', 'Số di động', '0987654321', '01/01/2010', 'Hà Nội', '', '', 'PH-000001', 'Phụ huynh 1', '0912345678', 'Mẹ', 'THCS A'],
  ['PH-000001', 'Phụ huynh 1', 'phuhuynh1', 'ph1@gmail.com', '123456', 'Nữ', 'Phụ huynh', 'Số di động', '0912345678', '', 'Hà Nội', '', '', '', '', '', 'Phụ huynh', '']
];

const studentDocumentCategories = [
  'Chứng minh nhân dân',
  'Căn cước công dân',
  'Hộ chiếu',
  'Bằng lái xe',
  'Bằng cấp chuyên môn',
  'Giấy khám sức khỏe',
  'Ảnh cá nhân',
  'Sổ hộ khẩu'
];

const normalizePhone = (value: string) => value.replace(/\s+/g, '').replace(/^'/, '');
const isValidPhone = (value: string) => /^0\d{9,10}$/.test(normalizePhone(value));
const isValidUsername = (value: string) => /^[a-zA-Z0-9._-]{3,40}$/.test(value);
const isValidEmail = (value: string) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const toIsoDate = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parts = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (parts) {
    const [, day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return trimmed;
};

const xmlEscape = (value: string | number | undefined) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

const crc32 = (data: Uint8Array) => {
  let crc = 0xffffffff;
  data.forEach((byte) => {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  });
  return (crc ^ 0xffffffff) >>> 0;
};

const writeUint16 = (target: number[], value: number) => {
  target.push(value & 0xff, (value >>> 8) & 0xff);
};

const writeUint32 = (target: number[], value: number) => {
  target.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
};

const createZip = (files: Array<{ name: string; content: string }>) => {
  const encoder = new TextEncoder();
  const bytes: number[] = [];
  const central: number[] = [];

  files.forEach((file) => {
    const name = encoder.encode(file.name);
    const content = encoder.encode(file.content);
    const crc = crc32(content);
    const offset = bytes.length;

    writeUint32(bytes, 0x04034b50);
    writeUint16(bytes, 20);
    writeUint16(bytes, 0);
    writeUint16(bytes, 0);
    writeUint16(bytes, 0);
    writeUint16(bytes, 0);
    writeUint32(bytes, crc);
    writeUint32(bytes, content.length);
    writeUint32(bytes, content.length);
    writeUint16(bytes, name.length);
    writeUint16(bytes, 0);
    bytes.push(...name, ...content);

    writeUint32(central, 0x02014b50);
    writeUint16(central, 20);
    writeUint16(central, 20);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint32(central, crc);
    writeUint32(central, content.length);
    writeUint32(central, content.length);
    writeUint16(central, name.length);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint32(central, 0);
    writeUint32(central, offset);
    central.push(...name);
  });

  const centralOffset = bytes.length;
  bytes.push(...central);
  writeUint32(bytes, 0x06054b50);
  writeUint16(bytes, 0);
  writeUint16(bytes, 0);
  writeUint16(bytes, files.length);
  writeUint16(bytes, files.length);
  writeUint32(bytes, central.length);
  writeUint32(bytes, centralOffset);
  writeUint16(bytes, 0);
  return new Blob([new Uint8Array(bytes)], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
};

const columnName = (index: number) => {
  let value = index + 1;
  let name = '';
  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
};

const inlineCell = (column: number, row: number, value: string | number | undefined) =>
  `<c r="${columnName(column)}${row}" t="inlineStr"><is><t>${xmlEscape(value)}</t></is></c>`;

const listFormula = (options: readonly string[]) => `&quot;${options.join(',')}&quot;`;

const buildStudentTemplateWorkbook = () => {
  const rows = [studentImportHeaders, ...studentImportTemplateRows]
    .map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((value, column) => inlineCell(column, rowIndex + 1, value)).join('')}</row>`)
    .join('');
  const validations = [
    ['F2:F200', genderOptions],
    ['G2:G200', customerRoleOptions],
    ['H2:H200', phoneTypeOptions],
    ['Q2:Q200', relationshipOptions]
  ]
    .map(
      ([range, options]) =>
        `<dataValidation type="list" allowBlank="1" showErrorMessage="1" errorTitle="Giá trị không hợp lệ" error="Chỉ chọn giá trị có trong danh sách." sqref="${range}"><formula1>${listFormula(options as readonly string[])}</formula1></dataValidation>`
    )
    .join('');
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="18"/><cols>${studentImportHeaders.map((_, index) => `<col min="${index + 1}" max="${index + 1}" width="${index < 5 ? 18 : 24}" customWidth="1"/>`).join('')}</cols><sheetData>${rows}</sheetData><dataValidations count="4">${validations}</dataValidations></worksheet>`;

  return createZip([
    {
      name: '[Content_Types].xml',
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'
    },
    {
      name: '_rels/.rels',
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'
    },
    {
      name: 'xl/workbook.xml',
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Mau import hoc vien" sheetId="1" r:id="rId1"/></sheets></workbook>'
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'
    },
    { name: 'xl/worksheets/sheet1.xml', content: sheet }
  ]);
};

const downloadStudentImportTemplate = () => {
  const blob = buildStudentTemplateWorkbook();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mau-import-khach-hang.xlsx';
  link.click();
  URL.revokeObjectURL(url);
};

const parseCsvRows = (text: string) => {
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(current.trim());
      current = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }
      row.push(current.trim());
      if (row.some(Boolean)) {
        rows.push(row);
      }
      row = [];
      current = '';
    } else {
      current += char;
    }
  }

  row.push(current.trim());
  if (row.some(Boolean)) {
    rows.push(row);
  }
  return rows;
};

const parseStudentImport = (text: string) => {
  const rows = parseCsvRows(text.replace(/^\ufeff/, ''));
  const header = rows[0] ?? [];
  const indexOf = (name: string) => header.findIndex((item) => item.trim().toLowerCase() === name.toLowerCase());
  const requiredHeaders = ['Mã số', 'Họ và tên', 'Tài khoản đăng nhập', 'Thư điện tử', 'Mật khẩu', 'Số điện thoại'];
  const missingHeaders = requiredHeaders.filter((name) => indexOf(name) === -1);
  if (missingHeaders.length) {
    throw new Error(`File thiếu cột: ${missingHeaders.join(', ')}.`);
  }

  return rows.slice(1).map((row): StudentImportRow => {
    const cell = (name: string) => {
      const index = indexOf(name);
      return index >= 0 ? String(row[index] ?? '').trim() : '';
    };
    return {
      studentCode: cell('Mã số'),
      fullName: cell('Họ và tên'),
      username: cell('Tài khoản đăng nhập'),
      customerRole: (cell('Vai trò khách hàng') || 'Học sinh') as StudentImportRow['customerRole'],
      email: cell('Thư điện tử') || undefined,
      password: cell('Mật khẩu') || undefined,
      phone: normalizePhone(cell('Số điện thoại')) || undefined,
      dateOfBirth: toIsoDate(cell('Sinh nhật (ngày/tháng/năm)')),
      address: cell('Địa chỉ') || undefined,
      school: cell('Trường học') || undefined,
      parentCode: cell('Mã số phụ huynh') || undefined,
      parentName: cell('Tên phụ huynh') || undefined,
      parentPhone: normalizePhone(cell('Số điện thoại phụ huynh')) || undefined,
      relationship: cell('Quan hệ') || undefined
    };
  });
};

const parseStudentImportWorkbook = async (file: File) => {
  const text = new TextDecoder().decode(await file.arrayBuffer());
  const sheetStart = text.indexOf('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet');
  const sheetEnd = text.indexOf('</worksheet>', sheetStart);
  if (sheetStart === -1 || sheetEnd === -1) {
    throw new Error('File Excel không đúng mẫu hệ thống.');
  }
  const sheet = text.slice(sheetStart, sheetEnd + '</worksheet>'.length);
  const cellValues = new Map<string, string>();
  for (const match of sheet.matchAll(/<c r="([A-Z]+)(\d+)"[^>]*>[\s\S]*?<t>([\s\S]*?)<\/t>[\s\S]*?<\/c>/g)) {
    cellValues.set(`${match[1]}${match[2]}`, match[3].replaceAll('&quot;', '"').replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>'));
  }
  const maxRow = Math.max(...Array.from(cellValues.keys()).map((key) => Number(key.match(/\d+$/)?.[0] ?? 0)));
  const rows = Array.from({ length: maxRow }, (_, rowIndex) =>
    studentImportHeaders.map((_, columnIndex) => cellValues.get(`${columnName(columnIndex)}${rowIndex + 1}`) ?? '')
  );
  return parseStudentImport(rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n'));
};

const validateStudentPayload = (student: StudentImportRow, existingStudents: StudentProfile[], rowLabel = 'Form') => {
  const errors: string[] = [];
  if (student.fullName.trim().length < 2) {
    errors.push(`${rowLabel}: Họ tên tối thiểu 2 ký tự.`);
  }
  if (!isValidUsername(student.username)) {
    errors.push(`${rowLabel}: Tài khoản chỉ gồm chữ, số, dấu chấm, gạch dưới, gạch ngang và tối thiểu 3 ký tự.`);
  }
  if (!student.studentCode.trim()) {
    errors.push(`${rowLabel}: Mã học viên là bắt buộc.`);
  }
  if (!isValidEmail(student.email ?? '')) {
    errors.push(`${rowLabel}: Email không đúng định dạng.`);
  }
  if (student.phone && !isValidPhone(student.phone)) {
    errors.push(`${rowLabel}: Số điện thoại phải bắt đầu bằng 0 và có 10-11 chữ số.`);
  }
  if (student.parentName && !student.parentPhone) {
    errors.push(`${rowLabel}: Có tên phụ huynh thì phải nhập số điện thoại phụ huynh.`);
  }
  if (student.parentPhone && !isValidPhone(student.parentPhone)) {
    errors.push(`${rowLabel}: Số điện thoại phụ huynh không hợp lệ.`);
  }
  if (student.password && student.password.length < 6) {
    errors.push(`${rowLabel}: Mật khẩu tối thiểu 6 ký tự.`);
  }
  if (student.customerRole && !customerRoleOptions.includes(student.customerRole)) {
    errors.push(`${rowLabel}: Vai trò khách hàng chỉ được chọn Học sinh hoặc Phụ huynh.`);
  }
  if (student.customerRole === 'Học sinh' && !student.parentName) {
    errors.push(`${rowLabel}: Học sinh phải có thông tin phụ huynh.`);
  }
  if (existingStudents.some((item) => item.studentCode.toLowerCase() === student.studentCode.toLowerCase())) {
    errors.push(`${rowLabel}: Mã học viên đã tồn tại.`);
  }
  if (existingStudents.some((item) => item.user.username.toLowerCase() === student.username.toLowerCase())) {
    errors.push(`${rowLabel}: Tài khoản đăng nhập đã tồn tại.`);
  }
  return errors;
};

const payableTuitions = (student: StudentProfile) =>
  (student.tuitionPayments ?? []).filter((tuition) => tuition.status !== 'PAID');

function CreateOrderDialog({
  student,
  classes,
  onClose,
  onCreated
}: {
  student: StudentProfile;
  classes: ClassRoom[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const { t } = usePreferences();
  const [classRoomId, setClassRoomId] = useState(classes[0]?.id ?? '');
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');
  const selectedClass = classes.find((classRoom) => classRoom.id === classRoomId);
  const tuitionFee = Number(selectedClass?.course?.tuitionFee ?? 0);
  const quantity = selectedClass?.course?.numberOfSessions ?? 1;
  const total = Math.max(tuitionFee - discount, 0);
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  async function createOrder() {
    if (!classRoomId) {
      setError('Vui lòng chọn sản phẩm/lớp học.');
      return;
    }
    setError('');
    try {
      await api.post('/enrollments', {
        studentId: student.id,
        classRoomId
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <ModalShell title="Tạo đơn hàng" onClose={onClose}>
      <ErrorAlert message={error} />
      <div className="mb-5 flex items-center justify-center gap-4 text-sm font-bold">
        {['Tạo đơn hàng', 'Duyệt', 'Pay', 'Complete'].map((step, index) => (
          <span key={step} className={`inline-flex items-center gap-2 ${index === 0 ? 'text-indigo-700' : 'text-slate-400'}`}>
            <span className={`grid h-8 w-8 place-items-center rounded-full border ${index === 0 ? 'border-indigo-500 bg-white' : 'border-slate-300 bg-slate-400 text-white'}`}>{index + 1}</span>
            {t(step)}
          </span>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <section className="min-w-0">
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            {t('Sản phẩm')}
            <select className="focus-ring h-10 rounded-md border border-slate-300 bg-white px-3 text-sm" value={classRoomId} onChange={(event) => setClassRoomId(event.target.value)}>
              <option value="">{t('Chọn sản phẩm')}</option>
              {classes.map((classRoom) => (
                <option key={classRoom.id} value={classRoom.id}>
                  {classRoom.course?.name ?? classRoom.name} - {classRoom.name}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-4 overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  {['Code', 'Order name', 'Quantity', 'Price', 'Discount', 'Taxes', 'Total money', 'Manage'].map((header) => (
                    <th key={header} className="px-3 py-3">{t(header)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-3">{selectedClass?.course?.subject?.name ?? 'CS1-'}</td>
                  <td className="px-3 py-3 font-semibold">{selectedClass?.course?.name ?? '-'}</td>
                  <td className="px-3 py-3">{quantity}</td>
                  <td className="px-3 py-3">{formatMoney(tuitionFee)}</td>
                  <td className="px-3 py-3">
                    <input className="h-9 w-24 rounded-md border border-slate-300 px-2 text-sm" min={0} max={tuitionFee} type="number" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} />
                  </td>
                  <td className="px-3 py-3">{t('Không áp dụng 0%')}</td>
                  <td className="px-3 py-3 font-bold">{formatMoney(total)}</td>
                  <td className="px-3 py-3"><Trash2 className="h-4 w-4 text-slate-500" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <aside className="rounded-md border border-slate-200 p-4">
          <h3 className="text-base font-black text-slate-900">{t('Thông tin đơn hàng')}</h3>
          <div className="mt-4 grid gap-3 text-sm">
            <SelectField label="Cơ sở" name="base" defaultValue="Cơ sở 1">
              <option>Cơ sở 1</option>
            </SelectField>
            <FormField label="Thành viên" name="member" value={`${student.studentCode} - ${student.user.fullName}`} readOnly />
            <div className="grid gap-2 border-t border-slate-200 pt-3">
              <p className="flex justify-between"><span>Total Money</span><b>{formatMoney(total)}</b></p>
              <p className="flex justify-between"><span>{t('Giảm trừ')}</span><b>{formatMoney(discount)}</b></p>
              <p className="flex justify-between"><span>{t('Guests need to pay')}</span><b>{formatMoney(total)}</b></p>
              <p className="flex justify-between text-sky-700"><span>{t('Payment customers')}</span><b>{formatMoney(0)}</b></p>
              <p className="flex justify-between"><span>{t('Tiền còn thiếu')}</span><b>{formatMoney(total)}</b></p>
            </div>
            <FormField label="Ngày hẹn thanh toán" name="dueDate" type="date" value={dueDate} readOnly />
            <SelectField label="Nhân viên" name="staff" defaultValue="Quản lý">
              <option>Quản lý</option>
            </SelectField>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button className="h-10 rounded-md border border-slate-300 px-3 text-sm font-bold text-slate-700" type="button" onClick={onClose}>{t('Hủy')}</button>
            <button className="h-10 rounded-md bg-indigo-700 px-3 text-sm font-bold text-white" type="button" onClick={createOrder}>{t('Tạo đơn hàng')}</button>
          </div>
        </aside>
      </div>
    </ModalShell>
  );
}

function ReceiptDialog({
  student,
  onClose,
  onPaid
}: {
  student: StudentProfile;
  onClose: () => void;
  onPaid: () => void;
}) {
  const { t } = usePreferences();
  const payable = payableTuitions(student);
  const [tuitionId, setTuitionId] = useState(payable[0]?.id ?? '');
  const [method, setMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'CARD'>('CASH');
  const [amount, setAmount] = useState(() => {
    const first = payable[0];
    return first ? Number(first.amountDue) - Number(first.amountPaid) : 0;
  });
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const selectedTuition = payable.find((tuition) => tuition.id === tuitionId);
  const remaining = selectedTuition ? Number(selectedTuition.amountDue) - Number(selectedTuition.amountPaid) : 0;

  useEffect(() => {
    setAmount(remaining);
  }, [remaining]);

  async function pay() {
    if (!tuitionId) {
      setError('Học viên chưa có khoản cần thu.');
      return;
    }
    try {
      await api.post(`/tuition/${tuitionId}/pay`, {
        amount,
        method,
        note: note || undefined
      });
      onPaid();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <ModalShell title="Thêm mới phiếu thu" onClose={onClose}>
      <ErrorAlert message={error} />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section>
          <h3 className="mb-4 text-lg font-black text-slate-900">{t('Thông tin hóa đơn')}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField label="Cơ sở" name="base" defaultValue="Cơ sở 1">
              <option>Cơ sở 1</option>
            </SelectField>
            <SelectField label="Loại hóa đơn" name="type" defaultValue="Ví thành viên">
              <option>Ví thành viên</option>
              <option>Học phí</option>
            </SelectField>
            <SelectField label="Tên" name="tuitionId" value={tuitionId} onChange={(event) => setTuitionId(event.target.value)}>
              {payable.length ? null : <option value="">{t('Chưa có khoản cần thu')}</option>}
              {payable.map((tuition) => (
                <option key={tuition.id} value={tuition.id}>
                  {student.studentCode} {student.user.fullName} - {tuition.enrollment?.classRoom?.name ?? t('Học phí')}
                </option>
              ))}
            </SelectField>
            <SelectField label="Tài khoản thu" name="account" defaultValue="111 - Tiền mặt">
              <option>111 - Tiền mặt</option>
              <option>112 - Ngân hàng</option>
            </SelectField>
            <SelectField label="Chọn hình thức thanh toán" name="method" value={method} onChange={(event) => setMethod(event.target.value as 'CASH' | 'BANK_TRANSFER' | 'CARD')}>
              <option value="CASH">Tiền mặt</option>
              <option value="BANK_TRANSFER">Ngân hàng</option>
              <option value="CARD">Thẻ</option>
            </SelectField>
            <FormField label="Tham chiếu thanh toán" name="reference" />
            <FormField label="Lớp học" name="className" value={selectedTuition?.enrollment?.classRoom?.name ?? ''} readOnly />
            <FormField label="Lịch học" name="schedule" value={selectedTuition?.enrollment?.classRoom?.schedules?.[0]?.startTime ?? ''} readOnly />
            <label className="grid gap-1.5 text-sm font-medium text-slate-700 md:col-span-2">
              {t('Mô tả')}
              <textarea className="focus-ring min-h-24 rounded-md border border-slate-300 px-3 py-2 text-sm" value={note} onChange={(event) => setNote(event.target.value)} />
            </label>
            <SelectField label="Người thực hiện" name="staff" defaultValue="Quản lý">
              <option>Quản lý</option>
            </SelectField>
          </div>
        </section>

        <aside className="rounded-md bg-slate-50 p-4">
          <h3 className="text-lg font-black text-slate-900">{t('Thông tin thanh toán')}</h3>
          <div className="mt-4 grid gap-3 text-sm">
            <p className="flex justify-between"><span>{t('Số tiền')}</span><b>{formatMoney(remaining)}</b></p>
            <p className="flex justify-between text-indigo-700"><span>{t('Giảm trừ')}</span><b>{formatMoney(0)}</b></p>
            <p className="flex justify-between"><span>{t('Phụ phí')}</span><b>{formatMoney(0)}</b></p>
            <p className="flex justify-between"><span>{t('Số tiền cần thu')}</span><b className="text-lg text-sky-600">{formatMoney(remaining)}</b></p>
            <label className="grid gap-1.5 font-medium">
              {t('Số tiền đã thu')}
              <input className="focus-ring h-10 rounded-md border border-slate-300 bg-white px-3 text-right text-sm font-bold" max={remaining} min={1} type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
            </label>
            <p className="flex justify-between"><span>{t('Số tiền còn thiếu')}</span><b>{formatMoney(Math.max(remaining - amount, 0))}</b></p>
            <FormField label="Ngày phải trả" name="paidDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" />
              {t('Nợ xấu')}
            </label>
          </div>
          <div className="mt-5 flex justify-end">
            <button className="inline-flex h-10 items-center gap-2 rounded-md bg-indigo-700 px-4 text-sm font-bold text-white disabled:bg-slate-300" type="button" disabled={!payable.length || amount <= 0 || amount > remaining} onClick={pay}>
              <Save className="h-4 w-4" />
              {t('Lưu')}
            </button>
          </div>
        </aside>
      </div>
    </ModalShell>
  );
}

export function StudentsPage() {
  const { t } = usePreferences();
  const navigate = useNavigate();
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [importPreview, setImportPreview] = useState<StudentImportRow[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [openActionStudentId, setOpenActionStudentId] = useState('');
  const [orderStudent, setOrderStudent] = useState<StudentProfile | null>(null);
  const [receiptStudent, setReceiptStudent] = useState<StudentProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const students = useList<StudentProfile>('/students', reloadKey);
  const classes = useList<ClassRoom>('/classes', reloadKey);

  const filteredStudents = useMemo(() => {
    if (!students) {
      return [];
    }
    const normalizedSearch = search.trim().toLowerCase();
    return students.filter((student) => {
      const searchText = [
        student.studentCode,
        student.user.fullName,
        student.user.username,
        student.user.phone ?? '',
        student.user.email ?? '',
        student.school ?? ''
      ]
        .join(' ')
        .toLowerCase();
      const matchesSearch = !normalizedSearch || searchText.includes(normalizedSearch);
      const matchesStatus = statusFilter === 'all' || student.user.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, students]);

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    setError('');
    setSuccess('');
    setImportErrors([]);
    setImportPreview([]);
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const lowerName = file.name.toLowerCase();
      const rows = lowerName.endsWith('.xlsx') ? await parseStudentImportWorkbook(file) : parseStudentImport(await file.text());
      const seenCodes = new Set<string>();
      const seenUsernames = new Set<string>();
      const nextErrors = rows.flatMap((row, index) => {
        const rowLabel = `Dòng ${index + 2}`;
        const errors = validateStudentPayload(row, students ?? [], rowLabel);
        const codeKey = row.studentCode.toLowerCase();
        const usernameKey = row.username.toLowerCase();
        if (seenCodes.has(codeKey)) {
          errors.push(`${rowLabel}: Mã học viên bị trùng trong file.`);
        }
        if (seenUsernames.has(usernameKey)) {
          errors.push(`${rowLabel}: Tài khoản bị trùng trong file.`);
        }
        seenCodes.add(codeKey);
        seenUsernames.add(usernameKey);
        return errors;
      });
      setImportPreview(rows);
      setImportErrors(nextErrors);
    } catch (err) {
      setImportErrors([err instanceof Error ? err.message : 'Không đọc được file import.']);
    }
  }

  async function importStudents() {
    if (!importPreview.length || importErrors.length) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      for (const row of importPreview) {
        await api.post('/students', {
          fullName: row.fullName,
          username: row.username,
          password: row.password,
          customerRole: toApiCustomerRole(row.customerRole),
          phone: row.phone,
          email: row.email,
          studentCode: row.studentCode,
          dateOfBirth: row.dateOfBirth,
          school: row.school,
          address: row.address,
          status: 'ACTIVE',
          parents: row.parentName
            ? [
                {
                  fullName: row.parentName,
                  phone: row.parentPhone,
                  relationship: row.relationship || 'Phụ huynh'
                }
              ]
            : []
        });
      }
      setSuccess(`Đã import ${importPreview.length} học viên.`);
      setImportPreview([]);
      setImportErrors([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (!students || !classes) {
    return <LoadingState />;
  }

  const orderableClasses = classes.filter((classRoom) => classRoom.status === 'ENROLLING' || classRoom.status === 'ACTIVE');

  return (
    <>
      <PageHeader
        title="Quản lý học viên"
        description="Quản lý trước bán hàng, hồ sơ học viên, validate dữ liệu và import theo mẫu."
        action={
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md bg-indigo-700 px-4 text-sm font-bold text-white"
            type="button"
            onClick={() => navigate('/students/add')}
          >
            <Plus className="h-4 w-4" />
            {t('Thêm mới')}
          </button>
        }
      />
      <ErrorAlert message={error} />
      {success ? <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{t(success)}</div> : null}

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-3">
          <h2 className="px-3 py-2 text-base font-black text-slate-900">{t('Khách hàng')}</h2>
          <nav className="mt-2 grid gap-1">
            {[
              ['Trước bán hàng', UsersRound, students.length],
              ['Trong bán hàng', GraduationCap, students.filter((student) => (student.enrollments?.length ?? 0) > 0).length],
              ['Sau bán hàng', ClipboardCheck, students.filter((student) => student.user.status === 'ACTIVE').length],
              ['Phân loại khách hàng', Star, 3]
            ].map(([label, Icon, count]) => (
              <button
                key={String(label)}
                className="flex items-center justify-between rounded-md px-3 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 first:bg-sky-50 first:text-sky-700"
                type="button"
              >
                <span className="inline-flex items-center gap-2">
                  {typeof Icon === 'function' ? <Icon className="h-4 w-4" /> : null}
                  {t(String(label))}
                </span>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500 ring-1 ring-slate-200">{String(count)}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0">
          <SectionCard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-bold text-slate-700" type="button" onClick={downloadStudentImportTemplate}>
                  <Download className="h-4 w-4" />
                  {t('Tải mẫu Excel')}
                </button>
                <button className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-bold text-slate-700" type="button" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                  {t('Tải lên')}
                </button>
                <input ref={fileInputRef} className="hidden" type="file" accept=".xlsx,.csv,text/csv" onChange={handleImportFile} />
              </div>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-700 px-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                type="button"
                disabled={!importPreview.length || importErrors.length > 0}
                onClick={importStudents}
              >
                <FileSpreadsheet className="h-4 w-4" />
                {t('Import dữ liệu')}
              </button>
            </div>
            {importErrors.length ? (
              <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
                {importErrors.slice(0, 6).map((item) => (
                  <p key={item}>{item}</p>
                ))}
                {importErrors.length > 6 ? <p>... {importErrors.length - 6} lỗi khác</p> : null}
              </div>
            ) : null}
            {importPreview.length ? (
              <div className="mt-4">
                <DataTable
                  data={importPreview}
                  columns={[
                    { key: 'index', header: 'STT', render: (row) => importPreview.indexOf(row) + 1 },
                    { key: 'code', header: 'Mã', render: (row) => row.studentCode },
                    { key: 'name', header: 'Họ tên', render: (row) => row.fullName },
                    { key: 'customerRole', header: 'Vai trò khách hàng', render: (row) => row.customerRole ?? 'Học sinh' },
                    { key: 'username', header: 'Tài khoản', render: (row) => row.username },
                    { key: 'email', header: 'Email', render: (row) => row.email ?? '-' },
                    { key: 'phone', header: 'Điện thoại', render: (row) => row.phone ?? '-' }
                  ]}
                />
              </div>
            ) : null}
          </SectionCard>

          <SectionCard className="mt-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700">Lead</span>
                <span className="rounded-md border border-sky-200 px-3 py-2 text-sm font-bold text-sky-700">Thẩm định</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="flex h-10 items-center gap-2 rounded-full border border-slate-300 px-3 text-sm text-slate-500">
                  <Search className="h-4 w-4" />
                  <input className="min-w-0 border-0 bg-transparent outline-none" placeholder={t('Nhấn enter để tìm kiếm')} value={search} onChange={(event) => setSearch(event.target.value)} />
                </label>
                <select className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="all">{t('Tất cả trạng thái')}</option>
                  <option value="ACTIVE">{t('Hoạt động')}</option>
                  <option value="INACTIVE">{t('Ngừng hoạt động')}</option>
                  <option value="LOCKED">{t('Khóa')}</option>
                </select>
              </div>
            </div>
            <DataTable
              data={filteredStudents}
              columns={[
                { key: 'code', header: 'Code', render: (row) => row.studentCode },
                { key: 'name', header: 'Name', render: (row) => row.user.fullName },
                { key: 'email', header: 'Thư điện tử', render: (row) => row.user.email ?? '-' },
                { key: 'status', header: 'Trạng thái', render: (row) => <StatusBadge value={row.user.status} /> },
                { key: 'customerRole', header: 'Vai trò khách hàng', render: (row) => fromApiCustomerRole(row.customerRole) },
                { key: 'relation', header: 'Mối quan hệ', render: () => <span className="rounded-md bg-rose-600 px-3 py-1 text-xs font-bold text-white">Lead</span> },
                { key: 'saleBy', header: 'Được sale bởi', render: () => 'Quản lý' },
                { key: 'appointments', header: 'Lịch hẹn', render: (row) => row.enrollments?.length ?? 0 },
                {
                  key: 'actions',
                  header: 'Quản lý',
                  render: (row) => (
                    <div className="relative">
                      <button
                        className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                        type="button"
                        onClick={() => setOpenActionStudentId((current) => (current === row.id ? '' : row.id))}
                        aria-label={t('Quản lý')}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openActionStudentId === row.id ? (
                        <div className="absolute right-0 top-9 z-20 w-56 rounded-md border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-700 shadow-xl">
                          {[
                            { label: 'CRM', Icon: Eye, action: () => setSelectedStudent(row) },
                            { label: 'Thêm lịch làm việc', Icon: CalendarClock, action: () => setSelectedStudent(row) },
                            { label: 'Tạo đơn hàng', Icon: ShoppingCart, action: () => setOrderStudent(row) },
                            { label: 'Tạo hóa đơn', Icon: ReceiptText, action: () => setReceiptStudent(row) },
                            { label: 'Mở thẻ thành viên', Icon: FileText, action: () => setSelectedStudent(row) },
                            { label: 'Đổi mật khẩu', Icon: KeyRound, action: () => setError('Chức năng đổi mật khẩu sẽ dùng ở quản lý tài khoản.') },
                            { label: 'Cập nhật thành viên', Icon: UserPen, action: () => setSelectedStudent(row) },
                            { label: 'Khóa thành viên', Icon: Lock, action: () => setError('Có thể khóa tài khoản tại trang người dùng.') },
                            { label: 'Bảo toàn hồ sơ', Icon: Trash2, action: () => setError('Không xóa trực tiếp học viên đã có học phí, điểm danh hoặc bảng điểm. Hãy đổi trạng thái ghi danh nếu cần ngừng học.') }
                          ].map(({ label, Icon, action }) => (
                            <button
                              key={label}
                              className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-slate-50"
                              type="button"
                              onClick={() => {
                                setOpenActionStudentId('');
                                action();
                              }}
                            >
                              <Icon className="h-4 w-4 text-slate-500" />
                              {t(label)}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )
                }
              ]}
            />
          </SectionCard>
        </section>
      </div>
      {selectedStudent ? <StudentProfileDialog student={selectedStudent} onClose={() => setSelectedStudent(null)} /> : null}
      {orderStudent ? (
        <CreateOrderDialog
          student={orderStudent}
          classes={orderableClasses}
          onClose={() => setOrderStudent(null)}
          onCreated={() => {
            setSuccess('Đã tạo đơn hàng và khoản học phí.');
            setReloadKey((key) => key + 1);
          }}
        />
      ) : null}
      {receiptStudent ? (
        <ReceiptDialog
          student={receiptStudent}
          onClose={() => setReceiptStudent(null)}
          onPaid={() => {
            setSuccess('Đã lưu phiếu thu.');
            setReloadKey((key) => key + 1);
          }}
        />
      ) : null}
    </>
  );
}

export function StudentCreatePage() {
  const { t } = usePreferences();
  const navigate = useNavigate();
  const [reloadKey] = useState(0);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState<StudentFormStep>('info');
  const [documentCategory, setDocumentCategory] = useState(studentDocumentCategories[0]);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ category: string; file: File }>>([]);
  const documentFileInputRef = useRef<HTMLInputElement>(null);
  const students = useList<StudentProfile>('/students', reloadKey);

  function attachDocuments(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }
    setAttachedFiles((current) => [
      ...current,
      ...files.map((file) => ({
        category: documentCategory,
        file
      }))
    ]);
    event.target.value = '';
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = event.currentTarget;
    const parentName = valueOf(form, 'parentName');
    const parentPhone = valueOf(form, 'parentPhone');
    const customerRole = valueOf(form, 'customerRole') as StudentImportRow['customerRole'];
    const payload: StudentImportRow = {
      fullName: valueOf(form, 'fullName'),
      username: valueOf(form, 'username'),
      customerRole,
      password: valueOf(form, 'password') || undefined,
      phone: normalizePhone(valueOf(form, 'phone')) || undefined,
      email: valueOf(form, 'email') || undefined,
      studentCode: valueOf(form, 'studentCode'),
      dateOfBirth: valueOf(form, 'dateOfBirth') || undefined,
      school: valueOf(form, 'school') || undefined,
      address: valueOf(form, 'address') || undefined,
      parentName,
      parentPhone: normalizePhone(parentPhone) || undefined,
      relationship: valueOf(form, 'relationship') || 'Phụ huynh'
    };
    const validationErrors = validateStudentPayload(payload, students ?? []);
    if (validationErrors.length) {
      setError(validationErrors.join(' '));
      return;
    }
    try {
      await api.post('/students', {
        ...payload,
        status: valueOf(form, 'status') || 'ACTIVE',
        customerRole: toApiCustomerRole(customerRole),
        parents: parentName
          ? [
              {
                fullName: parentName,
                phone: payload.parentPhone,
                relationship: valueOf(form, 'relationship') || 'Phụ huynh'
              }
            ]
          : []
      });
      navigate('/students');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (!students) {
    return <LoadingState />;
  }

  return (
    <>
      <PageHeader
        title="Thêm mới khách hàng"
        description="Nhập thông tin khách hàng theo đúng danh mục để tránh lỗi dữ liệu."
        action={
          <button className="h-10 rounded-md border border-slate-300 px-4 text-sm font-bold text-slate-700" type="button" onClick={() => navigate('/students')}>
            {t('Quay lại')}
          </button>
        }
      />
      <ErrorAlert message={error} />
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-3">
          <h2 className="px-3 py-2 text-base font-black text-slate-900">{t('Khách hàng')}</h2>
          <nav className="mt-2 grid gap-1">
            {['Trước bán hàng', 'Trong bán hàng', 'Sau bán hàng', 'Phân loại khách hàng'].map((label, index) => (
              <button
                key={label}
                className={`flex items-center justify-between rounded-md px-3 py-3 text-sm font-bold ${index === 0 ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50'}`}
                type="button"
              >
                {t(label)}
                <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500 ring-1 ring-slate-200">{index === 3 ? 3 : students.length}</span>
              </button>
            ))}
          </nav>
        </aside>

        <SectionCard>
          <div className="mb-5 flex items-center justify-center gap-3">
            {[
              ['info', 'Thông tin'],
              ['files', 'Tập tin']
            ].map(([step, label], index) => (
              <button
                key={step}
                className={`inline-flex items-center gap-2 border-b-2 px-4 pb-2 text-sm font-bold ${
                  activeStep === step ? 'border-indigo-600 text-indigo-700' : 'border-slate-200 text-slate-400'
                }`}
                type="button"
                onClick={() => setActiveStep(step as StudentFormStep)}
              >
                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${activeStep === step ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-white'}`}>
                  {index + 1}
                </span>
                {t(label)}
              </button>
            ))}
          </div>

          {activeStep === 'info' ? (
            <form className="grid gap-6" onSubmit={handleSubmit}>
              <section>
                <h3 className="mb-4 text-lg font-black text-slate-900">{t('Thông tin chung')}</h3>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <FormField id="student-full-name" label="Họ và tên" name="fullName" minLength={2} required />
                  <FormField label="Mã học viên" name="studentCode" placeholder="HV-000001" required />
                  <FormField label="Tài khoản" name="username" minLength={3} required />
                  <FormField label="Mật khẩu" name="password" type="password" placeholder="123456" minLength={6} />
                  <FormField label="Thư điện tử" name="email" type="email" />
                  <FormField label="Số điện thoại" name="phone" inputMode="tel" pattern="0[0-9]{9,10}" />
                  <SelectField label="Trạng thái" name="status" defaultValue="ACTIVE">
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Ngừng hoạt động</option>
                    <option value="LOCKED">Khóa</option>
                  </SelectField>
                  <SelectField label="Vai trò khách hàng" name="customerRole" defaultValue="Học sinh" required>
                    {customerRoleOptions.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </SelectField>
                </div>
              </section>

              <section>
                <h3 className="mb-4 text-lg font-black text-slate-900">{t('Thông tin lớp học')}</h3>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <FormField label="Lớp học" name="className" placeholder="Chọn khi ghi danh" disabled />
                  <FormField label="Khóa học" name="courseName" placeholder="Chọn khi ghi danh" disabled />
                  <FormField label="Bộ môn" name="subjectName" placeholder="Chọn khi ghi danh" disabled />
                  <FormField label="Trình độ" name="level" placeholder="Theo khóa học" disabled />
                  <FormField label="Nhân viên kinh doanh" name="saleBy" placeholder="Quản lý" disabled />
                  <FormField label="Quản lý" name="manager" placeholder="Quản lý" disabled />
                  <FormField label="Giáo viên" name="teacher" placeholder="Chọn trong lớp học" disabled />
                </div>
              </section>

              <section>
                <h3 className="mb-4 text-lg font-black text-slate-900">{t('Thông tin khách hàng')}</h3>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <FormField label="Sinh nhật" name="dateOfBirth" type="date" />
                  <SelectField label="Giới tính" name="gender" defaultValue="">
                    <option value="">Không lưu</option>
                    {genderOptions.map((gender) => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </SelectField>
                  <FormField label="Trường học" name="school" />
                  <FormField label="Trình độ chuyên môn" name="qualification" disabled />
                  <SelectField label="Mối quan hệ" name="relationship" defaultValue="Phụ huynh">
                    {relationshipOptions.map((relationship) => (
                      <option key={relationship} value={relationship}>{relationship}</option>
                    ))}
                  </SelectField>
                  <FormField label="Tên phụ huynh" name="parentName" />
                  <FormField label="SĐT phụ huynh" name="parentPhone" inputMode="tel" pattern="0[0-9]{9,10}" />
                  <FormField label="Địa chỉ" name="address" />
                  <FormField label="Facebook" name="facebook" disabled />
                  <FormField label="Nguồn khách hàng" name="source" disabled />
                  <FormField label="Chất lượng nguồn khách hàng" name="sourceQuality" disabled />
                  <FormField label="Nhóm khách hàng" name="customerGroup" disabled />
                </div>
              </section>

              <div className="flex justify-end">
                <button className="inline-flex h-10 items-center gap-2 rounded-md bg-indigo-700 px-4 text-sm font-bold text-white" type="submit">
                  <Save className="h-4 w-4" />
                  {t('Lưu')}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
              <section className="rounded-md border border-slate-200 p-4">
                <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                  {t('Quản lý danh mục hồ sơ')}
                  <select
                    className="focus-ring h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900"
                    value={documentCategory}
                    onChange={(event) => setDocumentCategory(event.target.value)}
                  >
                    {studentDocumentCategories.map((category) => (
                      <option key={category} value={category}>{t(category)}</option>
                    ))}
                  </select>
                </label>
                <div className="mt-4">
                  <button
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-indigo-700 px-3 text-sm font-bold text-white"
                    type="button"
                    onClick={() => documentFileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    {t('Đính kèm ảnh/tài liệu')}
                  </button>
                  <input
                    ref={documentFileInputRef}
                    className="hidden"
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    multiple
                    onChange={attachDocuments}
                  />
                </div>
              </section>
              <section className="rounded-md border border-slate-200">
                <div className="grid grid-cols-[80px_1fr_120px] bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">
                  <span>STT</span>
                  <span>{t('Tập tin')}</span>
                  <span>{t('Quản lý')}</span>
                </div>
                {attachedFiles.length ? (
                  <div className="divide-y divide-slate-100">
                    {attachedFiles.map((item, index) => (
                      <div key={`${item.file.name}-${item.file.lastModified}-${index}`} className="grid grid-cols-[80px_1fr_120px] items-center px-4 py-3 text-sm">
                        <span className="font-semibold text-slate-600">{index + 1}</span>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-900">{item.file.name}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {t(item.category)} - {(item.file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          className="inline-flex items-center gap-2 rounded-md border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50"
                          type="button"
                          onClick={() => setAttachedFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t('Xóa')}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid min-h-[220px] place-items-center text-sm text-slate-500">{t('Chưa có tập tin đính kèm.')}</div>
                )}
              </section>
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}

export function TeachersPage() {
  const { hasRole } = useAuth();
  const { t } = usePreferences();
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState('');
  const teachers = useList<TeacherProfile>('/teachers', reloadKey);
  const canManageTeachers = hasRole('ADMIN');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = event.currentTarget;
    try {
      await api.post('/teachers', {
        fullName: valueOf(form, 'fullName'),
        username: valueOf(form, 'username'),
        phone: valueOf(form, 'phone') || undefined,
        email: valueOf(form, 'email') || undefined,
        teacherCode: valueOf(form, 'teacherCode'),
        specialization: valueOf(form, 'specialization') || undefined,
        qualification: valueOf(form, 'qualification') || undefined
      });
      form.reset();
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (!teachers) {
    return <LoadingState />;
  }

  return (
    <>
      <PageHeader title="Quản lý giáo viên" description="Hồ sơ giáo viên, chuyên môn và lớp được phân công." />
      <ErrorAlert message={error} />
      {canManageTeachers ? (
        <SectionCard title="Thêm giáo viên">
          <form className="grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
            <FormField label="Họ tên" name="fullName" required />
            <FormField label="Tên đăng nhập" name="username" required />
            <FormField label="Mã giáo viên" name="teacherCode" required />
            <FormField label="Điện thoại" name="phone" />
            <FormField label="Email" name="email" type="email" />
            <FormField label="Chuyên môn" name="specialization" />
            <FormField label="Bằng cấp" name="qualification" />
            <div className="md:col-span-3">
              <SubmitButton>Thêm giáo viên</SubmitButton>
            </div>
          </form>
        </SectionCard>
      ) : (
        <SectionCard>
          <p className="text-sm text-slate-500">{t('Nhân viên được xem hồ sơ giáo viên; thao tác thêm/sửa giáo viên dành cho Admin.')}</p>
        </SectionCard>
      )}
      <div className="mt-6">
        <DataTable
          data={teachers}
          columns={[
            { key: 'code', header: 'Mã', render: (row) => row.teacherCode },
            { key: 'name', header: 'Họ tên', render: (row) => row.user.fullName },
            { key: 'specialization', header: 'Chuyên môn', render: (row) => row.specialization ?? '-' },
            { key: 'phone', header: 'Điện thoại', render: (row) => row.user.phone ?? '-' },
            { key: 'classes', header: 'Số lớp', render: (row) => row.assignments?.length ?? 0 }
          ]}
        />
      </div>
    </>
  );
}

export function CoursesPage() {
  const { t } = usePreferences();
  const { hasRole } = useAuth();
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState('');
  const subjects = useList<Subject>('/subjects', reloadKey);
  const courses = useList<Course>('/courses', reloadKey);
  const canManageCourses = hasRole('ADMIN');

  async function createSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      await api.post('/subjects', {
        name: valueOf(form, 'name'),
        description: valueOf(form, 'description') || undefined
      });
      form.reset();
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function createCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      await api.post('/courses', {
        subjectId: valueOf(form, 'subjectId'),
        name: valueOf(form, 'name'),
        grade: Number(valueOf(form, 'grade')),
        tuitionFee: Number(valueOf(form, 'tuitionFee')),
        numberOfSessions: Number(valueOf(form, 'numberOfSessions'))
      });
      form.reset();
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (!subjects || !courses) {
    return <LoadingState />;
  }

  return (
    <>
      <PageHeader title="Khóa học và môn học" description="Quản lý danh mục môn học, học phí và số buổi học của từng khóa." />
      <ErrorAlert message={error} />
      {canManageCourses ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard title="Tạo môn học">
            <form className="grid gap-4" onSubmit={createSubject}>
              <FormField label="Tên môn" name="name" required />
              <FormField label="Mô tả" name="description" />
              <SubmitButton>Tạo môn</SubmitButton>
            </form>
          </SectionCard>
          <SectionCard title="Tạo khóa học">
            <form className="grid gap-4 md:grid-cols-2" onSubmit={createCourse}>
              <SelectField label="Môn học" name="subjectId" required>
                <option value="">Chọn môn</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </SelectField>
              <FormField label="Tên khóa" name="name" required />
              <FormField label="Khối lớp" name="grade" type="number" required />
              <FormField label="Học phí" name="tuitionFee" type="number" required />
              <FormField label="Số buổi" name="numberOfSessions" type="number" required />
              <div className="md:col-span-2">
                <SubmitButton>Tạo khóa</SubmitButton>
              </div>
            </form>
          </SectionCard>
        </div>
      ) : (
        <SectionCard>
          <p className="text-sm text-slate-500">{t('Nhân viên được xem khóa học; thao tác tạo/sửa môn học và khóa học dành cho Admin.')}</p>
        </SectionCard>
      )}
      <div className="mt-6">
        <SectionCard title="Tổng quan khóa học">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {courses.slice(0, 4).map((course) => (
              <article key={course.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700">
                    {course.subject?.name ?? t('Môn học')}
                  </span>
                  <BookOpen className="h-5 w-5 text-sky-700" />
                </div>
                <h3 className="mt-3 line-clamp-2 min-h-12 font-bold text-slate-950">{course.name}</h3>
                <div className="mt-3 grid gap-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-slate-400" />
                    {t('Khối')} {course.grade}
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-slate-400" />
                    {course.numberOfSessions} {t('buổi')}
                  </p>
                  <p className="flex items-center gap-2">
                    <UsersRound className="h-4 w-4 text-slate-400" />
                    {course.classes?.length ?? 0} {t('lớp')}
                  </p>
                </div>
                <p className="mt-4 text-lg font-bold text-slate-950">{formatMoney(course.tuitionFee)}</p>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
      <div className="mt-6">
        <DataTable
          data={courses}
          columns={[
            { key: 'name', header: 'Khóa học', render: (row) => row.name },
            { key: 'subject', header: 'Môn', render: (row) => row.subject?.name ?? '-' },
            { key: 'grade', header: 'Khối', render: (row) => row.grade },
            { key: 'fee', header: 'Học phí', render: (row) => formatMoney(row.tuitionFee) },
            { key: 'sessions', header: 'Số buổi', render: (row) => row.numberOfSessions },
            { key: 'classes', header: 'Số lớp', render: (row) => row.classes?.length ?? 0 }
          ]}
        />
      </div>
    </>
  );
}

export function ClassesPage() {
  const { t } = usePreferences();
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState('');
  const [classModalMode, setClassModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [assigningClass, setAssigningClass] = useState<ClassRoom | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(10);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const classes = useList<ClassRoom>('/classes', reloadKey);
  const courses = useList<Course>('/courses', reloadKey);
  const teachers = useList<TeacherProfile>('/teachers', reloadKey);
  const rooms = useList<Room>('/rooms', reloadKey);

  async function createClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = event.currentTarget;
    try {
      await api.post('/classes', {
        courseId: valueOf(form, 'courseId'),
        name: valueOf(form, 'name'),
        maxStudents: Number(valueOf(form, 'maxStudents')),
        status: valueOf(form, 'status'),
        roomIds: valuesOf(form, 'roomIds'),
        note: valueOf(form, 'note') || undefined
      });
      form.reset();
      setClassModalMode(null);
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function updateClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingClass) {
      return;
    }
    setError('');
    const form = event.currentTarget;
    try {
      await api.patch(`/classes/${editingClass.id}`, {
        courseId: valueOf(form, 'courseId'),
        name: valueOf(form, 'name'),
        maxStudents: Number(valueOf(form, 'maxStudents')),
        status: valueOf(form, 'status'),
        roomIds: valuesOf(form, 'roomIds'),
        note: valueOf(form, 'note') || undefined
      });
      setClassModalMode(null);
      setEditingClass(null);
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function assignTeacher(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = event.currentTarget;
    try {
      await api.post('/teaching-assignments', {
        teacherId: valueOf(form, 'teacherId'),
        classRoomId: valueOf(form, 'classRoomId'),
        role: valueOf(form, 'role') || 'Giáo viên chính'
      });
      form.reset();
      setAssigningClass(null);
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function openCreateModal() {
    setEditingClass(null);
    setClassModalMode('create');
  }

  function openEditModal(classRoom: ClassRoom) {
    setEditingClass(classRoom);
    setClassModalMode('edit');
  }

  const filteredClasses = useMemo(() => {
    if (!classes) {
      return [];
    }
    const normalizedSearch = search.trim().toLowerCase();
    return classes.filter((classRoom) => {
      const teacherNames = classRoom.teachingAssignments?.map((item) => item.teacher?.user.fullName).join(' ') ?? '';
      const roomNames = classRoom.roomAssignments?.map((item) => item.room?.name).join(' ') ?? '';
      const text = [
        classRoom.name,
        classRoom.course?.name,
        classRoom.course?.subject?.name,
        teacherNames,
        roomNames,
        classRoom.status
      ].join(' ').toLowerCase();
      const matchesSearch = !normalizedSearch || text.includes(normalizedSearch);
      const matchesStatus = statusFilter === 'all' || classRoom.status === statusFilter;
      const matchesCourse = courseFilter === 'all' || classRoom.courseId === courseFilter;
      const matchesRoom = roomFilter === 'all' || classRoom.roomAssignments?.some((item) => item.roomId === roomFilter);
      return matchesSearch && matchesStatus && matchesCourse && matchesRoom;
    });
  }, [classes, courseFilter, roomFilter, search, statusFilter]);

  const visibleClasses = filteredClasses.slice(0, visibleCount);
  const hasMoreClasses = visibleCount < filteredClasses.length;

  useEffect(() => {
    setVisibleCount(10);
  }, [search, statusFilter, courseFilter, roomFilter, reloadKey]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMoreClasses) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((count) => Math.min(count + 10, filteredClasses.length));
        }
      },
      {
        root: null,
        rootMargin: '140px',
        threshold: 0.1
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [filteredClasses.length, hasMoreClasses, visibleCount]);

  if (!classes || !courses || !teachers || !rooms) {
    return <LoadingState />;
  }

  const classStatusOptions: ClassRoom['status'][] = ['NOT_OPENED', 'ENROLLING', 'ACTIVE', 'POSTPONED', 'FINISHED', 'CANCELLED'];
  const selectedClassForAssignment = assigningClass ?? classes[0];

  return (
    <>
      <PageHeader
        title="Quản lý lớp học"
        description="Theo dõi danh sách lớp, sĩ số, giáo viên phụ trách và trạng thái vận hành."
        action={
          <div className="flex flex-wrap gap-2">
            <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" type="button" onClick={() => setAssigningClass(selectedClassForAssignment ?? null)}>
              {t('Phân công giáo viên')}
            </button>
            <button className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white" type="button" onClick={openCreateModal}>
              {t('Thêm lớp học')}
            </button>
          </div>
        }
      />
      <ErrorAlert message={error} />

      <SectionCard>
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_190px_220px_220px_auto]">
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            {t('Tìm kiếm')}
            <input
              className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-sky-600"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('Nhập tên lớp, khóa học, giáo viên...')}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            {t('Lọc trạng thái')}
            <select
              className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-sky-600"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">{t('Tất cả')}</option>
              {classStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {t(status)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            {t('Lọc khóa học')}
            <select
              className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-sky-600"
              value={courseFilter}
              onChange={(event) => setCourseFilter(event.target.value)}
            >
              <option value="all">{t('Tất cả')}</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            {t('Lọc phòng học')}
            <select
              className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-sky-600"
              value={roomFilter}
              onChange={(event) => setRoomFilter(event.target.value)}
            >
              <option value="all">{t('Tất cả')}</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </label>
          <div className="self-end rounded-md bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
            {t('Hiển thị {{shown}}/{{total}}', {
              shown: Math.min(visibleClasses.length, filteredClasses.length),
              total: filteredClasses.length
            })}
          </div>
        </div>

        <div className="mt-5">
          <DataTable
            data={visibleClasses}
            columns={[
              { key: 'name', header: 'Lớp', render: (row) => row.name },
              { key: 'course', header: 'Khóa', render: (row) => row.course?.name ?? '-' },
              { key: 'teacher', header: 'Giáo viên', render: (row) => row.teachingAssignments?.map((item) => item.teacher?.user.fullName).join(', ') || '-' },
              { key: 'rooms', header: 'Phòng học', render: (row) => row.roomAssignments?.map((item) => item.room?.name).filter(Boolean).join(', ') || t('Chưa gán phòng') },
              { key: 'size', header: 'Sĩ số', render: (row) => `${row.currentStudents}/${row.maxStudents}` },
              { key: 'status', header: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> },
              {
                key: 'actions',
                header: 'Thao tác',
                render: (row) => (
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700" type="button" onClick={() => openEditModal(row)}>
                      {t('Sửa')}
                    </button>
                    <button className="rounded-md border border-sky-300 px-3 py-1.5 text-xs font-semibold text-sky-700" type="button" onClick={() => setAssigningClass(row)}>
                      {t('Phân công')}
                    </button>
                  </div>
                )
              }
            ]}
          />
        </div>

        <div ref={loadMoreRef} className="mt-4 flex min-h-12 items-center justify-center rounded-md border border-dashed border-slate-200 text-sm text-slate-500">
          {hasMoreClasses
            ? t('Kéo xuống để tải thêm 10 dòng...')
            : filteredClasses.length > 0
              ? t('Đã tải hết dữ liệu phù hợp.')
              : t('Không có dữ liệu phù hợp bộ lọc.')}
        </div>
      </SectionCard>

      {classModalMode ? (
        <ModalShell
          title={classModalMode === 'create' ? 'Thêm lớp học' : 'Sửa lớp học'}
          onClose={() => {
            setClassModalMode(null);
            setEditingClass(null);
          }}
        >
          <form className="grid gap-4 md:grid-cols-2" onSubmit={classModalMode === 'create' ? createClass : updateClass}>
            <SelectField label="Khóa học" name="courseId" defaultValue={editingClass?.courseId ?? courses[0]?.id} required>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </SelectField>
            <FormField label="Tên lớp" name="name" defaultValue={editingClass?.name ?? ''} required />
            <FormField label="Sĩ số tối đa" name="maxStudents" type="number" defaultValue={editingClass?.maxStudents ?? 20} required />
            <SelectField label="Trạng thái" name="status" defaultValue={editingClass?.status ?? 'ENROLLING'}>
              {classStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {t(status)}
                </option>
              ))}
            </SelectField>
            <div className="md:col-span-2">
              <p className="mb-2 text-sm font-medium text-slate-700">{t('Phòng học')}</p>
              <div className="grid max-h-56 gap-2 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
                {rooms.map((room) => (
                  <label
                    key={room.id}
                    className="flex items-start gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  >
                    <input
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-600"
                      type="checkbox"
                      name="roomIds"
                      value={room.id}
                      defaultChecked={editingClass?.roomAssignments?.some((item) => item.roomId === room.id) ?? false}
                    />
                    <span className="min-w-0">
                      <span className="block font-semibold text-slate-900">{room.name}</span>
                      <span className="block text-xs text-slate-500">
                        {room.location || t('Chưa có vị trí')} · {room.capacity} {t('chỗ')}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">{t('Một lớp có thể dùng nhiều phòng; một phòng có thể dùng cho nhiều lớp.')}</p>
            </div>
            <div className="md:col-span-2">
              <FormField label="Ghi chú" name="note" defaultValue={editingClass?.note ?? ''} />
            </div>
            <div className="flex justify-end gap-2 md:col-span-2">
              <button
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                type="button"
                onClick={() => {
                  setClassModalMode(null);
                  setEditingClass(null);
                }}
              >
                {t('Hủy')}
              </button>
              <SubmitButton>{classModalMode === 'create' ? 'Tạo lớp' : 'Lưu thay đổi'}</SubmitButton>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {assigningClass ? (
        <ModalShell title="Phân công giáo viên" onClose={() => setAssigningClass(null)}>
          <form className="grid gap-4" onSubmit={assignTeacher}>
            <SelectField label="Lớp học" name="classRoomId" defaultValue={assigningClass.id} required>
              {classes.map((classRoom) => (
                <option key={classRoom.id} value={classRoom.id}>
                  {classRoom.name}
                </option>
              ))}
            </SelectField>
            <SelectField label="Giáo viên" name="teacherId" required>
              <option value="">Chọn giáo viên</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.user.fullName}
                </option>
              ))}
            </SelectField>
            <FormField label="Vai trò" name="role" placeholder="Giáo viên chính" />
            <div className="flex justify-end gap-2">
              <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" type="button" onClick={() => setAssigningClass(null)}>
                {t('Hủy')}
              </button>
              <SubmitButton>Phân công</SubmitButton>
            </div>
          </form>
        </ModalShell>
      ) : null}
    </>
  );
}

export function EnrollmentsPage() {
  const { t } = usePreferences();
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState('');
  const students = useList<StudentProfile>('/students', reloadKey);
  const classes = useList<ClassRoom>('/classes', reloadKey);
  const enrollments = useList<Enrollment>('/enrollments', reloadKey);
  const enrollmentStatusOptions: Enrollment['status'][] = ['ACTIVE', 'COMPLETED', 'CANCELLED'];

  async function enroll(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      await api.post('/enrollments', {
        studentId: valueOf(form, 'studentId'),
        classRoomId: valueOf(form, 'classRoomId')
      });
      form.reset();
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function updateEnrollmentStatus(id: string, status: Enrollment['status']) {
    setError('');
    try {
      await api.patch(`/enrollments/${id}/status`, { status });
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (!students || !classes || !enrollments) {
    return <LoadingState />;
  }

  const orderableClasses = classes.filter((classRoom) => classRoom.status === 'ENROLLING' || classRoom.status === 'ACTIVE');

  return (
    <>
      <PageHeader title="Ghi danh học viên" description="Đăng ký học viên vào lớp và tự động tạo khoản học phí." />
      <ErrorAlert message={error} />
      <SectionCard title="Tạo ghi danh">
        <form className="grid gap-4 md:grid-cols-3" onSubmit={enroll}>
          <SelectField label="Học viên" name="studentId" required>
            <option value="">Chọn học viên</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.studentCode} - {student.user.fullName}
              </option>
            ))}
          </SelectField>
          <SelectField label="Lớp học" name="classRoomId" required>
            <option value="">Chọn lớp</option>
            {orderableClasses.map((classRoom) => (
              <option key={classRoom.id} value={classRoom.id}>
                {classRoom.name} ({classRoom.currentStudents}/{classRoom.maxStudents})
              </option>
            ))}
          </SelectField>
          <div className="self-end">
            <SubmitButton>Ghi danh</SubmitButton>
          </div>
        </form>
      </SectionCard>
      <div className="mt-6">
        <DataTable
          data={enrollments}
          columns={[
            { key: 'student', header: 'Học viên', render: (row) => row.student?.user.fullName ?? '-' },
            { key: 'class', header: 'Lớp', render: (row) => row.classRoom?.name ?? '-' },
            { key: 'date', header: 'Ngày ghi danh', render: (row) => formatDate(row.enrollDate) },
            { key: 'tuition', header: 'Học phí', render: (row) => formatMoney(row.tuitionPayment?.amountDue) },
            { key: 'status', header: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> },
            {
              key: 'actions',
              header: 'Cập nhật',
              render: (row) => (
                <select
                  className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-700"
                  value={row.status}
                  onChange={(event) => updateEnrollmentStatus(row.id, event.target.value as Enrollment['status'])}
                >
                  {enrollmentStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {t(status)}
                    </option>
                  ))}
                </select>
              )
            }
          ]}
        />
      </div>
    </>
  );
}

type ScheduleViewMode = 'month' | 'week' | 'day-list' | 'teacher-week' | 'room';
type ScheduleSection = 'work' | 'appointments' | 'tasks';

const scheduleDays = [1, 2, 3, 4, 5, 6, 0];

const scheduleSectionItems: Array<{ key: ScheduleSection; label: string; icon: ReactNode }> = [
  { key: 'work', label: 'Lịch làm việc', icon: <CalendarDays className="h-4 w-4" /> },
  { key: 'appointments', label: 'Lịch hẹn', icon: <CalendarClock className="h-4 w-4" /> },
  { key: 'tasks', label: 'Nhiệm vụ', icon: <ClipboardCheck className="h-4 w-4" /> }
];

const scheduleViewModes: Array<{ key: ScheduleViewMode; label: string }> = [
  { key: 'month', label: 'Tháng' },
  { key: 'week', label: 'Tuần' },
  { key: 'day-list', label: 'GV Ngày' },
  { key: 'teacher-week', label: 'GV Tuần' },
  { key: 'room', label: 'Phòng' }
];

const monthTitle = (date: Date) =>
  new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(date);

const monthRangeTitle = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return `${start.getDate()} - ${end.getDate()} ${monthTitle(date)}`;
};

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function getCalendarCells(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const cell = new Date(start);
    cell.setDate(start.getDate() + index);
    return cell;
  });
}

function scheduleTeacherNames(schedule: Schedule) {
  return schedule.classRoom?.teachingAssignments?.map((item) => item.teacher?.user.fullName).filter(Boolean).join(', ') || '-';
}

function scheduleSearchText(schedule: Schedule) {
  return [
    schedule.classRoom?.name,
    schedule.classRoom?.course?.name,
    schedule.classRoom?.course?.subject?.name,
    schedule.room?.name,
    scheduleTeacherNames(schedule),
    dayLabel(schedule.dayOfWeek),
    schedule.startTime,
    schedule.endTime
  ]
    .join(' ')
    .toLowerCase();
}

function ScheduleMonthGrid({ schedules, currentDate }: { schedules: Schedule[]; currentDate: Date }) {
  const { t } = usePreferences();
  const cells = getCalendarCells(currentDate);
  const currentMonth = currentDate.getMonth();

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <div className="min-w-[980px]">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {scheduleDays.map((day) => (
            <div key={day} className="px-3 py-3 text-center text-sm font-bold text-slate-700">
              {t(dayLabel(day))}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((cell) => {
            const daySchedules = schedules.filter((schedule) => schedule.dayOfWeek === cell.getDay());
            const isCurrentMonth = cell.getMonth() === currentMonth;
            return (
              <div key={cell.toISOString()} className={`min-h-32 border-b border-l border-slate-100 p-2 ${isCurrentMonth ? 'bg-white' : 'bg-slate-50'}`}>
                <div className={`text-right text-sm font-semibold ${isCurrentMonth ? 'text-slate-600' : 'text-slate-300'}`}>{cell.getDate()}</div>
                <div className="mt-2 grid gap-1.5">
                  {daySchedules.slice(0, 4).map((schedule) => (
                    <article key={`${cell.toISOString()}-${schedule.id}`} className="rounded-md bg-sky-800 px-2 py-1.5 text-xs font-semibold text-white">
                      <p className="truncate">{schedule.startTime} - {schedule.endTime}</p>
                      <p className="truncate opacity-90">{schedule.classRoom?.name ?? t('Lớp học')}</p>
                    </article>
                  ))}
                  {daySchedules.length > 4 ? <p className="text-xs font-semibold text-slate-500">+{daySchedules.length - 4}</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SchedulesPage() {
  const { t } = usePreferences();
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [activeSection, setActiveSection] = useState<ScheduleSection>('work');
  const [viewMode, setViewMode] = useState<ScheduleViewMode>('month');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [dayFilter, setDayFilter] = useState('all');
  const classes = useList<ClassRoom>('/classes', reloadKey);
  const rooms = useList<Room>('/rooms', reloadKey);
  const schedules = useList<Schedule>('/schedules', reloadKey);
  const studySessions = useList<StudySession>('/study-sessions', reloadKey);

  async function createRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = event.currentTarget;
    try {
      await api.post('/rooms', {
        name: valueOf(form, 'name'),
        capacity: Number(valueOf(form, 'capacity')),
        location: valueOf(form, 'location') || undefined
      });
      form.reset();
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function createSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = event.currentTarget;
    try {
      await api.post('/schedules', {
        classRoomId: valueOf(form, 'classRoomId'),
        roomId: valueOf(form, 'roomId'),
        dayOfWeek: Number(valueOf(form, 'dayOfWeek')),
        startTime: valueOf(form, 'startTime'),
        endTime: valueOf(form, 'endTime')
      });
      form.reset();
      setShowCreateModal(false);
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function createStudySession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = event.currentTarget;
    try {
      await api.post('/study-sessions', {
        classRoomId: valueOf(form, 'classRoomId'),
        sessionDate: valueOf(form, 'sessionDate'),
        topic: valueOf(form, 'topic') || undefined,
        status: valueOf(form, 'status')
      });
      form.reset();
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const teacherOptions = useMemo(() => {
    const map = new Map<string, string>();
    classes?.forEach((classRoom) => {
      classRoom.teachingAssignments?.forEach((assignment) => {
        if (assignment.teacher?.id) {
          map.set(assignment.teacher.id, assignment.teacher.user.fullName);
        }
      });
    });
    schedules?.forEach((schedule) => {
      schedule.classRoom?.teachingAssignments?.forEach((assignment) => {
        if (assignment.teacher?.id) {
          map.set(assignment.teacher.id, assignment.teacher.user.fullName);
        }
      });
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [classes, schedules]);

  const filteredSchedules = useMemo(() => {
    if (!schedules) {
      return [];
    }
    const normalizedSearch = search.trim().toLowerCase();
    return schedules.filter((schedule) => {
      const matchesSearch = !normalizedSearch || scheduleSearchText(schedule).includes(normalizedSearch);
      const matchesClass = classFilter === 'all' || schedule.classRoomId === classFilter;
      const matchesRoom = roomFilter === 'all' || schedule.roomId === roomFilter;
      const matchesTeacher =
        teacherFilter === 'all' || schedule.classRoom?.teachingAssignments?.some((assignment) => assignment.teacherId === teacherFilter);
      const matchesDay = dayFilter === 'all' || schedule.dayOfWeek === Number(dayFilter);
      return matchesSearch && matchesClass && matchesRoom && matchesTeacher && matchesDay;
    });
  }, [classFilter, dayFilter, roomFilter, schedules, search, teacherFilter]);

  if (!classes || !rooms || !schedules || !studySessions) {
    return <LoadingState />;
  }

  const sectionCounts: Record<ScheduleSection, number> = {
    work: schedules.length,
    appointments: studySessions.length,
    tasks: schedules.filter((schedule) => !schedule.roomId).length
  };

  const title = viewMode === 'month' ? monthRangeTitle(currentDate) : monthTitle(currentDate);

  return (
    <>
      <PageHeader
        title="Lịch làm việc"
        action={
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md bg-indigo-700 px-4 text-sm font-bold text-white shadow-sm hover:bg-indigo-800"
            type="button"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4" />
            {t('Thêm mới')}
          </button>
        }
      />
      <ErrorAlert message={error} />

      <div className="mb-5 grid gap-5 xl:grid-cols-2">
        <SectionCard title="Quản lý phòng học">
          <form className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-[1fr_140px_1fr]" onSubmit={createRoom}>
            <FormField label="Tên phòng" name="name" placeholder="Phòng A103" required />
            <FormField label="Sức chứa" name="capacity" type="number" min={1} defaultValue={20} required />
            <FormField label="Vị trí" name="location" placeholder="Tầng 1" />
            <div className="sm:col-span-2 2xl:col-span-3">
              <SubmitButton>Thêm phòng</SubmitButton>
            </div>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {rooms.map((room) => (
              <span key={room.id} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                {room.name} · {room.capacity} {t('chỗ')} · {room.location ?? t('Chưa có vị trí')}
              </span>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Tạo buổi học">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={createStudySession}>
            <SelectField label="Lớp học" name="classRoomId" required>
              <option value="">Chọn lớp</option>
              {classes.map((classRoom) => (
                <option key={classRoom.id} value={classRoom.id}>
                  {classRoom.name}
                </option>
              ))}
            </SelectField>
            <FormField label="Ngày học" name="sessionDate" type="date" required />
            <FormField label="Nội dung buổi học" name="topic" placeholder="Ôn tập chương 1" />
            <SelectField label="Trạng thái" name="status" defaultValue="SCHEDULED">
              <option value="SCHEDULED">Đã lên lịch</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </SelectField>
            <div className="md:col-span-2">
              <SubmitButton>Tạo buổi học</SubmitButton>
            </div>
          </form>
          <div className="mt-4 grid gap-2">
            {studySessions.slice(0, 4).map((session) => (
              <div key={session.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <div>
                  <p className="text-sm font-bold text-slate-900">{session.classRoom?.name ?? t('Lớp học')}</p>
                  <p className="text-xs text-slate-500">{formatDate(session.sessionDate)} · {session.topic ?? t('Buổi học')}</p>
                </div>
                <StatusBadge value={session.status} />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-3">
          <h2 className="px-3 py-2 text-base font-black text-slate-900">{t('Lịch làm việc')}</h2>
          <nav className="mt-2 grid gap-1">
            {scheduleSectionItems.map((item) => (
              <button
                key={item.key}
                className={`flex items-center justify-between rounded-md px-3 py-3 text-sm font-bold ${
                  activeSection === item.key ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
                type="button"
                onClick={() => setActiveSection(item.key)}
              >
                <span className="inline-flex items-center gap-2">
                  {item.icon}
                  {t(item.label)}
                </span>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500 ring-1 ring-slate-200">{sectionCounts[item.key]}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex overflow-hidden rounded-md border border-slate-200">
                <button className="grid h-10 w-10 place-items-center bg-slate-800 text-white" type="button" onClick={() => setCurrentDate((date) => addMonths(date, -1))}>
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="grid h-10 w-10 place-items-center border-l border-slate-700 bg-slate-800 text-white" type="button" onClick={() => setCurrentDate((date) => addMonths(date, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <button className="h-10 rounded-md bg-slate-100 px-3 text-sm font-bold text-slate-700" type="button" onClick={() => setCurrentDate(new Date())}>
                {t('Hôm nay')}
              </button>
              <button className="h-10 rounded-md bg-slate-800 px-3 text-sm font-bold text-white" type="button" onClick={() => setViewMode('day-list')}>
                {t('DS ngày')}
              </button>
              <button className="h-10 rounded-md bg-slate-800 px-3 text-sm font-bold text-white" type="button" onClick={() => setViewMode('week')}>
                {t('DS tuần')}
              </button>
            </div>

            <h3 className="min-w-[220px] text-center text-xl font-black text-slate-950">{title}</h3>

            <div className="flex flex-wrap justify-end gap-2">
              <div className="inline-flex overflow-hidden rounded-md border border-slate-800">
                {scheduleViewModes.map((mode) => (
                  <button
                    key={mode.key}
                    className={`h-10 px-3 text-sm font-bold ${viewMode === mode.key ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                    type="button"
                    onClick={() => setViewMode(mode.key)}
                  >
                    {t(mode.label)}
                  </button>
                ))}
              </div>
              <button
                className={`inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-bold ${
                  showFilters ? 'bg-slate-800 text-white' : 'border border-slate-300 text-slate-700'
                }`}
                type="button"
                onClick={() => setShowFilters((value) => !value)}
              >
                <Filter className="h-4 w-4" />
                {t('Bộ lọc')}
              </button>
            </div>
          </div>

          {showFilters ? (
            <div className="mt-4 grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 md:grid-cols-2 xl:grid-cols-5">
              <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                {t('Tìm kiếm')}
                <div className="flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
                    placeholder={t('Nhập tên, lớp, mã, trạng thái...')}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                {t('Lọc lớp')}
                <select className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none" value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
                  <option value="all">{t('Tất cả')}</option>
                  {classes.map((classRoom) => (
                    <option key={classRoom.id} value={classRoom.id}>{classRoom.name}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                {t('Lọc phòng học')}
                <select className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none" value={roomFilter} onChange={(event) => setRoomFilter(event.target.value)}>
                  <option value="all">{t('Tất cả')}</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                {t('Lọc giáo viên')}
                <select className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none" value={teacherFilter} onChange={(event) => setTeacherFilter(event.target.value)}>
                  <option value="all">{t('Tất cả')}</option>
                  {teacherOptions.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                {t('Lọc thứ')}
                <select className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none" value={dayFilter} onChange={(event) => setDayFilter(event.target.value)}>
                  <option value="all">{t('Tất cả')}</option>
                  {scheduleDays.map((day) => (
                    <option key={day} value={day}>{t(dayLabel(day))}</option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          <div className="mt-4">
            {viewMode === 'month' ? (
              <ScheduleMonthGrid schedules={filteredSchedules} currentDate={currentDate} />
            ) : viewMode === 'week' || viewMode === 'teacher-week' ? (
              <CalendarBoard schedules={filteredSchedules} title={viewMode === 'teacher-week' ? 'Lịch giáo viên theo tuần' : 'Lịch học trực quan'} />
            ) : (
              <DataTable
                data={filteredSchedules}
                columns={[
                  { key: 'class', header: 'Lớp', render: (row) => row.classRoom?.name ?? '-' },
                  { key: 'teacher', header: 'Giáo viên', render: (row) => scheduleTeacherNames(row) },
                  { key: 'room', header: 'Phòng', render: (row) => row.room?.name ?? '-' },
                  { key: 'day', header: 'Thứ', render: (row) => t(dayLabel(row.dayOfWeek)) },
                  { key: 'time', header: 'Giờ', render: (row) => `${row.startTime} - ${row.endTime}` }
                ]}
              />
            )}
          </div>
        </section>
      </div>

      {showCreateModal ? (
        <ModalShell title="Thêm mới lịch học" onClose={() => setShowCreateModal(false)}>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={createSchedule}>
            <SelectField label="Lớp" name="classRoomId" required>
              <option value="">Chọn lớp</option>
              {classes.map((classRoom) => (
                <option key={classRoom.id} value={classRoom.id}>
                  {classRoom.name}
                </option>
              ))}
            </SelectField>
            <SelectField label="Phòng" name="roomId" required>
              <option value="">Chọn phòng</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </SelectField>
            <SelectField label="Thứ" name="dayOfWeek" required>
              {scheduleDays.map((day) => (
                <option key={day} value={day}>
                  {dayLabel(day)}
                </option>
              ))}
            </SelectField>
            <FormField label="Bắt đầu" name="startTime" placeholder="18:00" required />
            <FormField label="Giờ kết thúc" name="endTime" placeholder="20:00" required />
            <div className="flex justify-end gap-2 md:col-span-2">
              <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" type="button" onClick={() => setShowCreateModal(false)}>
                {t('Hủy')}
              </button>
              <SubmitButton>Tạo lịch</SubmitButton>
            </div>
          </form>
        </ModalShell>
      ) : null}
    </>
  );
}

export function TuitionPage() {
  const { t } = usePreferences();
  const navigate = useNavigate();
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState('');
  const [lastInvoiceId, setLastInvoiceId] = useState('');
  const tuition = useList<TuitionPayment>('/tuition', reloadKey);

  async function pay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      const response = await api.post(`/tuition/${valueOf(form, 'tuitionId')}/pay`, {
        amount: Number(valueOf(form, 'amount')),
        method: valueOf(form, 'method'),
        note: valueOf(form, 'note') || undefined
      });
      setLastInvoiceId(response.data.id);
      form.reset();
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const payable = useMemo(() => tuition?.filter((item) => item.status !== 'PAID') ?? [], [tuition]);

  if (!tuition) {
    return <LoadingState />;
  }

  return (
    <>
      <PageHeader title="Quản lý học phí" description="Ghi nhận thanh toán, tạo hóa đơn và theo dõi công nợ." />
      <ErrorAlert message={error} />
      {lastInvoiceId ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-800">{t('Đã tạo phiếu thu mới.')}</p>
          <button
            className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-bold text-white"
            type="button"
            onClick={() => navigate(`/invoices/${lastInvoiceId}`)}
          >
            {t('Xem phiếu thu')}
          </button>
        </div>
      ) : null}
      <SectionCard title="Thu học phí">
        <form className="grid gap-4 md:grid-cols-4" onSubmit={pay}>
          <SelectField label="Khoản học phí" name="tuitionId" required>
            <option value="">Chọn khoản</option>
            {payable.map((item) => (
              <option key={item.id} value={item.id}>
                {item.student?.user.fullName} - {t('còn')} {formatMoney(Number(item.amountDue) - Number(item.amountPaid))}
              </option>
            ))}
          </SelectField>
          <FormField label="Số tiền" name="amount" type="number" required />
          <SelectField label="Phương thức" name="method" defaultValue="CASH">
            <option value="CASH">Tiền mặt</option>
            <option value="BANK_TRANSFER">Chuyển khoản</option>
            <option value="CARD">Thẻ</option>
          </SelectField>
          <FormField label="Ghi chú" name="note" />
          <div className="md:col-span-4">
            <SubmitButton>Ghi nhận thanh toán</SubmitButton>
          </div>
        </form>
      </SectionCard>
      <div className="mt-6">
        <DataTable
          data={tuition}
          columns={[
            { key: 'student', header: 'Học viên', render: (row) => row.student?.user.fullName ?? '-' },
            { key: 'class', header: 'Lớp', render: (row) => row.enrollment?.classRoom?.name ?? '-' },
            { key: 'due', header: 'Phải thu', render: (row) => formatMoney(row.amountDue) },
            { key: 'paid', header: 'Đã thu', render: (row) => formatMoney(row.amountPaid) },
            { key: 'date', header: 'Hạn đóng', render: (row) => formatDate(row.dueDate) },
            { key: 'status', header: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> },
            {
              key: 'invoice',
              header: 'Phiếu thu',
              render: (row) => {
                const invoice = row.invoices?.[0];
                return invoice ? (
                  <button
                    className="rounded-md border border-sky-300 px-3 py-1.5 text-xs font-semibold text-sky-700"
                    type="button"
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                  >
                    {t('Xem phiếu thu')}
                  </button>
                ) : (
                  <span className="text-sm text-slate-400">{t('Chưa có')}</span>
                );
              }
            }
          ]}
        />
      </div>
    </>
  );
}

type ReportSection = 'revenue' | 'attendance' | 'learning';
type RevenueReport = { totalDue: number; totalPaid: number; totalDebt: number; items: TuitionPayment[] };
type AttendanceReport = { present: number; absent: number; late: number; details: AttendanceDetail[] };
type LearningReport = { average: number; totalScores: number; scores: Score[] };

const REPORT_PREVIEW_LIMIT = 5;
const reportSections: ReportSection[] = ['revenue', 'attendance', 'learning'];

function isReportSection(value: string | undefined): value is ReportSection {
  return value === 'revenue' || value === 'attendance' || value === 'learning';
}

function reportSectionTitle(section: ReportSection) {
  return {
    revenue: 'Doanh thu',
    attendance: 'Chuyên cần',
    learning: 'Kết quả học tập'
  }[section];
}

function ReportSummaryButton({
  active,
  children,
  onClick,
  title
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  title: string;
}) {
  const { t } = usePreferences();

  return (
    <button
      className={`rounded-lg border bg-white p-5 text-left transition hover:border-sky-300 hover:shadow-sm ${
        active ? 'border-sky-500 ring-2 ring-sky-100' : 'border-slate-200'
      }`}
      type="button"
      onClick={onClick}
    >
      <h2 className="mb-4 text-base font-semibold text-slate-900">{t(title)}</h2>
      {children}
    </button>
  );
}

export function ReportsPage() {
  const { t } = usePreferences();
  const navigate = useNavigate();
  const params = useParams<{ section?: string }>();
  const routeSection = isReportSection(params.section) ? params.section : null;
  const [selectedSection, setSelectedSection] = useState<ReportSection | null>(null);
  const [revenue, setRevenue] = useState<RevenueReport | null>(null);
  const [attendance, setAttendance] = useState<AttendanceReport | null>(null);
  const [learning, setLearning] = useState<LearningReport | null>(null);

  useEffect(() => {
    Promise.all([
      api.get('/reports/revenue'),
      api.get('/reports/attendance'),
      api.get('/reports/learning-results')
    ]).then(([revenueResponse, attendanceResponse, learningResponse]) => {
      setRevenue(revenueResponse.data);
      setAttendance(attendanceResponse.data);
      setLearning(learningResponse.data);
    });
  }, []);

  useEffect(() => {
    setSelectedSection(routeSection);
  }, [routeSection]);

  if (!revenue || !attendance || !learning) {
    return <LoadingState />;
  }

  const isFullPage = Boolean(routeSection);
  const visibleSections = selectedSection ? [selectedSection] : reportSections;

  const showSection = (section: ReportSection) => {
    if (isFullPage) {
      navigate(`/reports/${section}`);
      return;
    }
    setSelectedSection((current) => (current === section ? null : section));
  };

  const tableHeader = (section: ReportSection, total: number) => {
    const hasMore = !isFullPage && total > REPORT_PREVIEW_LIMIT;
    return (
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-950">{t(reportSectionTitle(section))}</h2>
          <p className="text-sm text-slate-500">
            {t('Hiển thị')} {isFullPage ? total : Math.min(total, REPORT_PREVIEW_LIMIT)}/{total}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isFullPage && selectedSection ? (
            <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700" type="button" onClick={() => setSelectedSection(null)}>
              {t('Hiện tất cả')}
            </button>
          ) : null}
          {hasMore ? (
            <button className="rounded-md bg-sky-700 px-3 py-2 text-sm font-bold text-white" type="button" onClick={() => navigate(`/reports/${section}`)}>
              {t('Xem thêm')}
            </button>
          ) : null}
        </div>
      </div>
    );
  };

  const revenueRows = isFullPage ? revenue.items : revenue.items.slice(0, REPORT_PREVIEW_LIMIT);
  const attendanceRows = isFullPage ? attendance.details : attendance.details.slice(0, REPORT_PREVIEW_LIMIT);
  const learningRows = isFullPage ? learning.scores : learning.scores.slice(0, REPORT_PREVIEW_LIMIT);

  const renderReportTable = (section: ReportSection) => {
    if (section === 'revenue') {
      return (
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          {tableHeader('revenue', revenue.items.length)}
          <DataTable
            data={revenueRows}
            columns={[
              { key: 'student', header: 'Học viên', render: (row) => row.student?.user.fullName ?? '-' },
              { key: 'class', header: 'Lớp', render: (row) => row.enrollment?.classRoom?.name ?? '-' },
              { key: 'due', header: 'Phải thu', render: (row) => formatMoney(row.amountDue) },
              { key: 'paid', header: 'Đã thu', render: (row) => formatMoney(row.amountPaid) },
              { key: 'debt', header: 'Công nợ', render: (row) => formatMoney(Number(row.amountDue) - Number(row.amountPaid)) },
              { key: 'status', header: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> }
            ]}
          />
        </section>
      );
    }

    if (section === 'attendance') {
      return (
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          {tableHeader('attendance', attendance.details.length)}
          <DataTable
            data={attendanceRows}
            columns={[
              { key: 'student', header: 'Học viên', render: (row) => row.student?.user.fullName ?? '-' },
              { key: 'class', header: 'Lớp', render: (row) => row.attendance?.studySession?.classRoom?.name ?? '-' },
              { key: 'session', header: 'Buổi học', render: (row) => row.attendance?.studySession?.topic ?? '-' },
              { key: 'date', header: 'Ngày', render: (row) => formatDate(row.attendance?.studySession?.sessionDate) },
              { key: 'status', header: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> },
              { key: 'note', header: 'Ghi chú', render: (row) => row.note ?? '-' }
            ]}
          />
        </section>
      );
    }

    return (
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        {tableHeader('learning', learning.scores.length)}
        <DataTable
          data={learningRows}
          columns={[
            { key: 'student', header: 'Học viên', render: (row) => row.student?.user.fullName ?? '-' },
            { key: 'class', header: 'Lớp', render: (row) => row.exam?.classRoom?.name ?? '-' },
            { key: 'exam', header: 'Bài kiểm tra', render: (row) => row.exam?.name ?? '-' },
            { key: 'date', header: 'Ngày kiểm tra', render: (row) => formatDate(row.exam?.examDate) },
            { key: 'score', header: 'Điểm', render: (row) => `${row.value}/${row.exam?.maxScore ?? '-'}` },
            { key: 'comment', header: 'Nhận xét', render: (row) => row.comment ?? '-' }
          ]}
        />
      </section>
    );
  };

  return (
    <>
      <PageHeader
        title={isFullPage && selectedSection ? reportSectionTitle(selectedSection) : 'Báo cáo thống kê'}
        description="Doanh thu, công nợ, chuyên cần và kết quả học tập."
        action={
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md bg-sky-700 px-4 text-sm font-bold text-white"
            type="button"
            onClick={() => downloadReportsCsv(revenue, attendance, learning)}
          >
            <Download className="h-4 w-4" />
            {t('Xuất báo cáo')}
          </button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <ReportSummaryButton active={selectedSection === 'revenue'} title="Doanh thu" onClick={() => showSection('revenue')}>
          <p className="text-2xl font-bold text-slate-950">{formatMoney(revenue.totalPaid)}</p>
          <p className="mt-2 text-sm text-slate-500">{t('Công nợ')}: {formatMoney(revenue.totalDebt)}</p>
        </ReportSummaryButton>
        <ReportSummaryButton active={selectedSection === 'attendance'} title="Chuyên cần" onClick={() => showSection('attendance')}>
          <p className="text-sm text-slate-600">{t('Có mặt')}: {attendance.present}</p>
          <p className="text-sm text-slate-600">{t('Vắng')}: {attendance.absent}</p>
          <p className="text-sm text-slate-600">{t('Đi muộn')}: {attendance.late}</p>
        </ReportSummaryButton>
        <ReportSummaryButton active={selectedSection === 'learning'} title="Kết quả học tập" onClick={() => showSection('learning')}>
          <p className="text-2xl font-bold text-slate-950">{learning.average.toFixed(2)}</p>
          <p className="mt-2 text-sm text-slate-500">{t('Tổng số điểm')}: {learning.totalScores}</p>
        </ReportSummaryButton>
      </div>
      <div className="mt-6 grid gap-5">
        {visibleSections.map((section) => (
          <div key={section}>{renderReportTable(section)}</div>
        ))}
      </div>
    </>
  );
}
