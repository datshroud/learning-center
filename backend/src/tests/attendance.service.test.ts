import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Role } from '../lib/enums.js';
import type { AuthUser } from '../middleware/auth.js';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    attendance: {
      findUnique: vi.fn()
    }
  }
}));

vi.mock('../lib/prisma.js', () => ({
  prisma: prismaMock
}));

const { attendanceService } = await import('../modules/attendance/attendance.service.js');

describe('attendance service authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks a teacher from viewing attendance outside assigned classes', async () => {
    const teacher: AuthUser = {
      id: 'teacher-user-1',
      username: 'teacher01',
      fullName: 'Nguyễn Văn An',
      role: Role.TEACHER
    };

    prismaMock.attendance.findUnique.mockResolvedValue({
      id: 'attendance-1',
      studySession: {
        classRoom: {
          teachingAssignments: [
            {
              teacher: {
                userId: 'another-teacher-user'
              }
            }
          ]
        }
      }
    });

    await expect(attendanceService.getBySession(teacher, 'session-1')).rejects.toMatchObject({
      statusCode: 403,
      message: 'Bạn không được phân công lớp này.'
    });
  });
});
