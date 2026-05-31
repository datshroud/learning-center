import { AppError } from '../../lib/errors.js';
import { ClassStatus, EnrollmentStatus, TuitionStatus, type EnrollmentStatus as EnrollmentStatusValue } from '../../lib/enums.js';
import { prisma } from '../../lib/prisma.js';
import type { CreateEnrollmentInput } from './enrollments.schema.js';

const enrollmentInclude = {
  student: {
    include: {
      user: true
    }
  },
  classRoom: {
    include: {
      course: {
        include: {
          subject: true
        }
      }
    }
  },
  tuitionPayment: true
};

export const enrollmentsService = {
  async list(filters: { studentId?: string; classRoomId?: string }) {
    return prisma.enrollment.findMany({
      where: {
        studentId: filters.studentId,
        classRoomId: filters.classRoomId
      },
      include: enrollmentInclude,
      orderBy: { enrollDate: 'desc' }
    });
  },

  async create(input: CreateEnrollmentInput) {
    return prisma.$transaction(async (tx) => {
      const [student, classRoom] = await Promise.all([
        tx.studentProfile.findUnique({ where: { id: input.studentId } }),
        tx.classRoom.findUnique({
          where: { id: input.classRoomId },
          include: {
            course: true
          }
        })
      ]);

      if (!student) {
        throw new AppError(404, 'Không tìm thấy học viên.');
      }
      if (!classRoom) {
        throw new AppError(404, 'Không tìm thấy lớp học.');
      }
      if (classRoom.status !== ClassStatus.ENROLLING && classRoom.status !== ClassStatus.ACTIVE) {
        throw new AppError(400, 'Lớp chưa mở đăng ký hoặc đã kết thúc.');
      }

      const activeCount = await tx.enrollment.count({
        where: {
          classRoomId: input.classRoomId,
          status: EnrollmentStatus.ACTIVE
        }
      });
      if (activeCount >= classRoom.maxStudents) {
        throw new AppError(409, 'Lớp đã đủ sĩ số.');
      }

      const existed = await tx.enrollment.findUnique({
        where: {
          studentId_classRoomId: {
            studentId: input.studentId,
            classRoomId: input.classRoomId
          }
        }
      });
      if (existed) {
        throw new AppError(409, 'Học viên đã được ghi danh vào lớp này.');
      }

      const enrollment = await tx.enrollment.create({
        data: {
          studentId: input.studentId,
          classRoomId: input.classRoomId
        }
      });

      await tx.tuitionPayment.create({
        data: {
          studentId: input.studentId,
          enrollmentId: enrollment.id,
          amountDue: classRoom.course.tuitionFee,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: TuitionStatus.UNPAID
        }
      });

      await tx.classRoom.update({
        where: { id: input.classRoomId },
        data: {
          currentStudents: activeCount + 1
        }
      });

      return tx.enrollment.findUniqueOrThrow({
        where: { id: enrollment.id },
        include: enrollmentInclude
      });
    });
  },

  async updateStatus(id: string, status: EnrollmentStatusValue) {
    return prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.findUnique({
        where: { id },
        include: {
          classRoom: true
        }
      });

      if (!enrollment) {
        throw new AppError(404, 'Không tìm thấy ghi danh.');
      }

      if (enrollment.status === status) {
        return tx.enrollment.findUniqueOrThrow({
          where: { id },
          include: enrollmentInclude
        });
      }

      if (status === EnrollmentStatus.ACTIVE) {
        if (enrollment.classRoom.status !== ClassStatus.ENROLLING && enrollment.classRoom.status !== ClassStatus.ACTIVE) {
          throw new AppError(400, 'Chỉ có thể kích hoạt ghi danh cho lớp đang tuyển sinh hoặc đang học.');
        }

        const activeCount = await tx.enrollment.count({
          where: {
            classRoomId: enrollment.classRoomId,
            status: EnrollmentStatus.ACTIVE,
            id: { not: id }
          }
        });

        if (activeCount >= enrollment.classRoom.maxStudents) {
          throw new AppError(409, 'Lớp đã đủ sĩ số.');
        }
      }

      await tx.enrollment.update({
        where: { id },
        data: { status }
      });

      const activeCount = await tx.enrollment.count({
        where: {
          classRoomId: enrollment.classRoomId,
          status: EnrollmentStatus.ACTIVE
        }
      });

      await tx.classRoom.update({
        where: { id: enrollment.classRoomId },
        data: {
          currentStudents: activeCount
        }
      });

      return tx.enrollment.findUniqueOrThrow({
        where: { id },
        include: enrollmentInclude
      });
    });
  }
};
