import { Prisma } from '@prisma/client';
import { AppError } from '../../lib/errors.js';
import { PaymentMethod, Role, TuitionStatus, type TuitionStatus as TuitionStatusValue } from '../../lib/enums.js';
import { prisma } from '../../lib/prisma.js';
import type { AuthUser } from '../../middleware/auth.js';
import type { PayTuitionInput } from './tuition.schema.js';

const tuitionInclude = {
  student: {
    include: {
      user: true
    }
  },
  enrollment: {
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
  payments: true,
  invoices: {
    include: {
      payment: true
    },
    orderBy: { invoiceDate: 'desc' as const }
  }
};

export const tuitionService = {
  async list(user: AuthUser, studentId?: string, status?: TuitionStatusValue) {
    return prisma.tuitionPayment.findMany({
      where: {
        studentId,
        status,
        student:
          user.role === Role.STUDENT
            ? {
                userId: user.id
              }
            : undefined
      },
      include: tuitionInclude,
      orderBy: { dueDate: 'asc' }
    });
  },

  async pay(id: string, input: PayTuitionInput) {
    return prisma.$transaction(async (tx) => {
      const tuition = await tx.tuitionPayment.findUnique({
        where: { id },
        include: tuitionInclude
      });
      if (!tuition) {
        throw new AppError(404, 'Không tìm thấy khoản học phí.');
      }

      const amount = new Prisma.Decimal(input.amount);
      const remaining = tuition.amountDue.minus(tuition.amountPaid);
      if (amount.lte(0)) {
        throw new AppError(400, 'Số tiền thanh toán phải lớn hơn 0.');
      }
      if (amount.gt(remaining)) {
        throw new AppError(400, 'Không được thu vượt số tiền còn lại.');
      }

      const newPaid = tuition.amountPaid.plus(amount);
      const newStatus = newPaid.gte(tuition.amountDue) ? TuitionStatus.PAID : TuitionStatus.PARTIAL;

      const payment = await tx.payment.create({
        data: {
          tuitionPaymentId: id,
          amount,
          method: input.method as PaymentMethod,
          note: input.note
        }
      });

      await tx.tuitionPayment.update({
        where: { id },
        data: {
          amountPaid: newPaid,
          status: newStatus
        }
      });

      const invoice = await tx.invoice.create({
        data: {
          tuitionPaymentId: id,
          paymentId: payment.id,
          totalAmount: amount
        },
        include: {
          payment: true,
          tuitionPayment: {
            include: tuitionInclude
          }
        }
      });

      return invoice;
    });
  },

  async getInvoice(user: AuthUser, id: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        payment: true,
        tuitionPayment: {
          include: tuitionInclude
        }
      }
    });
    if (!invoice) {
      throw new AppError(404, 'Không tìm thấy hóa đơn.');
    }
    if (user.role === Role.STUDENT && invoice.tuitionPayment.student.userId !== user.id) {
      throw new AppError(403, 'Bạn chỉ được xem phiếu thu của chính mình.');
    }
    return invoice;
  }
};
