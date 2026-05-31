import { AppError } from '../../lib/errors.js';
import { isTimeOverlap, parseDate } from '../../lib/date.js';
import { Role, type SessionStatus } from '../../lib/enums.js';
import { prisma } from '../../lib/prisma.js';
import type { AuthUser } from '../../middleware/auth.js';
import type {
  CreateRoomInput,
  CreateScheduleInput,
  CreateStudySessionInput
} from './schedules.schema.js';

const scheduleInclude = {
  room: true,
  classRoom: {
    include: {
      course: {
        include: {
          subject: true
        }
      },
      teachingAssignments: {
        include: {
          teacher: {
            include: {
              user: true
            }
          }
        }
      }
    }
  }
};

async function ensureScheduleAvailable(input: CreateScheduleInput, excludeScheduleId?: string) {
  if (input.startTime >= input.endTime) {
    throw new AppError(400, 'Giờ bắt đầu phải nhỏ hơn giờ kết thúc.');
  }

  const roomSchedules = await prisma.schedule.findMany({
    where: {
      roomId: input.roomId,
      dayOfWeek: input.dayOfWeek,
      id: excludeScheduleId ? { not: excludeScheduleId } : undefined
    }
  });
  if (
    roomSchedules.some((item) =>
      isTimeOverlap(input.startTime, input.endTime, item.startTime, item.endTime)
    )
  ) {
    throw new AppError(409, 'Phòng học đã có lịch trong khung giờ này.');
  }

  const teacherIds = (
    await prisma.teachingAssignment.findMany({
      where: { classRoomId: input.classRoomId },
      select: { teacherId: true }
    })
  ).map((item) => item.teacherId);

  if (teacherIds.length > 0) {
    const teacherSchedules = await prisma.schedule.findMany({
      where: {
        dayOfWeek: input.dayOfWeek,
        id: excludeScheduleId ? { not: excludeScheduleId } : undefined,
        classRoom: {
          teachingAssignments: {
            some: {
              teacherId: {
                in: teacherIds
              }
            }
          }
        }
      },
      include: {
        classRoom: true
      }
    });
    if (
      teacherSchedules.some((item) =>
        isTimeOverlap(input.startTime, input.endTime, item.startTime, item.endTime)
      )
    ) {
      throw new AppError(409, 'Giáo viên đã có lịch dạy trong khung giờ này.');
    }
  }
}

export const schedulesService = {
  async listRooms() {
    return prisma.room.findMany({
      orderBy: { name: 'asc' }
    });
  },

  async createRoom(input: CreateRoomInput) {
    return prisma.room.create({ data: input });
  },

  async listSchedules(user: AuthUser, classRoomId?: string) {
    return prisma.schedule.findMany({
      where: {
        classRoomId,
        classRoom:
          user.role === Role.TEACHER
            ? {
                teachingAssignments: {
                  some: {
                    teacher: {
                      userId: user.id
                    }
                  }
                }
              }
            : user.role === Role.STUDENT
              ? {
                  enrollments: {
                    some: {
                      student: {
                        userId: user.id
                      }
                    }
                  }
                }
              : undefined
      },
      include: scheduleInclude,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
    });
  },

  async createSchedule(input: CreateScheduleInput) {
    await ensureScheduleAvailable(input);
    return prisma.schedule.create({
      data: input,
      include: scheduleInclude
    });
  },

  async updateSchedule(id: string, input: Partial<CreateScheduleInput>) {
    const current = await prisma.schedule.findUnique({ where: { id } });
    if (!current) {
      throw new AppError(404, 'Không tìm thấy lịch học.');
    }
    const merged = { ...current, ...input };
    await ensureScheduleAvailable(
      {
        classRoomId: merged.classRoomId,
        roomId: merged.roomId,
        dayOfWeek: merged.dayOfWeek,
        startTime: merged.startTime,
        endTime: merged.endTime
      },
      id
    );
    return prisma.schedule.update({
      where: { id },
      data: input,
      include: scheduleInclude
    });
  },

  async listStudySessions(user: AuthUser, classRoomId?: string) {
    return prisma.studySession.findMany({
      where: {
        classRoomId,
        classRoom:
          user.role === Role.TEACHER
            ? {
                teachingAssignments: {
                  some: {
                    teacher: {
                      userId: user.id
                    }
                  }
                }
              }
            : undefined
      },
      include: {
        classRoom: true,
        attendance: {
          include: {
            details: true
          }
        }
      },
      orderBy: { sessionDate: 'desc' }
    });
  },

  async createStudySession(input: CreateStudySessionInput) {
    return prisma.studySession.create({
      data: {
        classRoomId: input.classRoomId,
        sessionDate: parseDate(input.sessionDate)!,
        topic: input.topic,
        status: input.status as SessionStatus
      },
      include: {
        classRoom: true
      }
    });
  }
};
