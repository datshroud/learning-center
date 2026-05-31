import bcrypt from 'bcryptjs';
import { type Prisma } from '@prisma/client';
import { AppError } from '../../lib/errors.js';
import { parseDate } from '../../lib/date.js';
import { Role } from '../../lib/enums.js';
import { prisma } from '../../lib/prisma.js';
import type { AuthUser } from '../../middleware/auth.js';
import type { CreateStudentInput, UpdateStudentInput } from './students.schema.js';

const includeStudent = {
  user: {
    select: {
      id: true,
      fullName: true,
      phone: true,
      email: true,
      username: true,
      role: true,
      status: true
    }
  },
  parents: true,
  enrollments: {
    include: {
      classRoom: {
        include: {
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
          teachingAssignments: {
            include: {
              teacher: {
                include: {
                  user: {
                    select: {
                      id: true,
                      fullName: true
                    }
                  }
                }
              }
            }
          },
          studySessions: {
            include: {
              attendance: {
                include: {
                  details: true
                }
              }
            },
            orderBy: { sessionDate: 'asc' }
          }
        }
      },
      tuitionPayment: true
    }
  },
  tuitionPayments: {
    include: {
      invoices: {
        include: {
          payment: true
        },
        orderBy: { invoiceDate: 'desc' }
      },
      payments: {
        orderBy: { paymentDate: 'desc' }
      }
    },
    orderBy: { dueDate: 'desc' }
  },
  scores: {
    include: {
      exam: {
        include: {
          classRoom: true
        }
      }
    },
    orderBy: { value: 'desc' }
  },
  attendanceDetails: {
    include: {
      attendance: {
        include: {
          studySession: {
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
            }
          },
          teacher: {
            select: {
              id: true,
              fullName: true,
              username: true,
              role: true,
              status: true
            }
          }
        }
      }
    }
  }
} satisfies Prisma.StudentProfileInclude;

export const studentsService = {
  async list(user: AuthUser, search?: string, classRoomId?: string) {
    const where: Prisma.StudentProfileWhereInput = {};

    if (user.role === Role.STUDENT) {
      where.userId = user.id;
    }

    if (user.role === Role.TEACHER) {
      where.enrollments = {
        some: {
          classRoom: {
            teachingAssignments: {
              some: {
                teacher: {
                  userId: user.id
                }
              }
            }
          }
        }
      };
    }

    if (search) {
      where.OR = [
        { studentCode: { contains: search } },
        { user: { fullName: { contains: search } } },
        { user: { phone: { contains: search } } }
      ];
    }

    if (classRoomId) {
      where.enrollments = {
        some: {
          classRoomId,
          ...(user.role === Role.TEACHER
            ? {
                classRoom: {
                  teachingAssignments: {
                    some: {
                      teacher: {
                        userId: user.id
                      }
                    }
                  }
                }
              }
            : {})
        }
      };
    }

    return prisma.studentProfile.findMany({
      where,
      include: includeStudent,
      orderBy: { createdAt: 'desc' }
    });
  },

  async get(id: string, user: AuthUser) {
    const student = await prisma.studentProfile.findUnique({
      where: { id },
      include: includeStudent
    });
    if (!student) {
      throw new AppError(404, 'Không tìm thấy học viên.');
    }
    if (user.role === Role.STUDENT && student.userId !== user.id) {
      throw new AppError(403, 'Bạn chỉ được xem hồ sơ của chính mình.');
    }
    if (
      user.role === Role.TEACHER &&
      !student.enrollments.some((enrollment) =>
        enrollment.classRoom.teachingAssignments?.some((assignment) => assignment.teacher.user.id === user.id)
      )
    ) {
      throw new AppError(403, 'Bạn chỉ được xem học viên thuộc lớp mình phụ trách.');
    }
    return student;
  },

  async create(input: CreateStudentInput) {
    const password = await bcrypt.hash(input.password ?? '123456', 10);
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName: input.fullName,
          username: input.username,
          password,
          role: Role.STUDENT,
          status: input.status,
          phone: input.phone,
          email: input.email
        }
      });
      return tx.studentProfile.create({
        data: {
          userId: user.id,
          studentCode: input.studentCode,
          customerRole: input.customerRole,
          dateOfBirth: parseDate(input.dateOfBirth),
          address: input.address,
          school: input.school,
          parents: {
            create: input.parents
          }
        },
        include: includeStudent
      });
    });
  },

  async update(id: string, input: UpdateStudentInput) {
    const student = await prisma.studentProfile.findUnique({ where: { id } });
    if (!student) {
      throw new AppError(404, 'Không tìm thấy học viên.');
    }
    return prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: student.userId },
        data: {
          fullName: input.fullName,
          phone: input.phone,
          email: input.email
        }
      });
      return tx.studentProfile.update({
        where: { id },
        data: {
          dateOfBirth: parseDate(input.dateOfBirth),
          address: input.address,
          school: input.school
        },
        include: includeStudent
      });
    });
  }
};
