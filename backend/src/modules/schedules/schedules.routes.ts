import { Router } from 'express';
import { authorize } from '../../middleware/auth.js';
import { Role } from '../../lib/enums.js';
import { validateBody } from '../../middleware/validate.js';
import { schedulesController } from './schedules.controller.js';
import {
  createRoomSchema,
  createScheduleSchema,
  createStudySessionSchema,
  updateScheduleSchema
} from './schedules.schema.js';

export const scheduleRoutes = Router();

scheduleRoutes.get('/rooms', authorize(Role.ADMIN, Role.STAFF), schedulesController.listRooms);
scheduleRoutes.post('/rooms', authorize(Role.ADMIN, Role.STAFF), validateBody(createRoomSchema), schedulesController.createRoom);

scheduleRoutes.get('/schedules', authorize(Role.ADMIN, Role.STAFF, Role.TEACHER, Role.STUDENT), schedulesController.listSchedules);
scheduleRoutes.post('/schedules', authorize(Role.ADMIN, Role.STAFF), validateBody(createScheduleSchema), schedulesController.createSchedule);
scheduleRoutes.patch('/schedules/:id', authorize(Role.ADMIN, Role.STAFF), validateBody(updateScheduleSchema), schedulesController.updateSchedule);

scheduleRoutes.get('/study-sessions', authorize(Role.ADMIN, Role.STAFF, Role.TEACHER), schedulesController.listStudySessions);
scheduleRoutes.post('/study-sessions', authorize(Role.ADMIN, Role.STAFF), validateBody(createStudySessionSchema), schedulesController.createStudySession);
