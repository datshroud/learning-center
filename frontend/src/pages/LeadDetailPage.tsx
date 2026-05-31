import {
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Edit3,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Send,
  Settings,
  Sparkles,
  Target,
  UserPlus,
  Zap
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingState } from '../components/LoadingState';
import { StatusBadge } from '../components/StatusBadge';
import { usePreferences } from '../contexts/PreferencesContext';
import { api, formatDate } from '../lib/api';
import type { StudentProfile } from '../types/domain';

const leadSteps = ['Mới', 'Đã liên hệ', 'Đã hẹn kiểm tra', 'Đã kiểm tra', 'Đăng ký học'];

const timeline = [
  {
    title: 'Hẹn tư vấn lại khách hàng này',
    time: '--',
    icon: <CalendarCheck className="h-5 w-5" />,
    color: 'bg-sky-50 text-sky-700'
  },
  {
    title: 'Cập nhật trạng thái đăng ký học',
    time: '--',
    icon: <UserPlus className="h-5 w-5" />,
    color: 'bg-emerald-50 text-emerald-700'
  },
  {
    title: 'Cập nhật quá trình tư vấn',
    time: '14:00, 20/02/2026',
    icon: <Sparkles className="h-5 w-5" />,
    color: 'bg-rose-50 text-rose-700',
    detail: true
  },
  {
    title: 'Chọn lộ trình học cho học viên',
    time: '14:00, 20/02/2026',
    icon: <Zap className="h-5 w-5" />,
    color: 'bg-amber-50 text-amber-700',
    detail: true
  },
  {
    title: 'Hẹn tư vấn và kiểm tra đầu vào',
    time: '14:00, 20/02/2026',
    icon: <CalendarCheck className="h-5 w-5" />,
    color: 'bg-sky-50 text-sky-700',
    detail: true,
    hasScores: true
  },
  {
    title: 'Liên hệ xác nhận thông tin',
    time: '14:00, 20/02/2026',
    icon: <Edit3 className="h-5 w-5" />,
    color: 'bg-orange-50 text-orange-700'
  },
  {
    title: 'Nhận lead mới',
    time: '14:00, 20/02/2026',
    icon: <UserPlus className="h-5 w-5" />,
    color: 'bg-violet-50 text-violet-700'
  }
];

const notes = [
  'Muốn cải thiện kỹ năng tiếng Anh để nâng cao cơ hội nghề nghiệp và giao tiếp tự tin hơn khi đi du lịch quốc tế.',
  'Ưa chuộng học tiếng Anh qua các lớp học trực tuyến và các ứng dụng học ngôn ngữ có tính tương tác cao.',
  'Có thể học vào buổi tối và cuối tuần do công việc bận rộn trong tuần.'
];

const leadTabs = ['Tổng quan', 'Hồ sơ chi tiết', 'Lịch sử tư vấn', 'Kiểm tra đầu vào'];

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(-2)
    .join('')
    .toUpperCase();
}

type TimelineItem = {
  title: string;
  time: string;
  icon: ReactNode;
  color: string;
  detail?: boolean;
  hasScores?: boolean;
};

function ActionButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick?: () => void }) {
  const { t } = usePreferences();

  return (
    <button
      className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700"
      type="button"
      onClick={onClick}
    >
      {icon}
      <span>{t(label)}</span>
    </button>
  );
}

function ScoreBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
      <p className="text-lg font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
    </div>
  );
}

export function LeadDetailPage() {
  const { t } = usePreferences();
  const navigate = useNavigate();
  const noteRef = useRef<HTMLTextAreaElement | null>(null);
  const [students, setStudents] = useState<StudentProfile[] | null>(null);
  const [activeStudentId, setActiveStudentId] = useState('');
  const [activeTab, setActiveTab] = useState(leadTabs[0]);
  const [actionMessage, setActionMessage] = useState('');
  const [activityItems, setActivityItems] = useState<TimelineItem[]>([]);

  useEffect(() => {
    api.get<StudentProfile[]>('/students').then((response) => {
      setStudents(response.data);
      setActiveStudentId(response.data[0]?.id ?? '');
    });
  }, []);

  const student = useMemo(
    () => students?.find((item) => item.id === activeStudentId) ?? students?.[0],
    [activeStudentId, students]
  );

  if (!students || !student) {
    return <LoadingState />;
  }

  const currentStudent = student;
  const latestEnrollment = currentStudent.enrollments?.[0];
  const latestTuition = currentStudent.tuitionPayments?.[0];
  const parent = currentStudent.parents?.[0];
  const timelineItems = [...activityItems, ...timeline];

  function schedulePlacementTest() {
    setActivityItems((current) => [
      {
        title: `Đã hẹn kiểm tra đầu vào cho ${currentStudent.user.fullName}`,
        time: new Date().toLocaleString('vi-VN'),
        icon: <CalendarCheck className="h-5 w-5" />,
        color: 'bg-sky-50 text-sky-700',
        detail: true,
        hasScores: true
      },
      ...current
    ]);
    setActionMessage('Đã thêm lịch hẹn kiểm tra đầu vào vào lịch sử tư vấn.');
  }

  function sendLeadEmail() {
    if (!currentStudent.user.email) {
      setActionMessage('Lead chưa có email, hãy bổ sung email trước khi gửi.');
      return;
    }
    window.location.href = `mailto:${currentStudent.user.email}?subject=${encodeURIComponent('Tư vấn khóa học tại trung tâm')}`;
    setActionMessage('Đã mở ứng dụng email với địa chỉ của lead.');
  }

  function focusEditNote() {
    noteRef.current?.focus();
    noteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setActionMessage('Có thể cập nhật ghi chú tư vấn ở khung bên phải.');
  }

  function viewTimelineDetail(item: TimelineItem) {
    if (item.hasScores) {
      setActiveTab('Kiểm tra đầu vào');
    } else if (item.title.includes('lộ trình')) {
      setActiveTab('Hồ sơ chi tiết');
    } else {
      setActiveTab('Lịch sử tư vấn');
    }
    setActionMessage(`Đang xem chi tiết: ${item.title}`);
  }

  const contactCards = [
    {
      label: 'Số điện thoại',
      value: student.user.phone ?? parent?.phone ?? '-',
      icon: <Phone className="h-4 w-4" />,
      accent: true
    },
    {
      label: 'Email',
      value: student.user.email ?? '-',
      icon: <Mail className="h-4 w-4" />,
      accent: true
    },
    {
      label: 'Địa chỉ',
      value: student.address ?? '-',
      icon: <MapPin className="h-4 w-4" />
    },
    {
      label: 'Tư vấn phụ trách',
      value: 'Nguyễn Minh Tuấn'
    },
    {
      label: 'Nguồn Lead',
      value: 'Google Ads'
    },
    {
      label: 'Ngày tạo',
      value: formatDate(latestEnrollment?.enrollDate)
    }
  ];

  return (
    <div className="mx-auto grid max-w-7xl gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-2 inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-sky-700">
              CRM Workspace
            </p>
            <h1 className="text-2xl font-black text-slate-950">{t('Chi tiết leads')}</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              {t('Theo dõi tư vấn, kiểm tra đầu vào và chuyển đổi đăng ký học.')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ActionButton icon={<Send className="h-4 w-4" />} label="Gửi mail" onClick={sendLeadEmail} />
            <ActionButton icon={<CalendarCheck className="h-4 w-4" />} label="Hẹn test" onClick={schedulePlacementTest} />
            <ActionButton icon={<Settings className="h-4 w-4" />} label="Chỉnh sửa" onClick={focusEditNote} />
            <button
              className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 text-slate-600"
              type="button"
              onClick={() => setActionMessage('Các thao tác nhanh gồm gửi mail, hẹn test và cập nhật ghi chú tư vấn.')}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
        {actionMessage ? (
          <div className="mt-4 rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800">
            {t(actionMessage)}
          </div>
        ) : null}
      </section>

      <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="grid min-w-0 content-start gap-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <button
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500"
              type="button"
              onClick={() => navigate('/students')}
            >
              <ChevronLeft className="h-4 w-4" />
              {t('Trở lại danh sách')}
            </button>

            <label className="mt-5 grid gap-2 text-sm font-semibold text-slate-600">
              {t('Chọn lead mẫu')}
              <select
                className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                value={student.id}
                onChange={(event) => setActiveStudentId(event.target.value)}
              >
                {students.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.user.fullName}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-5 flex min-w-0 items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-slate-900 text-sm font-black text-white">
                {initials(student.user.fullName)}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-black text-slate-950">{student.user.fullName}</h2>
                <p className="text-sm text-slate-500">{t('Học sinh')}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-md border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm font-bold text-rose-700">
                Hot Lead
              </span>
              <span className="rounded-md border border-orange-300 bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-700">
                {t('Cần tư vấn lại')}
              </span>
            </div>

            <div className="mt-5 grid gap-3 border-t border-slate-200 pt-5">
              <p className="text-sm font-semibold text-slate-500">{t('Thông tin liên hệ')}</p>
              {leadTabs.map((tab) => (
                <button
                  key={tab}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-bold ${
                    activeTab === tab ? 'bg-sky-50 text-sky-700' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    setActionMessage(`Đang xem mục ${tab.toLowerCase()} của lead.`);
                  }}
                >
                  <ClipboardList className="h-4 w-4" />
                  {t(tab)}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-base font-black text-slate-950">{t('Danh sách leads')}</h2>
            <div className="mt-4 grid max-h-[480px] gap-3 overflow-y-auto pr-1">
              {students.slice(0, 8).map((item, index) => (
                <button
                  key={item.id}
                  className={`rounded-lg border p-3 text-left transition ${
                    item.id === student.id ? 'border-sky-300 bg-sky-50 shadow-sm' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => setActiveStudentId(item.id)}
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-black text-slate-950">{item.user.fullName}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{item.user.phone ?? parent?.phone ?? t('Chưa có SĐT')}</p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-slate-400">#{index + 1}</span>
                  </div>
                  <div className="mt-3">
                    <StatusBadge value={item.enrollments?.[0]?.status ?? 'ACTIVE'} />
                  </div>
                </button>
              ))}
            </div>
          </section>
        </aside>

        <main className="grid min-w-0 content-start gap-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">{t('Tổng quan')}</h2>
                <p className="mt-1 text-sm text-slate-500">{t(activeTab)}</p>
              </div>
              <StatusBadge value={latestTuition?.status ?? 'UNPAID'} />
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {leadSteps.map((step, index) => (
                <div
                  key={step}
                  className={`flex min-h-16 items-center justify-center gap-2 rounded-lg border px-3 py-3 text-center text-sm font-black leading-5 ${
                    index <= 3
                      ? 'border-violet-200 bg-violet-50 text-violet-800'
                      : 'border-slate-200 bg-slate-50 text-slate-500'
                  }`}
                >
                  {index <= 3 ? <Check className="h-4 w-4 shrink-0" /> : null}
                  <span>{t(step)}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {contactCards.map((item) => (
                <div key={item.label} className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    {item.icon}
                    {t(item.label)}
                  </p>
                  <p className={`mt-2 break-words text-base font-black leading-6 ${item.accent ? 'text-sky-700' : 'text-slate-900'}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-black text-slate-950">{t('Lịch sử tư vấn')}</h2>
              <div className="mt-5 grid gap-4">
                {timelineItems.map((item, index) => (
                  <article key={`${item.title}-${item.time}-${index}`} className="flex min-w-0 gap-4 rounded-lg border border-slate-200 p-4">
                    <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${item.color}`}>{item.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="break-words font-black text-slate-900">{t(item.title)}</h3>
                          <p className="mt-1 text-sm leading-5 text-slate-500">
                            <Edit3 className="mr-1 inline h-3.5 w-3.5" />
                            Nguyễn Minh Tuấn · {item.time}
                          </p>
                        </div>
                        {item.detail ? (
                          <button
                            className="inline-flex shrink-0 items-center gap-1 text-sm font-black text-sky-700"
                            type="button"
                            onClick={() => viewTimelineDetail(item)}
                          >
                            {t('Chi tiết')}
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>

                      {item.hasScores ? (
                        <div className="mt-4 rounded-lg border border-slate-200 p-4">
                          <p className="mb-3 text-sm font-bold text-slate-600">{t('Kết quả đầu vào')}</p>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                            <ScoreBox label="Reading" value="5" />
                            <ScoreBox label="Listening" value="5" />
                            <ScoreBox label="Writing" value="5" />
                            <ScoreBox label="Speaking" value="5" />
                            <ScoreBox label="Overall" value="5.0" />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="grid min-w-0 content-start gap-5">
              <section className="rounded-lg border border-slate-200 bg-white p-5">
                <textarea
                  ref={noteRef}
                  className="h-28 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-sky-500"
                  placeholder={t('Ghi chú thêm')}
                />
                <div className="mt-4 grid gap-3">
                  {notes.map((note) => (
                    <article key={note} className="rounded-lg bg-amber-50 p-4">
                      <p className="text-sm font-semibold leading-6 text-slate-800">{t(note)}</p>
                      <p className="mt-3 text-xs text-slate-500">
                        <Edit3 className="mr-1 inline h-3.5 w-3.5" />
                        Nguyễn Minh Tuấn · 20/04/2026
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-sky-700" />
                  <h3 className="font-black text-slate-950">{t('Đề xuất hành động')}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {t('Lead có nhu cầu học rõ ràng, nên hẹn test trong 24 giờ và đề xuất lớp')} {latestEnrollment?.classRoom?.name ?? t('phù hợp')}.
                </p>
                <div className="mt-4">
                  <StatusBadge value={latestTuition?.status ?? 'UNPAID'} />
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
