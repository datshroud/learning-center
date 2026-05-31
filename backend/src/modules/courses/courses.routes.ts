import { Router } from 'express';
import { authorize } from '../../middleware/auth.js';
import { Role } from '../../lib/enums.js';
import { validateBody } from '../../middleware/validate.js';
import { coursesController } from './courses.controller.js';
import {
  createCourseSchema,
  createSubjectSchema,
  updateCourseSchema,
  updateSubjectSchema
} from './courses.schema.js';

export const courseRoutes = Router();

courseRoutes.get('/subjects', authorize(Role.ADMIN, Role.STAFF, Role.TEACHER, Role.STUDENT), coursesController.listSubjects);
courseRoutes.post('/subjects', authorize(Role.ADMIN), validateBody(createSubjectSchema), coursesController.createSubject);
courseRoutes.patch('/subjects/:id', authorize(Role.ADMIN), validateBody(updateSubjectSchema), coursesController.updateSubject);

courseRoutes.get('/courses', authorize(Role.ADMIN, Role.STAFF, Role.TEACHER, Role.STUDENT), coursesController.listCourses);
courseRoutes.post('/courses', authorize(Role.ADMIN), validateBody(createCourseSchema), coursesController.createCourse);
courseRoutes.patch('/courses/:id', authorize(Role.ADMIN), validateBody(updateCourseSchema), coursesController.updateCourse);
