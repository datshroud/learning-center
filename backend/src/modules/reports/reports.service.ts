import { AttendanceStatus, TuitionStatus } from '../../lib/enums.js';
import { prisma } from '../../lib/prisma.js';

type AnalyticsPeriod = 'day' | 'month' | 'year';
type AnalyticsMetric =
  | 'students'
  | 'teachers'
  | 'classes'
  | 'active-classes'
  | 'unpaid-tuition'
  | 'revenue';

type AnalyticsItem = {
  date: Date;
  value: number;
  breakdown?: string;
  record: unknown;
};

const metricTitles: Record<AnalyticsMetric, { title: string; subtitle: string }> = {
  students: {
    title: 'Phân tích học viên',
    subtitle: 'Theo dõi tăng trưởng học viên, nguồn hồ sơ, trường học và danh sách chi tiết.'
  },
  teachers: {
    title: 'Phân tích giáo viên',
    subtitle: 'Theo dõi đội ngũ giáo viên, chuyên môn và lớp được phân công.'
  },
  classes: {
    title: 'Phân tích lớp học',
    subtitle: 'Theo dõi số lớp, trạng thái lớp và khóa học liên quan.'
  },
  'active-classes': {
    title: 'Phân tích lớp đang học',
    subtitle: 'Theo dõi các lớp đang vận hành, buổi học và tiến độ đào tạo.'
  },
  'unpaid-tuition': {
    title: 'Phân tích học phí cần xử lý',
    subtitle: 'Theo dõi công nợ, trạng thái thanh toán và hạn đóng học phí.'
  },
  revenue: {
    title: 'Phân tích doanh thu',
    subtitle: 'Theo dõi doanh thu theo thời gian, phương thức thanh toán và phiếu thu.'
  }
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addPeriod(date: Date, period: AnalyticsPeriod, amount: number) {
  const next = new Date(date);
  if (period === 'day') {
    next.setDate(next.getDate() + amount);
  }
  if (period === 'month') {
    next.setMonth(next.getMonth() + amount);
  }
  if (period === 'year') {
    next.setFullYear(next.getFullYear() + amount);
  }
  return next;
}

function periodKey(date: Date, period: AnalyticsPeriod) {
  if (period === 'day') {
    return date.toISOString().slice(0, 10);
  }
  if (period === 'month') {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
  return String(date.getFullYear());
}

function periodLabel(date: Date, period: AnalyticsPeriod) {
  if (period === 'day') {
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
  if (period === 'month') {
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  }
  return String(date.getFullYear());
}

function buildPeriodBuckets(period: AnalyticsPeriod) {
  const now = startOfDay(new Date());
  if (period === 'day') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, index) => {
      const date = addPeriod(start, 'day', index);
      return {
        key: periodKey(date, period),
        label: periodLabel(date, period),
        value: 0
      };
    });
  }

  const length = period === 'month' ? 12 : 5;
  const start = addPeriod(now, period, -(length - 1));
  return Array.from({ length }, (_, index) => {
    const date = addPeriod(start, period, index);
    return {
      key: periodKey(date, period),
      label: periodLabel(date, period),
      value: 0
    };
  });
}

function aggregateAnalytics(
  metric: AnalyticsMetric,
  period: AnalyticsPeriod,
  items: AnalyticsItem[]
) {
  const buckets = buildPeriodBuckets(period);
  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  const breakdownMap = new Map<string, number>();

  for (const item of items) {
    const key = periodKey(item.date, period);
    const bucket = byKey.get(key);
    if (bucket) {
      bucket.value += item.value;
    }
    const breakdown = item.breakdown ?? 'Khác';
    breakdownMap.set(breakdown, (breakdownMap.get(breakdown) ?? 0) + item.value);
  }

  const current = buckets.at(-1)?.value ?? 0;
  const previous = buckets.at(-2)?.value ?? 0;
  const changePercent = previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 1000) / 10;

  return {
    metric,
    period,
    ...metricTitles[metric],
    total: items.reduce((sum, item) => sum + item.value, 0),
    current,
    previous,
    changePercent,
    series: buckets,
    breakdown: [...breakdownMap.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value),
    records: items.map((item) => item.record)
  };
}

export const reportsService = {
  async dashboard() {
    const [
      students,
      teachers,
      classes,
      activeClasses,
      unpaidTuition,
      invoices,
      recentEnrollments
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.teacherProfile.count(),
      prisma.classRoom.count(),
      prisma.classRoom.count({ where: { status: 'ACTIVE' } }),
      prisma.tuitionPayment.count({ where: { status: { in: [TuitionStatus.UNPAID, TuitionStatus.PARTIAL, TuitionStatus.OVERDUE] } } }),
      prisma.invoice.findMany({ include: { payment: true } }),
      prisma.enrollment.findMany({
        include: {
          student: {
            include: {
              user: true
            }
          },
          classRoom: true
        },
        orderBy: { enrollDate: 'desc' },
        take: 5
      })
    ]);

    const revenue = invoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount), 0);
    return {
      students,
      teachers,
      classes,
      activeClasses,
      unpaidTuition,
      revenue,
      recentEnrollments
    };
  },

  async revenue() {
    const tuitionPayments = await prisma.tuitionPayment.findMany({
      include: {
        student: {
          include: {
            user: true
          }
        },
        enrollment: {
          include: {
            classRoom: {
              include: {
                course: true
              }
            }
          }
        },
        payments: true
      },
      orderBy: { dueDate: 'asc' }
    });
    const totalDue = tuitionPayments.reduce((sum, item) => sum + Number(item.amountDue), 0);
    const totalPaid = tuitionPayments.reduce((sum, item) => sum + Number(item.amountPaid), 0);
    return {
      totalDue,
      totalPaid,
      totalDebt: totalDue - totalPaid,
      items: tuitionPayments
    };
  },

  async attendance() {
    const details = await prisma.attendanceDetail.findMany({
      include: {
        student: {
          include: {
            user: true
          }
        },
        attendance: {
          include: {
            studySession: {
              include: {
                classRoom: true
              }
            }
          }
        }
      }
    });

    return {
      present: details.filter((item) => item.status === AttendanceStatus.PRESENT).length,
      absent: details.filter((item) => item.status === AttendanceStatus.ABSENT).length,
      late: details.filter((item) => item.status === AttendanceStatus.LATE).length,
      details
    };
  },

  async learningResults() {
    const scores = await prisma.score.findMany({
      include: {
        student: {
          include: {
            user: true
          }
        },
        exam: {
          include: {
            classRoom: true
          }
        }
      }
    });
    const average =
      scores.length === 0
        ? 0
        : scores.reduce((sum, item) => sum + Number(item.value), 0) / scores.length;
    return {
      average,
      totalScores: scores.length,
      scores
    };
  },

  async analytics(metric: AnalyticsMetric, period: AnalyticsPeriod) {
    if (metric === 'students') {
      const students = await prisma.studentProfile.findMany({
        include: {
          user: true,
          parents: true,
          enrollments: {
            include: {
              classRoom: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return aggregateAnalytics(
        metric,
        period,
        students.map((student) => ({
          date: student.createdAt,
          value: 1,
          breakdown: student.school ?? 'Chưa có trường',
          record: student
        }))
      );
    }

    if (metric === 'teachers') {
      const teachers = await prisma.teacherProfile.findMany({
        include: {
          user: true,
          assignments: {
            include: {
              classRoom: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return aggregateAnalytics(
        metric,
        period,
        teachers.map((teacher) => ({
          date: teacher.createdAt,
          value: 1,
          breakdown: teacher.specialization ?? 'Chưa có chuyên môn',
          record: teacher
        }))
      );
    }

    if (metric === 'classes') {
      const classes = await prisma.classRoom.findMany({
        include: {
          course: {
            include: {
              subject: true
            }
          },
          enrollments: true,
          schedules: {
            include: {
              room: true
            }
          }
        }
      });
      return aggregateAnalytics(
        metric,
        period,
        classes.map((classRoom) => ({
          date: classRoom.course.startDate ?? new Date(),
          value: 1,
          breakdown: classRoom.status,
          record: classRoom
        }))
      );
    }

    if (metric === 'active-classes') {
      const sessions = await prisma.studySession.findMany({
        include: {
          classRoom: {
            include: {
              course: {
                include: {
                  subject: true
                }
              }
            }
          }
        },
        orderBy: { sessionDate: 'desc' }
      });
      return aggregateAnalytics(
        metric,
        period,
        sessions.map((session) => ({
          date: session.sessionDate,
          value: 1,
          breakdown: session.status,
          record: session
        }))
      );
    }

    if (metric === 'unpaid-tuition') {
      const payments = await prisma.tuitionPayment.findMany({
        where: {
          status: {
            in: [TuitionStatus.UNPAID, TuitionStatus.PARTIAL, TuitionStatus.OVERDUE]
          }
        },
        include: {
          student: {
            include: {
              user: true
            }
          },
          enrollment: {
            include: {
              classRoom: true
            }
          }
        },
        orderBy: { dueDate: 'asc' }
      });
      return aggregateAnalytics(
        metric,
        period,
        payments.map((payment) => ({
          date: payment.dueDate,
          value: Number(payment.amountDue) - Number(payment.amountPaid),
          breakdown: payment.status,
          record: payment
        }))
      );
    }

    const invoices = await prisma.invoice.findMany({
      include: {
        payment: true,
        tuitionPayment: {
          include: {
            student: {
              include: {
                user: true
              }
            },
            enrollment: {
              include: {
                classRoom: true
              }
            }
          }
        }
      },
      orderBy: { invoiceDate: 'desc' }
    });
    return aggregateAnalytics(
      'revenue',
      period,
      invoices.map((invoice) => ({
        date: invoice.invoiceDate,
        value: Number(invoice.totalAmount),
        breakdown: invoice.payment.method,
        record: invoice
      }))
    );
  }
};
