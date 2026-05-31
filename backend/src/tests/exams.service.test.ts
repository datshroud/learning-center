import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Role } from '../lib/enums.js';
import type { AuthUser } from '../middleware/auth.js';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    score: {
      findUnique: vi.fn(),
      update: vi.fn()
    },
    teachingAssignment: {
      findFirst: vi.fn()
    }
  }
}));

vi.mock('../lib/prisma.js', () => ({
  prisma: prismaMock
}));

const { examsService } = await import('../modules/exams/exams.service.js');

describe('exams service authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks a teacher from updating scores outside assigned classes', async () => {
    const teacher: AuthUser = {
      id: 'teacher-user-1',
      username: 'teacher01',
      fullName: 'Nguyễn Văn An',
      role: Role.TEACHER
    };

    prismaMock.score.findUnique.mockResolvedValue({
      id: 'score-1',
      value: 7.5,
      exam: {
        id: 'exam-1',
        classRoomId: 'class-not-assigned',
        maxScore: 10
      }
    });
    prismaMock.teachingAssignment.findFirst.mockResolvedValue(null);

    await expect(examsService.updateScore(teacher, 'score-1', { value: 8 })).rejects.toMatchObject({
      statusCode: 403,
      message: 'Bạn không được phân công lớp này.'
    });

    expect(prismaMock.score.update).not.toHaveBeenCalled();
  });
});
