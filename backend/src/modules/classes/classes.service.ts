import { type Prisma } from '@prisma/client';
import { AppError } from '../../lib/errors.js';
import { ClassStatus, Role, type ClassStatus as ClassStatusValue } from '../../lib/enums.js';
import { prisma } from '../../lib/prisma.js';
import type { AuthUser } from '../../middleware/auth.js';
import type { CreateClassInput, CreateTeachingAssignmentInput, UpdateClassInput } from './classes.schema.js';

const includeClass = {
  course: {
    include: {
      subject: true
    }
  },
  schedules: {
    include: {
      room: true
    }
  },
  roomAssignments: {
    include: {
      room: true
    }
  },
  teachingAssignments: {
    include: {
      teacher: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true
            }
          }
        }
      }
    }
  },
  enrollments: {
    include: {
      student: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true
            }
          }
        }
      },
      tuitionPayment: true
    }
  },
  studySessions: true,
  exams: true
} satisfies Prisma.ClassRoomInclude;

function uniqueIds(ids: string[] = []) {
  return [...new Set(ids.filter(Boolean))];
}

async function ensureRoomsExist(roomIds: string[]) {
  if (roomIds.length === 0) {
    return;
  }
  const count = await prisma.room.count({
    where: {
      id: {
        in: roomIds
      }
    }
  });
  if (count !== roomIds.length) {
    throw new AppError(404, 'Không tìm thấy phòng học.');
  }
}

export const classesService = {
  async list(user: AuthUser, search?: string) {
    const where: Prisma.ClassRoomWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { course: { name: { contains: search } } },
        { course: { subject: { name: { contains: search } } } }
      ];
    }

    if (user.role === Role.TEACHER) {
      where.teachingAssignments = {
        some: {
          teacher: {
            userId: user.id
          }
        }
      };
    }

    if (user.role === Role.STUDENT) {
      where.enrollments = {
        some: {
          student: {
            userId: user.id
          }
        }
      };
    }

    return prisma.classRoom.findMany({
      where,
      include: includeClass,
      orderBy: { name: 'asc' }
    });
  },

  async get(id: string, user: AuthUser) {
    const classRoom = await prisma.classRoom.findUnique({
      where: { id },
      include: includeClass
    });
    if (!classRoom) {
      throw new AppError(404, 'Không tìm thấy lớp học.');
    }
    if (
      user.role === Role.TEACHER &&
      !classRoom.teachingAssignments.some((item) => item.teacher.user.id === user.id)
    ) {
      throw new AppError(403, 'Bạn không được phân công lớp này.');
    }
    if (
      user.role === Role.STUDENT &&
      !classRoom.enrollments.some((item) => item.student.user.id === user.id)
    ) {
      throw new AppError(403, 'Bạn không thuộc lớp này.');
    }
    return classRoom;
  },

  async create(input: CreateClassInput) {
    const roomIds = uniqueIds(input.roomIds);
    await ensureRoomsExist(roomIds);

    return prisma.classRoom.create({
      data: {
        courseId: input.courseId,
        name: input.name,
        maxStudents: input.maxStudents,
        status: input.status as ClassStatusValue,
        note: input.note,
        roomAssignments:
          roomIds.length > 0
            ? {
                create: roomIds.map((roomId) => ({
                  room: {
                    connect: {
                      id: roomId
                    }
                  }
                }))
              }
            : undefined
      },
      include: includeClass
    });
  },

  async updateStatus(id: string, status: ClassStatusValue) {
    return prisma.classRoom.update({
      where: { id },
      data: { status },
      include: includeClass
    });
  },

  async update(id: string, input: UpdateClassInput) {
    const classRoom = await prisma.classRoom.findUnique({
      where: { id }
    });
    if (!classRoom) {
      throw new AppError(404, 'Không tìm thấy lớp học.');
    }

    if (input.maxStudents !== undefined && input.maxStudents < classRoom.currentStudents) {
      throw new AppError(400, 'Sĩ số tối đa không được nhỏ hơn sĩ số hiện tại.');
    }

    const roomIds = input.roomIds === undefined ? undefined : uniqueIds(input.roomIds);
    if (roomIds !== undefined) {
      await ensureRoomsExist(roomIds);
    }

    return prisma.classRoom.update({
      where: { id },
      data: {
        courseId: input.courseId,
        name: input.name,
        maxStudents: input.maxStudents,
        status: input.status as ClassStatusValue | undefined,
        note: input.note,
        roomAssignments:
          roomIds !== undefined
            ? {
                deleteMany: {},
                create: roomIds.map((roomId) => ({
                  room: {
                    connect: {
                      id: roomId
                    }
                  }
                }))
              }
            : undefined
      },
      include: includeClass
    });
  },

  async createAssignment(input: CreateTeachingAssignmentInput) {
    const [teacher, classRoom] = await Promise.all([
      prisma.teacherProfile.findUnique({ where: { id: input.teacherId } }),
      prisma.classRoom.findUnique({ where: { id: input.classRoomId } })
    ]);
    if (!teacher) {
      throw new AppError(404, 'Không tìm thấy giáo viên.');
    }
    if (!classRoom) {
      throw new AppError(404, 'Không tìm thấy lớp học.');
    }
    return prisma.teachingAssignment.create({
      data: input,
      include: {
        teacher: {
          include: {
            user: true
          }
        },
        classRoom: true
      }
    });
  }
};
