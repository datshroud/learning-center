import { Router } from 'express';
import { authorize } from '../../middleware/auth.js';
import { Role } from '../../lib/enums.js';
import { validateBody } from '../../middleware/validate.js';
import { studentsController } from './students.controller.js';
import { createStudentSchema, updateStudentSchema } from './students.schema.js';

export const studentRoutes = Router();

studentRoutes.get('/', authorize(Role.ADMIN, Role.STAFF, Role.TEACHER, Role.STUDENT), studentsController.list);
studentRoutes.get('/:id', authorize(Role.ADMIN, Role.STAFF, Role.TEACHER, Role.STUDENT), studentsController.get);
studentRoutes.post('/', authorize(Role.ADMIN, Role.STAFF), validateBody(createStudentSchema), studentsController.create);
studentRoutes.patch('/:id', authorize(Role.ADMIN, Role.STAFF), validateBody(updateStudentSchema), studentsController.update);
