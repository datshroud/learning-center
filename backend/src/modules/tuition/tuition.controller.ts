import type { RequestHandler } from 'express';
import { asyncHandler } from '../../lib/errors.js';
import { tuitionService } from './tuition.service.js';

export const tuitionController = {
  list: asyncHandler(async (req, res) => {
    res.json(
      await tuitionService.list(
        req.user!,
        req.query.studentId?.toString(),
        req.query.status?.toString() as never
      )
    );
  }) as RequestHandler,

  pay: asyncHandler(async (req, res) => {
    res.status(201).json(await tuitionService.pay(req.params.id as string, req.body));
  }) as RequestHandler,

  getInvoice: asyncHandler(async (req, res) => {
    res.json(await tuitionService.getInvoice(req.user!, req.params.id as string));
  }) as RequestHandler
};
