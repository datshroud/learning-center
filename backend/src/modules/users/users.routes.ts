import { Router } from 'express';
import { authorize } from '../../middleware/auth.js';
import { Role } from '../../lib/enums.js';
import { validateBody } from '../../middleware/validate.js';
import { usersController } from './users.controller.js';
import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema
} from './users.schema.js';

export const userRoutes = Router();

userRoutes.use(authorize(Role.ADMIN));
userRoutes.get('/', usersController.list);
userRoutes.post('/', validateBody(createUserSchema), usersController.create);
userRoutes.patch('/:id', validateBody(updateUserSchema), usersController.update);
userRoutes.patch('/:id/status', validateBody(updateUserStatusSchema), usersController.updateStatus);
