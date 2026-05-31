import bcrypt from 'bcryptjs';
import { type Prisma } from '@prisma/client';
import { AppError } from '../../lib/errors.js';
import { Role, type UserStatus as UserStatusValue } from '../../lib/enums.js';
import { prisma } from '../../lib/prisma.js';
import { parseDate } from '../../lib/date.js';
import type { CreateUserInput, UpdateUserInput } from './users.schema.js';

const userInclude = {
  studentProfile: {
    include: {
      parents: true
    }
  },
  teacherProfile: true,
  staffProfile: true
} satisfies Prisma.UserInclude;

const withoutPassword = <T extends { password?: string }>(user: T) => {
  const { password: _password, ...safe } = user;
  return safe;
};

export const usersService = {
  async list(search?: string) {
    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { fullName: { contains: search } },
              { username: { contains: search } },
              { phone: { contains: search } },
              { email: { contains: search } }
            ]
          }
        : undefined,
      include: userInclude,
      orderBy: { createdAt: 'desc' }
    });
    return users.map(withoutPassword);
  },

  async create(input: CreateUserInput) {
    const password = await bcrypt.hash(input.password ?? '123456', 10);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          fullName: input.fullName,
          username: input.username,
          password,
          role: input.role,
          phone: input.phone,
          email: input.email
        }
      });

      if (input.role === Role.STUDENT) {
        if (!input.student) {
          throw new AppError(400, 'Thiếu thông tin hồ sơ học viên.');
        }
        await tx.studentProfile.create({
          data: {
            userId: created.id,
            studentCode: input.student.studentCode,
            dateOfBirth: parseDate(input.student.dateOfBirth),
            address: input.student.address,
            school: input.student.school
          }
        });
      }

      if (input.role === Role.TEACHER) {
        if (!input.teacher) {
          throw new AppError(400, 'Thiếu thông tin hồ sơ giáo viên.');
        }
        await tx.teacherProfile.create({
          data: {
            userId: created.id,
            teacherCode: input.teacher.teacherCode,
            specialization: input.teacher.specialization,
            qualification: input.teacher.qualification
          }
        });
      }

      if (input.role === Role.STAFF) {
        if (!input.staff) {
          throw new AppError(400, 'Thiếu thông tin hồ sơ nhân viên.');
        }
        await tx.staffProfile.create({
          data: {
            userId: created.id,
            staffCode: input.staff.staffCode,
            position: input.staff.position
          }
        });
      }

      return tx.user.findUniqueOrThrow({
        where: { id: created.id },
        include: userInclude
      });
    });

    return withoutPassword(user);
  },

  async update(id: string, input: UpdateUserInput) {
    const user = await prisma.user.update({
      where: { id },
      data: input,
      include: userInclude
    });
    return withoutPassword(user);
  },

  async updateStatus(id: string, status: UserStatusValue) {
    const user = await prisma.user.update({
      where: { id },
      data: { status },
      include: userInclude
    });
    return withoutPassword(user);
  }
};
