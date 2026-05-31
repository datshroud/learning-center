import type { RequestHandler } from 'express';
import { asyncHandler } from '../../lib/errors.js';
import { attendanceService } from './attendance.service.js';

export const attendanceController = {
  getBySession: asyncHandler(async (req, res) => {
    res.json(await attendanceService.getBySession(req.user!, req.params.sessionId as string));
  }) as RequestHandler,

  save: asyncHandler(async (req, res) => {
    res.status(201).json(await attendanceService.save(req.user!, req.body));
  }) as RequestHandler
};
