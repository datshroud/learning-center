import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    schedule: {
      findMany: vi.fn(),
      create: vi.fn()
    },
    teachingAssignment: {
      findMany: vi.fn()
    }
  }
}));

vi.mock('../lib/prisma.js', () => ({
  prisma: prismaMock
}));

const { schedulesService } = await import('../modules/schedules/schedules.service.js');

describe('schedules service conflict rules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks creating a schedule when the room already has an overlapping slot', async () => {
    prismaMock.schedule.findMany.mockResolvedValueOnce([
      {
        id: 'schedule-existing',
        roomId: 'room-1',
        dayOfWeek: 1,
        startTime: '18:00',
        endTime: '20:00'
      }
    ]);

    await expect(
      schedulesService.createSchedule({
        classRoomId: 'class-1',
        roomId: 'room-1',
        dayOfWeek: 1,
        startTime: '19:00',
        endTime: '21:00'
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      message: 'Phòng học đã có lịch trong khung giờ này.'
    });

    expect(prismaMock.schedule.create).not.toHaveBeenCalled();
  });

  it('blocks creating a schedule when an assigned teacher already teaches at that time', async () => {
    prismaMock.schedule.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 'teacher-schedule',
          dayOfWeek: 2,
          startTime: '18:30',
          endTime: '20:30',
          classRoom: {
            id: 'another-class'
          }
        }
      ]);
    prismaMock.teachingAssignment.findMany.mockResolvedValue([{ teacherId: 'teacher-1' }]);

    await expect(
      schedulesService.createSchedule({
        classRoomId: 'class-1',
        roomId: 'room-1',
        dayOfWeek: 2,
        startTime: '19:00',
        endTime: '21:00'
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      message: 'Giáo viên đã có lịch dạy trong khung giờ này.'
    });

    expect(prismaMock.schedule.create).not.toHaveBeenCalled();
  });
});
