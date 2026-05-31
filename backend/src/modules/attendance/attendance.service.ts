import { AppError } from '../../lib/errors.js';
import { AttendanceStatus, EnrollmentStatus, Role } from '../../lib/enums.js';
import { prisma } from '../../lib/prisma.js';
import type { AuthUser } from '../../middleware/auth.js';
import type { SaveAttendanceInput } from './attendance.schema.js';

const includeAttendance = {
  studySession: {
    include: {
      classRoom: true
    }
  },
  teacher: true,
  details: {
    include: {
      student: {
        include: {
          user: true
        }
      }
    }
  }
};

export const attendanceService = {
  async getBySession(user: AuthUser, studySessionId: string) {
    const attendance = await prisma.attendance.findUnique({
      where: { studySessionId },
      include: {
        ...includeAttendance,
        studySession: {
          include: {
            classRoom: {
              include: {
                teachingAssignments: {
                  include: {
                    teacher: true
                  }
                }
              }
            }
          }
        }
      }
    });
    if (!attendance) {
      return null;
    }
    if (
      user.role === Role.TEACHER &&
      !attendance.studySession.classRoom.teachingAssignments.some((item) => item.teacher.userId === user.id)
    ) {
      throw new AppError(403, 'Bạn không được phân công lớp này.');
    }
    return attendance;
  },

  async save(user: AuthUser, input: SaveAttendanceInput) {
    const session = await prisma.studySession.findUnique({
      where: { id: input.studySessionId },
      include: {
        classRoom: {
          include: {
            enrollments: {
              where: { status: EnrollmentStatus.ACTIVE },
              include: {
                student: {
                  include: {
                    user: true
                  }
                }
              }
            },
            teachingAssignments: {
              include: {
                teacher: true
              }
            }
          }
        }
      }
    });

    if (!session) {
      throw new AppError(404, 'Không tìm thấy buổi học.');
    }

    if (
      user.role === Role.TEACHER &&
      !session.classRoom.teachingAssignments.some((item) => item.teacher.userId === user.id)
    ) {
      throw new AppError(403, 'Bạn không được phân công lớp này.');
    }

    const activeStudentIds = session.classRoom.enrollments.map((item) => item.studentId);
    const submittedIds = new Set(input.details.map((item) => item.studentId));
    const missing = activeStudentIds.filter((id) => !submittedIds.has(id));
    if (missing.length > 0) {
      throw new AppError(400, 'Phiếu điểm danh phải có đầy đủ học viên đang học trong lớp.');
    }

    return prisma.$transaction(async (tx) => {
      const attendance = await tx.attendance.upsert({
        where: { studySessionId: input.studySessionId },
        create: {
          studySessionId: input.studySessionId,
          teacherUserId: user.id
        },
        update: {
          teacherUserId: user.id,
          attendanceDate: new Date()
        }
      });

      await tx.attendanceDetail.deleteMany({
        where: { attendanceId: attendance.id }
      });

      await tx.attendanceDetail.createMany({
        data: input.details.map((detail) => ({
          attendanceId: attendance.id,
          studentId: detail.studentId,
          status: detail.status as AttendanceStatus,
          note: detail.note
        }))
      });

      return tx.attendance.findUniqueOrThrow({
        where: { id: attendance.id },
        include: includeAttendance
      });
    });
  }
};
