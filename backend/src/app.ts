import cors from 'cors';
import express from 'express';
import { errorHandler, notFoundHandler } from './lib/errors.js';
import { authenticate } from './middleware/auth.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { userRoutes } from './modules/users/users.routes.js';
import { studentRoutes } from './modules/students/students.routes.js';
import { teacherRoutes } from './modules/teachers/teachers.routes.js';
import { courseRoutes } from './modules/courses/courses.routes.js';
import { classRoutes } from './modules/classes/classes.routes.js';
import { scheduleRoutes } from './modules/schedules/schedules.routes.js';
import { enrollmentRoutes } from './modules/enrollments/enrollments.routes.js';
import { attendanceRoutes } from './modules/attendance/attendance.routes.js';
import { tuitionRoutes } from './modules/tuition/tuition.routes.js';
import { examRoutes } from './modules/exams/exams.routes.js';
import { reportRoutes } from './modules/reports/reports.routes.js';
import { notificationRoutes } from './modules/notifications/notifications.routes.js';

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
      credentials: true
    })
  );
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', authenticate, userRoutes);
  app.use('/api/students', authenticate, studentRoutes);
  app.use('/api/teachers', authenticate, teacherRoutes);
  app.use('/api', authenticate, courseRoutes);
  app.use('/api', authenticate, classRoutes);
  app.use('/api', authenticate, scheduleRoutes);
  app.use('/api/enrollments', authenticate, enrollmentRoutes);
  app.use('/api/attendance', authenticate, attendanceRoutes);
  app.use('/api', authenticate, tuitionRoutes);
  app.use('/api', authenticate, examRoutes);
  app.use('/api/reports', authenticate, reportRoutes);
  app.use('/api/notifications', authenticate, notificationRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
