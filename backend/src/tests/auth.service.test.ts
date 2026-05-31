import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Role, UserStatus } from '../lib/enums.js';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn()
    }
  }
}));

vi.mock('../lib/prisma.js', () => ({
  prisma: prismaMock
}));

const { authService } = await import('../modules/auth/auth.service.js');

describe('auth service login rules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks locked accounts from logging in', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      username: 'locked-user',
      password: 'hashed-password',
      fullName: 'Tài khoản bị khóa',
      role: Role.STAFF,
      status: UserStatus.LOCKED
    });

    await expect(authService.login({ username: 'locked-user', password: '123456' })).rejects.toMatchObject({
      statusCode: 401,
      message: 'Tên đăng nhập hoặc mật khẩu không đúng.'
    });
  });
});
