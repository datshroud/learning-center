import { Router } from 'express';
import { authorize } from '../../middleware/auth.js';
import { Role } from '../../lib/enums.js';
import { validateBody } from '../../middleware/validate.js';
import { enrollmentsController } from './enrollments.controller.js';
import { createEnrollmentSchema, updateEnrollmentStatusSchema } from './enrollments.schema.js';

export const enrollmentRoutes = Router();

enrollmentRoutes.get('/', authorize(Role.ADMIN, Role.STAFF), enrollmentsController.list);
enrollmentRoutes.post('/', authorize(Role.ADMIN, Role.STAFF), validateBody(createEnrollmentSchema), enrollmentsController.create);
enrollmentRoutes.patch('/:id/status', authorize(Role.ADMIN, Role.STAFF), validateBody(updateEnrollmentStatusSchema), enrollmentsController.updateStatus);
