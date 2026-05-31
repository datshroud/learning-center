import { Router } from 'express';
import { authorize } from '../../middleware/auth.js';
import { Role } from '../../lib/enums.js';
import { reportsController } from './reports.controller.js';

export const reportRoutes = Router();

reportRoutes.get('/dashboard', authorize(Role.ADMIN, Role.STAFF, Role.TEACHER, Role.STUDENT), reportsController.dashboard);
reportRoutes.get('/analytics/:metric', authorize(Role.ADMIN, Role.STAFF), reportsController.analytics);
reportRoutes.get('/revenue', authorize(Role.ADMIN, Role.STAFF), reportsController.revenue);
reportRoutes.get('/attendance', authorize(Role.ADMIN, Role.STAFF), reportsController.attendance);
reportRoutes.get('/learning-results', authorize(Role.ADMIN, Role.STAFF, Role.TEACHER), reportsController.learningResults);
