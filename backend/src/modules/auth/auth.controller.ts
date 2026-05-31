import type { RequestHandler } from 'express';
import { asyncHandler } from '../../lib/errors.js';
import { authService } from './auth.service.js';

export const authController = {
  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    res.json(result);
  }) as RequestHandler,

  me: asyncHandler(async (req, res) => {
    const result = await authService.me(req.user!.id);
    res.json(result);
  }) as RequestHandler,

  logout: asyncHandler(async (_req, res) => {
    res.json({ message: 'Đăng xuất thành công.' });
  }) as RequestHandler
};

