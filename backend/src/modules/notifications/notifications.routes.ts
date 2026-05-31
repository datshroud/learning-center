import { Router } from 'express';
import { notificationsController } from './notifications.controller.js';

export const notificationRoutes = Router();

notificationRoutes.get('/', notificationsController.list);
notificationRoutes.patch('/read-all', notificationsController.markAllRead);
notificationRoutes.patch('/:id/read', notificationsController.markRead);

