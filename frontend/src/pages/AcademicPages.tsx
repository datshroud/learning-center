import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { BookOpen, CheckCircle2, Clock, FileText, PlayCircle, Receipt, Sparkles, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  Notification,
  Score,
  StudentProfile,
  StudySession,
  TuitionPayment
} from '../types/domain';

const valueOf = (form: HTMLFormElement, name: string) =>
  String(new FormData(form).get(name) ?? '').trim();

function SubmitButton({ children = 'Lưu' }: { children?: string }) {
  const { t } = usePreferences();
  return <button className="h-10 rounded-md bg-sky-700 px-4 text-sm font-semibold text-white">{t(children)}</button>;
}

const exerciseTopics = [
  'Ôn tập nền tảng',
  'Bài tập vận dụng',
  'Bài kiểm tra nhanh',
  'Đề luyện cuối khóa',
  'Từ vựng và công thức',
  'Bài tập tự chọn'
];

function progressForClass(classRoom: ClassRoom) {
  const total = classRoom.course?.numberOfSessions ?? Math.max(classRoom.studySessions?.length ?? 0, 1);
  const completed = classRoom.studySessions?.filter((session) => session.status === 'COMPLETED').length ?? 0;
  return Math.min(100, Math.round((completed / Math.max(total, 1)) * 100));
}

export function MyCoursesPage() {
  const { t } = usePreferences();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassRoom[] | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [tuition, setTuition] = useState<TuitionPayment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<ClassRoom[]>('/classes'),
      api.get<Score[]>('/scores'),
      api.get<TuitionPayment[]>('/tuition'),
      api.get<Notification[]>('/notifications')
    ]).then(([classResponse, scoreResponse, tuitionResponse, notificationResponse]) => {
      setClasses(classResponse.data);
      setScores(scoreResponse.data);
      setTuition(tuitionResponse.data);
      setNotifications(notificationResponse.data);
    });
  }, []);

  const nextSchedules = useMemo(
    () =>
      classes?.flatMap((classRoom) =>
        (classRoom.schedules ?? []).map((schedule) => ({
          ...schedule,
          classRoom
        }))
      ) ?? [],
    [classes]
  );

  const averageScore =
    scores.length === 0
      ? 0
      : scores.reduce((sum, score) => sum + Number(score.value), 0) / scores.length;

  if (!classes) {
    return <LoadingState />;
  }

  return (
    <>
      <PageHeader
        title="Khóa học của tôi"
        description="Không gian học tập của học viên: khóa đang học, bài tập tự chọn, lịch học, điểm số và học phí."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <SectionCard>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">{t('Khóa đang học')}</p>
            <BookOpen className="h-5 w-5 text-sky-700" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-950">{classes.length}</p>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">{t('Điểm trung bình')}</p>
            <Star className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-950">{averageScore.toFixed(2)}</p>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">{t('Học phí cần xử lý')}</p>
            <Receipt className="h-5 w-5 text-rose-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-950">{tuition.filter((item) => item.status !== 'PAID').length}</p>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">{t('Thông báo mới')}</p>
            <Sparkles className="h-5 w-5 text-violet-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-950">{notifications.filter((item) => !item.isRead).length}</p>
        </SectionCard>
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {classes.map((classRoom) => {
          const progress = progressForClass(classRoom);
          const classTuition = tuition.find((item) => item.enrollment?.classRoomId === classRoom.id);
          const classScores = scores.filter((score) => score.exam?.classRoomId === classRoom.id);
          return (
            <article key={classRoom.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="rounded-md bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700">
                    {classRoom.course?.subject?.name ?? t('Khóa học')}
                  </span>
                  <h2 className="mt-3 line-clamp-2 text-lg font-bold text-slate-950">{classRoom.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{classRoom.course?.name ?? t('Chưa có khóa học')}</p>
                </div>
                <StatusBadge value={classRoom.status} />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">{t('Tiến độ')}</p>
                  <p className="mt-1 font-bold text-slate-950">{progress}%</p>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">{t('Điểm')}</p>
                  <p className="mt-1 font-bold text-slate-950">{classScores.length}</p>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">{t('Học phí')}</p>
                  <p className="mt-1 font-bold text-slate-950">{classTuition?.status === 'PAID' ? t('Xong') : t('Còn')}</p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-sky-700" style={{ width: `${progress}%` }} />
              </div>

              <div className="mt-4 grid gap-2 text-sm text-slate-600">
                {(classRoom.schedules ?? []).slice(0, 2).map((schedule) => (
                  <div key={schedule.id} className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>
                      {t(dayLabel(schedule.dayOfWeek))} {schedule.startTime} - {schedule.endTime}, {schedule.room?.name ?? t('Chưa có phòng')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  className="inline-flex items-center gap-2 rounded-md bg-sky-700 px-3 py-2 text-sm font-semibold text-white"
                  type="button"
                  onClick={() => navigate('/my-schedule')}
                >
                  <PlayCircle className="h-4 w-4" />
                  {t('Vào học')}
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                  type="button"
                  onClick={() => document.getElementById('practice-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <FileText className="h-4 w-4" />
                  {t('Tài liệu')}
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <div id="practice-section">
      <SectionCard title="Bài tập tự chọn" className="mt-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {exerciseTopics.map((topic, index) => {
            const classRoom = classes[index % Math.max(classes.length, 1)];
            const done = index % 3 !== 1;
            return (
              <article key={topic} className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-white">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-violet-500/25 px-2 py-1 text-xs font-semibold text-violet-100">
                    Practice
                  </span>
                  {done ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-100">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t('Đã chấm')}
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-500/20 px-2 py-1 text-xs font-semibold text-amber-100">
                      {t('Đang làm')}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 min-h-12 text-base font-bold">{classRoom?.course?.name ?? t('Khóa học')} | {t(topic)}</h3>
                <div className="mt-4 border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>{t('Độ khó')} {index + 1}/6</span>
                    <span>{done ? t('Hoàn tất') : t('Cần nộp')}</span>
                  </div>
                  <button
                    className="mt-4 rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white"
                    type="button"
                    onClick={() => navigate('/my-scores')}
                  >
                    {t('Xem bài làm')}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </SectionCard>
      </div>

      <div className="mt-6">
        <CalendarBoard schedules={nextSchedules} title="Lịch học tuần của tôi" />
      </div>
    </>
  );
}

export function MyClassesPage() {
  const { t } = usePreferences();
  const [classes, setClasses] = useState<ClassRoom[] | null>(null);
  useEffect(() => {
    api.get<ClassRoom[]>('/classes').then((response) => setClasses(response.data));
  }, []);
  if (!classes) {
    return <LoadingState />;
  }
  return (
    <>
      <PageHeader title="Lớp được phân công" description="Danh sách lớp, sĩ số và lịch học của giáo viên." />
      <DataTable
        data={classes}
        columns={[
          { key: 'name', header: 'Lớp', render: (row) => row.name },
          { key: 'course', header: 'Khóa', render: (row) => row.course?.name ?? '-' },
          { key: 'size', header: 'Sĩ số', render: (row) => `${row.currentStudents}/${row.maxStudents}` },
          { key: 'schedule', header: 'Lịch', render: (row) => row.schedules?.map((item) => `${t(dayLabel(item.dayOfWeek))} ${item.startTime}`).join(', ') || '-' },
          { key: 'status', header: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> }
        ]}
      />
    </>
  );
}

export function AttendancePage() {
  const { t } = usePreferences();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [details, setDetails] = useState<Record<string, AttendanceDetail['status']>>({});
  const [error, setError] = useState('');
  const selectedClass = classes.find((item) => item.id === selectedClassId);
  const students = selectedClass?.enrollments?.map((item) => item.student).filter(Boolean) as StudentProfile[] | undefined;

  useEffect(() => {
    api.get<ClassRoom[]>('/classes').then((response) => setClasses(response.data));
  }, []);

  useEffect(() => {
    if (!selectedClassId) {
      setSessions([]);
      return;
    }
    api.get<StudySession[]>(`/study-sessions?classRoomId=${selectedClassId}`).then((response) => {
      setSessions(response.data);
      setSelectedSessionId(response.data[0]?.id ?? '');
    });
  }, [selectedClassId]);

  useEffect(() => {
    const next: Record<string, AttendanceDetail['status']> = {};
    students?.forEach((student) => {
      next[student.id] = 'PRESENT';
    });
    setDetails(next);
  }, [students?.length]);

  async function saveAttendance() {
    setError('');
    try {
      await api.post('/attendance', {
        studySessionId: selectedSessionId,
        details: Object.entries(details).map(([studentId, status]) => ({
          studentId,
          status
        }))
      });
      setError('Lưu điểm danh thành công.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader title="Điểm danh học viên" description="Chọn lớp, buổi học và đánh dấu trạng thái từng học viên." />
      <ErrorAlert message={error} />
      <SectionCard title="Thông tin buổi học">
        <div className="grid gap-4 md:grid-cols-3">
          <SelectField label="Lớp học" value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)}>
            <option value="">Chọn lớp</option>
            {classes.map((classRoom) => (
              <option key={classRoom.id} value={classRoom.id}>
                {classRoom.name}
              </option>
            ))}
          </SelectField>
          <SelectField label="Buổi học" value={selectedSessionId} onChange={(event) => setSelectedSessionId(event.target.value)}>
            <option value="">Chọn buổi</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {formatDate(session.sessionDate)} - {session.topic ?? 'Buổi học'}
              </option>
            ))}
          </SelectField>
          <div className="self-end">
            <SubmitButton>Chọn</SubmitButton>
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Danh sách học viên" className="mt-6">
        <div className="grid gap-3">
          {students?.map((student) => (
            <div key={student.id} className="grid gap-3 rounded-md border border-slate-200 p-3 md:grid-cols-[1fr_220px]">
              <div>
                <p className="font-semibold text-slate-900">{student.user.fullName}</p>
                <p className="text-sm text-slate-500">{student.studentCode}</p>
              </div>
              <SelectField
                label="Trạng thái"
                value={details[student.id] ?? 'PRESENT'}
                onChange={(event) =>
                  setDetails((current) => ({
                    ...current,
                    [student.id]: event.target.value as AttendanceDetail['status']
                  }))
                }
              >
                <option value="PRESENT">Có mặt</option>
                <option value="ABSENT">Vắng</option>
                <option value="LATE">Đi muộn</option>
              </SelectField>
            </div>
          )) ?? <p className="text-sm text-slate-500">{t('Chọn lớp để hiển thị học viên.')}</p>}
        </div>
        <button
          className="mt-4 rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          disabled={!selectedSessionId || !students?.length}
          onClick={saveAttendance}
        >
          {t('Lưu điểm danh')}
        </button>
      </SectionCard>
    </>
  );
}

export function ScoresPage() {
  const { t } = usePreferences();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [exams, setExams] = useState<Score[]>([]);
  const [examList, setExamList] = useState<{ id: string; name: string; maxScore: number | string }[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [editingScoreId, setEditingScoreId] = useState('');
  const [scoreDraft, setScoreDraft] = useState({ value: '', comment: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<ClassRoom[]>('/classes').then((response) => setClasses(response.data));
    api.get<Score[]>('/scores').then((response) => setExams(response.data));
  }, []);

  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      setExamList([]);
      return;
    }
    Promise.all([
      api.get<StudentProfile[]>(`/students?classRoomId=${selectedClassId}`),
      api.get<{ id: string; name: string; maxScore: number | string }[]>(`/exams?classRoomId=${selectedClassId}`)
    ]).then(([studentResponse, examResponse]) => {
      setStudents(studentResponse.data);
      setExamList(examResponse.data);
    });
  }, [selectedClassId]);

  async function createExam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      await api.post('/exams', {
        classRoomId: selectedClassId,
        name: valueOf(form, 'name'),
        examDate: valueOf(form, 'examDate'),
        maxScore: Number(valueOf(form, 'maxScore'))
      });
      form.reset();
      const response = await api.get<{ id: string; name: string; maxScore: number | string }[]>(`/exams?classRoomId=${selectedClassId}`);
      setExamList(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function createScore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      await api.post('/scores', {
        examId: valueOf(form, 'examId'),
        studentId: valueOf(form, 'studentId'),
        value: Number(valueOf(form, 'value')),
        comment: valueOf(form, 'comment') || undefined
      });
      form.reset();
      const response = await api.get<Score[]>('/scores');
      setExams(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function updateScore(id: string) {
    try {
      await api.patch(`/scores/${id}`, {
        value: Number(scoreDraft.value),
        comment: scoreDraft.comment || undefined
      });
      setEditingScoreId('');
      setScoreDraft({ value: '', comment: '' });
      const response = await api.get<Score[]>('/scores');
      setExams(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader title="Nhập điểm kiểm tra" description="Tạo bài kiểm tra, nhập điểm và nhận xét học viên." />
      <ErrorAlert message={error} />
      <SectionCard title="Chọn lớp">
        <SelectField label="Lớp học" value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)}>
          <option value="">Chọn lớp</option>
          {classes.map((classRoom) => (
            <option key={classRoom.id} value={classRoom.id}>
              {classRoom.name}
            </option>
          ))}
        </SelectField>
      </SectionCard>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <SectionCard title="Tạo bài kiểm tra">
          <form className="grid gap-4" onSubmit={createExam}>
            <FormField label="Tên bài kiểm tra" name="name" required />
            <FormField label="Ngày kiểm tra" name="examDate" type="date" required />
            <FormField label="Điểm tối đa" name="maxScore" type="number" defaultValue={10} required />
            <SubmitButton>Tạo bài kiểm tra</SubmitButton>
          </form>
        </SectionCard>
        <SectionCard title="Nhập điểm">
          <form className="grid gap-4" onSubmit={createScore}>
            <SelectField label="Bài kiểm tra" name="examId" required>
              <option value="">Chọn bài</option>
              {examList.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name}
                </option>
              ))}
            </SelectField>
            <SelectField label="Học viên" name="studentId" required>
              <option value="">Chọn học viên</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.user.fullName}
                </option>
              ))}
            </SelectField>
            <FormField label="Điểm" name="value" type="number" step="0.25" required />
            <FormField label="Nhận xét" name="comment" />
            <SubmitButton>Lưu điểm</SubmitButton>
          </form>
        </SectionCard>
      </div>
      <div className="mt-6">
        <DataTable
          data={exams}
          columns={[
            { key: 'exam', header: 'Bài kiểm tra', render: (row) => row.exam?.name ?? '-' },
            { key: 'student', header: 'Học viên', render: (row) => row.student?.user.fullName ?? '-' },
            {
              key: 'value',
              header: 'Điểm',
              render: (row) =>
                editingScoreId === row.id ? (
                  <input
                    className="h-9 w-24 rounded-md border border-slate-300 px-2 text-sm"
                    type="number"
                    step="0.25"
                    value={scoreDraft.value}
                    onChange={(event) => setScoreDraft((current) => ({ ...current, value: event.target.value }))}
                  />
                ) : (
                  row.value
                )
            },
            {
              key: 'comment',
              header: 'Nhận xét',
              render: (row) =>
                editingScoreId === row.id ? (
                  <input
                    className="h-9 min-w-48 rounded-md border border-slate-300 px-2 text-sm"
                    value={scoreDraft.comment}
                    onChange={(event) => setScoreDraft((current) => ({ ...current, comment: event.target.value }))}
                  />
                ) : (
                  row.comment ?? '-'
                )
            },
            {
              key: 'actions',
              header: 'Thao tác',
              render: (row) =>
                editingScoreId === row.id ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="rounded-md bg-sky-700 px-3 py-1.5 text-xs font-semibold text-white disabled:bg-slate-300"
                      type="button"
                      disabled={scoreDraft.value.trim() === ''}
                      onClick={() => updateScore(row.id)}
                    >
                      {t('Lưu')}
                    </button>
                    <button
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                      type="button"
                      onClick={() => {
                        setEditingScoreId('');
                        setScoreDraft({ value: '', comment: '' });
                      }}
                    >
                      {t('Hủy')}
                    </button>
                  </div>
                ) : (
                  <button
                    className="rounded-md border border-sky-300 px-3 py-1.5 text-xs font-semibold text-sky-700"
                    type="button"
                    onClick={() => {
                      setEditingScoreId(row.id);
                      setScoreDraft({ value: String(row.value), comment: row.comment ?? '' });
                    }}
                  >
                    {t('Sửa điểm')}
                  </button>
                )
            }
          ]}
        />
      </div>
    </>
  );
}

export function MySchedulePage() {
  const { t } = usePreferences();
  const [classes, setClasses] = useState<ClassRoom[] | null>(null);
  useEffect(() => {
    api.get<ClassRoom[]>('/classes').then((response) => setClasses(response.data));
  }, []);
  const schedules = useMemo(
    () =>
      classes?.flatMap((classRoom) =>
        (classRoom.schedules ?? []).map((schedule) => ({
          ...schedule,
          classRoom
        }))
      ) ?? [],
    [classes]
  );
  if (!classes) {
    return <LoadingState />;
  }
  return (
    <>
      <PageHeader title="Lịch học của tôi" description="Lịch học được trình bày theo dạng tuần để dễ quan sát ca học và phòng học." />
      <CalendarBoard schedules={schedules} title="Lịch học tuần" />
      <SectionCard title="Danh sách lịch học" className="mt-6">
        <DataTable
          data={schedules}
          columns={[
            { key: 'class', header: 'Lớp', render: (row) => row.classRoom.name },
            { key: 'day', header: 'Thứ', render: (row) => t(dayLabel(row.dayOfWeek)) },
            { key: 'time', header: 'Giờ', render: (row) => `${row.startTime} - ${row.endTime}` },
            { key: 'room', header: 'Phòng', render: (row) => row.room?.name ?? '-' }
          ]}
        />
      </SectionCard>
    </>
  );
}

export function MyScoresPage() {
  const [scores, setScores] = useState<Score[] | null>(null);
  useEffect(() => {
    api.get<Score[]>('/scores').then((response) => setScores(response.data));
  }, []);
  if (!scores) {
    return <LoadingState />;
  }
  return (
    <>
      <PageHeader title="Điểm của tôi" />
      <DataTable
        data={scores}
        columns={[
          { key: 'exam', header: 'Bài kiểm tra', render: (row) => row.exam?.name ?? '-' },
          { key: 'class', header: 'Lớp', render: (row) => row.exam?.classRoom?.name ?? '-' },
          { key: 'value', header: 'Điểm', render: (row) => `${row.value}/${row.exam?.maxScore ?? 10}` },
          { key: 'comment', header: 'Nhận xét', render: (row) => row.comment ?? '-' }
        ]}
      />
    </>
  );
}

export function MyTuitionPage() {
  const { t } = usePreferences();
  const navigate = useNavigate();
  const [tuition, setTuition] = useState<TuitionPayment[] | null>(null);
  useEffect(() => {
    api.get<TuitionPayment[]>('/tuition').then((response) => setTuition(response.data));
  }, []);
  if (!tuition) {
    return <LoadingState />;
  }
  return (
    <>
      <PageHeader title="Tình trạng học phí" />
      <DataTable
        data={tuition}
        columns={[
          { key: 'class', header: 'Lớp', render: (row) => row.enrollment?.classRoom?.name ?? '-' },
          { key: 'due', header: 'Phải đóng', render: (row) => formatMoney(row.amountDue) },
          { key: 'paid', header: 'Đã đóng', render: (row) => formatMoney(row.amountPaid) },
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
    </>
  );
}

export function NotificationsPage() {
  const { t } = usePreferences();
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Notification[]>('/notifications').then((response) => setNotifications(response.data));
  }, []);

  async function markRead(id: string) {
    setError('');
    try {
      const response = await api.patch<Notification>(`/notifications/${id}/read`);
      setNotifications((current) =>
        current?.map((notification) => (notification.id === id ? response.data : notification)) ?? current
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function markAllRead() {
    setError('');
    try {
      const response = await api.patch<Notification[]>('/notifications/read-all');
      setNotifications(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (!notifications) {
    return <LoadingState />;
  }

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <>
      <PageHeader
        title="Thông báo"
        description={`${unreadCount} ${t('thông báo chưa đọc')}`}
        action={
          <button
            className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300"
            type="button"
            disabled={unreadCount === 0}
            onClick={markAllRead}
          >
            {t('Đánh dấu tất cả đã đọc')}
          </button>
        }
      />
      <ErrorAlert message={error} />
      <div className="grid gap-3">
        {notifications.length === 0 ? (
          <SectionCard>
            <p className="text-sm text-slate-500">{t('Chưa có thông báo.')}</p>
          </SectionCard>
        ) : null}
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`rounded-lg border p-4 ${
              notification.isRead ? 'border-slate-200 bg-white' : 'border-sky-200 bg-sky-50'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-semibold text-slate-950">{notification.title}</h2>
                <span className="text-xs text-slate-500">{formatDate(notification.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  notification.isRead ? 'bg-slate-100 text-slate-600' : 'bg-sky-700 text-white'
                }`}>
                  {notification.isRead ? t('Đã đọc') : t('Mới')}
                </span>
                {!notification.isRead ? (
                  <button
                    className="rounded-md border border-sky-300 bg-white px-3 py-1.5 text-xs font-semibold text-sky-700"
                    type="button"
                    onClick={() => markRead(notification.id)}
                  >
                    {t('Đánh dấu đã đọc')}
                  </button>
                ) : null}
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600">{notification.content}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  const { t } = usePreferences();
  return (
    <>
      <PageHeader title="Hồ sơ cá nhân" />
      <SectionCard>
        <dl className="grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">{t('Họ tên')}</dt>
            <dd className="font-semibold text-slate-950">{user?.fullName ? t(user.fullName) : ''}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">{t('Tài khoản')}</dt>
            <dd className="font-semibold text-slate-950">{user?.username}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">{t('Vai trò')}</dt>
            <dd>
              <StatusBadge value={user?.role} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">{t('Liên hệ')}</dt>
            <dd className="font-semibold text-slate-950">{user?.phone ?? user?.email ?? '-'}</dd>
          </div>
        </dl>
      </SectionCard>
    </>
  );
}
