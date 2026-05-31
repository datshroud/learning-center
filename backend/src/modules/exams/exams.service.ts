import { Prisma } from '@prisma/client';
import { AppError } from '../../lib/errors.js';
import { parseDate } from '../../lib/date.js';
import { Role } from '../../lib/enums.js';
import { prisma } from '../../lib/prisma.js';
import type { AuthUser } from '../../middleware/auth.js';
import type { CreateExamInput, CreateScoreInput, UpdateScoreInput } from './exams.schema.js';

const examInclude = {
  classRoom: {
    include: {
      course: {
        include: {
          subject: true
        }
      }
    }
  },
  scores: {
    include: {
      student: {
        include: {
          user: true
        }
      }
    }
  }
};

async function ensureTeacherCanAccessClass(user: AuthUser, classRoomId: string) {
  if (user.role !== Role.TEACHER) {
    return;
  }
  const assignment = await prisma.teachingAssignment.findFirst({
    where: {
      classRoomId,
      teacher: {
        userId: user.id
      }
    }
  });
  if (!assignment) {
    throw new AppError(403, 'Bạn không được phân công lớp này.');
  }
}

export const examsService = {
  async list(user: AuthUser, classRoomId?: string) {
    return prisma.exam.findMany({
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
      include: examInclude,
      orderBy: { examDate: 'desc' }
    });
  },

  async create(user: AuthUser, input: CreateExamInput) {
    await ensureTeacherCanAccessClass(user, input.classRoomId);
    return prisma.exam.create({
      data: {
        classRoomId: input.classRoomId,
        name: input.name,
        examDate: parseDate(input.examDate)!,
        maxScore: new Prisma.Decimal(input.maxScore)
      },
      include: examInclude
    });
  },

  async listScores(user: AuthUser, examId?: string, studentId?: string) {
    return prisma.score.findMany({
      where: {
        examId,
        studentId,
        student:
          user.role === Role.STUDENT
            ? {
                userId: user.id
              }
            : undefined,
        exam:
          user.role === Role.TEACHER
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
            : undefined
      },
      include: {
        exam: {
          include: {
            classRoom: true
          }
        },
        student: {
          include: {
            user: true
          }
        }
      }
    });
  },

  async createScore(user: AuthUser, input: CreateScoreInput) {
    const exam = await prisma.exam.findUnique({ where: { id: input.examId } });
    if (!exam) {
      throw new AppError(404, 'Không tìm thấy bài kiểm tra.');
    }
    await ensureTeacherCanAccessClass(user, exam.classRoomId);
    const value = new Prisma.Decimal(input.value);
    if (value.gt(exam.maxScore)) {
      throw new AppError(400, 'Điểm không được vượt quá điểm tối đa.');
    }
    const existed = await prisma.score.findUnique({
      where: {
        examId_studentId: {
          examId: input.examId,
          studentId: input.studentId
        }
      }
    });
    if (existed) {
      throw new AppError(409, 'Học viên đã có điểm cho bài kiểm tra này.');
    }
    return prisma.score.create({
      data: {
        examId: input.examId,
        studentId: input.studentId,
        value,
        comment: input.comment
      }
    });
  },

  async updateScore(user: AuthUser, id: string, input: UpdateScoreInput) {
    const current = await prisma.score.findUnique({
      where: { id },
      include: {
        exam: true
      }
    });
    if (!current) {
      throw new AppError(404, 'Không tìm thấy điểm.');
    }
    await ensureTeacherCanAccessClass(user, current.exam.classRoomId);
    const value = input.value == null ? current.value : new Prisma.Decimal(input.value);
    if (value.gt(current.exam.maxScore)) {
      throw new AppError(400, 'Điểm không được vượt quá điểm tối đa.');
    }
    return prisma.score.update({
      where: { id },
      data: {
        value,
        comment: input.comment
      }
    });
  }
};
