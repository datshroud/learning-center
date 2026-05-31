import { Router } from 'express';
import { authorize } from '../../middleware/auth.js';
import { Role } from '../../lib/enums.js';
import { validateBody } from '../../middleware/validate.js';
import { attendanceController } from './attendance.controller.js';
import { saveAttendanceSchema } from './attendance.schema.js';

export const attendanceRoutes = Router();

attendanceRoutes.get('/session/:sessionId', authorize(Role.ADMIN, Role.STAFF, Role.TEACHER), attendanceController.getBySession);
attendanceRoutes.post('/', authorize(Role.TEACHER), validateBody(saveAttendanceSchema), attendanceController.save);
