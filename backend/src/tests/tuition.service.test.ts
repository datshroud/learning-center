import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '@prisma/client';
import { Role } from '../lib/enums.js';
import type { AuthUser } from '../middleware/auth.js';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    $transaction: vi.fn(),
    invoice: {
      findUnique: vi.fn()
    },
    tuitionPayment: {
      findUnique: vi.fn(),
      update: vi.fn()
    },
    payment: {
      create: vi.fn()
    }
  }
}));

vi.mock('../lib/prisma.js', () => ({
  prisma: prismaMock
}));

const { tuitionService } = await import('../modules/tuition/tuition.service.js');

describe('tuition service authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock));
  });

  it('blocks a student from viewing another student invoice', async () => {
    const student: AuthUser = {
      id: 'student-user-1',
      username: 'student01',
      fullName: 'Trần Văn Bảo',
      role: Role.STUDENT
    };

    prismaMock.invoice.findUnique.mockResolvedValue({
      id: 'invoice-1',
      tuitionPayment: {
        student: {
          userId: 'another-student-user'
        }
      }
    });

    await expect(tuitionService.getInvoice(student, 'invoice-1')).rejects.toMatchObject({
      statusCode: 403,
      message: 'Bạn chỉ được xem phiếu thu của chính mình.'
    });
  });

  it('blocks collecting more than the remaining tuition amount', async () => {
    prismaMock.tuitionPayment.findUnique.mockResolvedValue({
      id: 'tuition-1',
      amountDue: new Prisma.Decimal(1000),
      amountPaid: new Prisma.Decimal(800),
      student: {
        user: {
          fullName: 'Học viên A'
        }
      },
      payments: [],
      invoices: []
    });

    await expect(
      tuitionService.pay('tuition-1', {
        amount: 250,
        method: 'CASH'
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Không được thu vượt số tiền còn lại.'
    });

    expect(prismaMock.payment.create).not.toHaveBeenCalled();
    expect(prismaMock.tuitionPayment.update).not.toHaveBeenCalled();
  });
});
