import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { authController } from './auth.controller.js';
import { loginSchema } from './auth.schema.js';

export const authRoutes = Router();

authRoutes.post('/login', validateBody(loginSchema), authController.login);
authRoutes.get('/me', authenticate, authController.me);
authRoutes.post('/logout', authenticate, authController.logout);

