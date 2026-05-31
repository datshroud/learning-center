export type Role = 'ADMIN' | 'STAFF' | 'TEACHER' | 'STUDENT';

export type User = {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  username: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  studentProfile?: StudentProfile;
  teacherProfile?: TeacherProfile;
  staffProfile?: StaffProfile;
};

export type StudentProfile = {
  id: string;
  userId: string;
  studentCode: string;
  customerRole?: 'STUDENT' | 'PARENT';
  dateOfBirth?: string;
  address?: string;
  school?: string;
  user: User;
  parents?: Parent[];
  enrollments?: Enrollment[];
  tuitionPayments?: TuitionPayment[];
  scores?: Score[];
  attendanceDetails?: AttendanceDetail[];
};

export type TeacherProfile = {
  id: string;
  userId: string;
  teacherCode: string;
  specialization?: string;
  qualification?: string;
  user: User;
  assignments?: TeachingAssignment[];
};

export type StaffProfile = {
  id: string;
  userId: string;
  staffCode: string;
  position?: string;
};

export type Parent = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  relationship: string;
};

export type Subject = {
  id: string;
  name: string;
  description?: string;
  courses?: Course[];
};

export type Course = {
  id: string;
  subjectId: string;
  name: string;
  grade: number;
  tuitionFee: string | number;
  numberOfSessions: number;
  subject?: Subject;
  classes?: ClassRoom[];
};

export type Room = {
  id: string;
  name: string;
  capacity: number;
  location?: string;
};

export type ClassRoomRoom = {
  classRoomId: string;
  roomId: string;
  assignedAt?: string;
  room?: Room;
  classRoom?: ClassRoom;
};

export type Schedule = {
  id: string;
  classRoomId: string;
  roomId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: Room;
  classRoom?: ClassRoom;
};

export type ClassRoom = {
  id: string;
  courseId: string;
  name: string;
  maxStudents: number;
  currentStudents: number;
  status: 'NOT_OPENED' | 'ENROLLING' | 'ACTIVE' | 'POSTPONED' | 'FINISHED' | 'CANCELLED';
  note?: string;
  course?: Course;
  schedules?: Schedule[];
  enrollments?: Enrollment[];
  teachingAssignments?: TeachingAssignment[];
  studySessions?: StudySession[];
  exams?: Exam[];
  roomAssignments?: ClassRoomRoom[];
};

export type Enrollment = {
  id: string;
  studentId: string;
  classRoomId: string;
  enrollDate: string;
  status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
  student?: StudentProfile;
  classRoom?: ClassRoom;
  tuitionPayment?: TuitionPayment;
};

export type TeachingAssignment = {
  id: string;
  teacherId: string;
  classRoomId: string;
  role?: string;
  teacher?: TeacherProfile;
  classRoom?: ClassRoom;
};

export type StudySession = {
  id: string;
  classRoomId: string;
  sessionDate: string;
  topic?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  classRoom?: ClassRoom;
  attendance?: Attendance;
};

export type Attendance = {
  id: string;
  studySessionId: string;
  teacherUserId?: string;
  attendanceDate?: string;
  createdAt?: string;
  studySession?: StudySession;
  teacher?: User;
  details: AttendanceDetail[];
};

export type AttendanceDetail = {
  id: string;
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  note?: string;
  student?: StudentProfile;
  attendance?: Attendance;
};

export type Exam = {
  id: string;
  classRoomId: string;
  name: string;
  examDate: string;
  maxScore: string | number;
  classRoom?: ClassRoom;
  scores?: Score[];
};

export type Score = {
  id: string;
  examId: string;
  studentId: string;
  value: string | number;
  comment?: string;
  exam?: Exam;
  student?: StudentProfile;
};

export type TuitionPayment = {
  id: string;
  studentId: string;
  enrollmentId?: string;
  amountDue: string | number;
  amountPaid: string | number;
  dueDate: string;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  student?: StudentProfile;
  enrollment?: Enrollment;
  invoices?: Invoice[];
  payments?: Payment[];
};

export type Payment = {
  id: string;
  paymentDate: string;
  amount: string | number;
  method: 'CASH' | 'BANK_TRANSFER' | 'CARD';
  note?: string;
};

export type Invoice = {
  id: string;
  invoiceDate: string;
  totalAmount: string | number;
  payment?: Payment;
  tuitionPayment?: TuitionPayment;
};

export type Notification = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isRead: boolean;
};

export type DashboardReport = {
  students: number;
  teachers: number;
  classes: number;
  activeClasses: number;
  unpaidTuition: number;
  revenue: number;
  recentEnrollments: Enrollment[];
};

export type AnalyticsMetric =
  | 'students'
  | 'teachers'
  | 'classes'
  | 'active-classes'
  | 'unpaid-tuition'
  | 'revenue';

export type AnalyticsPeriod = 'day' | 'month' | 'year';

export type AnalyticsPoint = {
  key: string;
  label: string;
  value: number;
};

export type AnalyticsBreakdown = {
  label: string;
  value: number;
};

export type AnalyticsReport = {
  metric: AnalyticsMetric;
  period: AnalyticsPeriod;
  title: string;
  subtitle: string;
  total: number;
  current: number;
  previous: number;
  changePercent: number;
  series: AnalyticsPoint[];
  breakdown: AnalyticsBreakdown[];
  records: unknown[];
};
