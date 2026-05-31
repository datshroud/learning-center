import { Router } from 'express';
import { authorize } from '../../middleware/auth.js';
import { Role } from '../../lib/enums.js';
import { validateBody } from '../../middleware/validate.js';
import { examsController } from './exams.controller.js';
import { createExamSchema, createScoreSchema, updateScoreSchema } from './exams.schema.js';

export const examRoutes = Router();

examRoutes.get('/exams', authorize(Role.ADMIN, Role.STAFF, Role.TEACHER, Role.STUDENT), examsController.list);
examRoutes.post('/exams', authorize(Role.ADMIN, Role.TEACHER), validateBody(createExamSchema), examsController.create);
examRoutes.get('/scores', authorize(Role.ADMIN, Role.STAFF, Role.TEACHER, Role.STUDENT), examsController.listScores);
examRoutes.post('/scores', authorize(Role.ADMIN, Role.TEACHER), validateBody(createScoreSchema), examsController.createScore);
examRoutes.patch('/scores/:id', authorize(Role.ADMIN, Role.TEACHER), validateBody(updateScoreSchema), examsController.updateScore);
