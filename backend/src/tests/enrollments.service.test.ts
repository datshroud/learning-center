import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClassStatus, EnrollmentStatus } from '../lib/enums.js';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    $transaction: vi.fn(),
    enrollment: {
      findUnique: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      findUniqueOrThrow: vi.fn()
    },
    classRoom: {
      update: vi.fn()
    }
  }
}));

vi.mock('../lib/prisma.js', () => ({
  prisma: prismaMock
}));

const { enrollmentsService } = await import('../modules/enrollments/enrollments.service.js');

describe('enrollments service status rules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock));
  });

  it('recalculates class size after cancelling an active enrollment', async () => {
    prismaMock.enrollment.findUnique.mockResolvedValue({
      id: 'enrollment-1',
      classRoomId: 'class-1',
      status: EnrollmentStatus.ACTIVE,
      classRoom: {
        id: 'class-1',
        status: ClassStatus.ACTIVE,
        maxStudents: 20
      }
    });
    prismaMock.enrollment.count.mockResolvedValue(9);
    prismaMock.enrollment.findUniqueOrThrow.mockResolvedValue({
      id: 'enrollment-1',
      status: EnrollmentStatus.CANCELLED
    });

    await enrollmentsService.updateStatus('enrollment-1', EnrollmentStatus.CANCELLED);

    expect(prismaMock.enrollment.update).toHaveBeenCalledWith({
      where: { id: 'enrollment-1' },
      data: { status: EnrollmentStatus.CANCELLED }
    });
    expect(prismaMock.classRoom.update).toHaveBeenCalledWith({
      where: { id: 'class-1' },
      data: {
        currentStudents: 9
      }
    });
  });

  it('blocks reactivating an enrollment when the class is already full', async () => {
    prismaMock.enrollment.findUnique.mockResolvedValue({
      id: 'enrollment-1',
      classRoomId: 'class-1',
      status: EnrollmentStatus.CANCELLED,
      classRoom: {
        id: 'class-1',
        status: ClassStatus.ACTIVE,
        maxStudents: 10
      }
    });
    prismaMock.enrollment.count.mockResolvedValue(10);

    await expect(enrollmentsService.updateStatus('enrollment-1', EnrollmentStatus.ACTIVE)).rejects.toMatchObject({
      statusCode: 409,
      message: 'Lớp đã đủ sĩ số.'
    });

    expect(prismaMock.enrollment.update).not.toHaveBeenCalled();
    expect(prismaMock.classRoom.update).not.toHaveBeenCalled();
  });
});
