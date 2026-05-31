import bcrypt from 'bcryptjs';
import { type Prisma } from '@prisma/client';
import { AppError } from '../../lib/errors.js';
import { Role } from '../../lib/enums.js';
import { prisma } from '../../lib/prisma.js';
import type { CreateTeacherInput, UpdateTeacherInput } from './teachers.schema.js';

const includeTeacher = {
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
  assignments: {
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
          }
        }
      }
    }
  }
} satisfies Prisma.TeacherProfileInclude;

export const teachersService = {
  async list(search?: string) {
    return prisma.teacherProfile.findMany({
      where: search
        ? {
            OR: [
              { teacherCode: { contains: search } },
              { specialization: { contains: search } },
              { user: { fullName: { contains: search } } }
            ]
          }
        : undefined,
      include: includeTeacher,
      orderBy: { createdAt: 'desc' }
    });
  },

  async create(input: CreateTeacherInput) {
    const password = await bcrypt.hash(input.password ?? '123456', 10);
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName: input.fullName,
          username: input.username,
          password,
          role: Role.TEACHER,
          phone: input.phone,
          email: input.email
        }
      });
      return tx.teacherProfile.create({
        data: {
          userId: user.id,
          teacherCode: input.teacherCode,
          specialization: input.specialization,
          qualification: input.qualification
        },
        include: includeTeacher
      });
    });
  },

  async update(id: string, input: UpdateTeacherInput) {
    const teacher = await prisma.teacherProfile.findUnique({ where: { id } });
    if (!teacher) {
      throw new AppError(404, 'Không tìm thấy giáo viên.');
    }
    return prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: teacher.userId },
        data: {
          fullName: input.fullName,
          phone: input.phone,
          email: input.email
        }
      });
      return tx.teacherProfile.update({
        where: { id },
        data: {
          specialization: input.specialization,
          qualification: input.qualification
        },
        include: includeTeacher
      });
    });
  }
};
