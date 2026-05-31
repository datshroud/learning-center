import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { LoginInput } from './auth.schema.js';
import { AppError } from '../../lib/errors.js';
import { prisma } from '../../lib/prisma.js';

const publicUserSelect = {
  id: true,
  fullName: true,
  phone: true,
  email: true,
  username: true,
  role: true,
  status: true,
  studentProfile: true,
  teacherProfile: true,
  staffProfile: true
} as const;

const signToken = (userId: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(500, 'JWT_SECRET chưa được cấu hình.');
  }
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '1d') as SignOptions['expiresIn']
  };
  return jwt.sign({ sub: userId }, secret, options);
};

export const authService = {
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { username: input.username },
      include: {
        studentProfile: true,
        teacherProfile: true,
        staffProfile: true
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new AppError(401, 'Tên đăng nhập hoặc mật khẩu không đúng.');
    }

    const matched = await bcrypt.compare(input.password, user.password);
    if (!matched) {
      throw new AppError(401, 'Tên đăng nhập hoặc mật khẩu không đúng.');
    }

    const { password: _password, ...publicUser } = user;
    return {
      token: signToken(user.id),
      user: publicUser
    };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect
    });
    if (!user) {
      throw new AppError(404, 'Không tìm thấy người dùng.');
    }
    return user;
  }
};
