import { Prisma } from '@prisma/client';
import { parseDate } from '../../lib/date.js';
import { prisma } from '../../lib/prisma.js';
import type { CreateCourseInput, CreateSubjectInput } from './courses.schema.js';

export const coursesService = {
  async listSubjects() {
    return prisma.subject.findMany({
      include: {
        courses: true
      },
      orderBy: { name: 'asc' }
    });
  },

  async createSubject(input: CreateSubjectInput) {
    return prisma.subject.create({ data: input });
  },

  async updateSubject(id: string, input: Partial<CreateSubjectInput>) {
    return prisma.subject.update({ where: { id }, data: input });
  },

  async listCourses(search?: string) {
    return prisma.course.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { subject: { name: { contains: search } } }
            ]
          }
        : undefined,
      include: {
        subject: true,
        classes: true
      },
      orderBy: { name: 'asc' }
    });
  },

  async createCourse(input: CreateCourseInput) {
    return prisma.course.create({
      data: {
        ...input,
        tuitionFee: new Prisma.Decimal(input.tuitionFee),
        startDate: parseDate(input.startDate),
        endDate: parseDate(input.endDate)
      },
      include: {
        subject: true
      }
    });
  },

  async updateCourse(id: string, input: Partial<CreateCourseInput>) {
    return prisma.course.update({
      where: { id },
      data: {
        ...input,
        tuitionFee: input.tuitionFee == null ? undefined : new Prisma.Decimal(input.tuitionFee),
        startDate: parseDate(input.startDate),
        endDate: parseDate(input.endDate)
      },
      include: {
        subject: true,
        classes: true
      }
    });
  }
};

