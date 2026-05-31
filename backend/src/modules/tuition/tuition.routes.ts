import { Router } from 'express';
import { authorize } from '../../middleware/auth.js';
import { Role } from '../../lib/enums.js';
import { validateBody } from '../../middleware/validate.js';
import { tuitionController } from './tuition.controller.js';
import { payTuitionSchema } from './tuition.schema.js';

export const tuitionRoutes = Router();

tuitionRoutes.get('/tuition', authorize(Role.ADMIN, Role.STAFF, Role.STUDENT), tuitionController.list);
tuitionRoutes.post('/tuition/:id/pay', authorize(Role.ADMIN, Role.STAFF), validateBody(payTuitionSchema), tuitionController.pay);
tuitionRoutes.get('/invoices/:id', authorize(Role.ADMIN, Role.STAFF, Role.STUDENT), tuitionController.getInvoice);
