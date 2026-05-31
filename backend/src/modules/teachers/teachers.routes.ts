import { Router } from 'express';
import { authorize } from '../../middleware/auth.js';
import { Role } from '../../lib/enums.js';
import { validateBody } from '../../middleware/validate.js';
import { teachersController } from './teachers.controller.js';
import { createTeacherSchema, updateTeacherSchema } from './teachers.schema.js';

export const teacherRoutes = Router();

teacherRoutes.get('/', authorize(Role.ADMIN, Role.STAFF), teachersController.list);
teacherRoutes.post('/', authorize(Role.ADMIN), validateBody(createTeacherSchema), teachersController.create);
teacherRoutes.patch('/:id', authorize(Role.ADMIN), validateBody(updateTeacherSchema), teachersController.update);
