import type { RequestHandler } from 'express';
import { asyncHandler } from '../../lib/errors.js';
import { notificationsService } from './notifications.service.js';

export const notificationsController = {
  list: asyncHandler(async (req, res) => {
    res.json(await notificationsService.list(req.user!.id));
  }) as RequestHandler,

  markRead: asyncHandler(async (req, res) => {
    res.json(await notificationsService.markRead(req.params.id as string, req.user!.id));
  }) as RequestHandler,

  markAllRead: asyncHandler(async (req, res) => {
    res.json(await notificationsService.markAllRead(req.user!.id));
  }) as RequestHandler
};
