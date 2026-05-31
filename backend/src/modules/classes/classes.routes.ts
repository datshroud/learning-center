import { Router } from 'express';
import { authorize } from '../../middleware/auth.js';
import { Role } from '../../lib/enums.js';
import { validateBody } from '../../middleware/validate.js';
import { classesController } from './classes.controller.js';
import {
  createClassSchema,
  createTeachingAssignmentSchema,
  updateClassSchema,
  updateClassStatusSchema
} from './classes.schema.js';

export const classRoutes = Router();

classRoutes.get('/classes', authorize(Role.ADMIN, Role.STAFF, Role.TEACHER, Role.STUDENT), classesController.list);
classRoutes.post('/classes', authorize(Role.ADMIN, Role.STAFF), validateBody(createClassSchema), classesController.create);
classRoutes.get('/classes/:id', authorize(Role.ADMIN, Role.STAFF, Role.TEACHER, Role.STUDENT), classesController.get);
classRoutes.patch('/classes/:id', authorize(Role.ADMIN, Role.STAFF), validateBody(updateClassSchema), classesController.update);
classRoutes.patch('/classes/:id/status', authorize(Role.ADMIN, Role.STAFF), validateBody(updateClassStatusSchema), classesController.updateStatus);
classRoutes.post('/teaching-assignments', authorize(Role.ADMIN, Role.STAFF), validateBody(createTeachingAssignmentSchema), classesController.createAssignment);
