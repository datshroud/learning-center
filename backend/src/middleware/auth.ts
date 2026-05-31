import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../lib/errors.js';
import { type Role } from '../lib/enums.js';
import { prisma } from '../lib/prisma.js';

export type AuthUser = {
  id: string;
  username: string;
  fullName: string;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

type JwtPayload = {
  sub: string;
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(500, 'JWT_SECRET chưa được cấu hình.');
  }
  return secret;
};

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AppError(401, 'Chưa đăng nhập.');
    }

    const token = header.slice('Bearer '.length);
    const payload = jwt.verify(token, getJwtSecret()) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        status: true
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new AppError(401, 'Tài khoản không hợp lệ hoặc đã bị khóa.');
    }

    req.user = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role as Role
    };
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError(401, 'Token không hợp lệ.'));
  }
};

export const authorize =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      return next(new AppError(401, 'Chưa đăng nhập.'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Bạn không có quyền thực hiện chức năng này.'));
    }
    return next();
  };
