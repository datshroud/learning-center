import type { RequestHandler } from 'express';
import { asyncHandler } from '../../lib/errors.js';
import { enrollmentsService } from './enrollments.service.js';

export const enrollmentsController = {
  list: asyncHandler(async (req, res) => {
    res.json(
      await enrollmentsService.list({
        studentId: req.query.studentId?.toString(),
        classRoomId: req.query.classRoomId?.toString()
      })
    );
  }) as RequestHandler,

  create: asyncHandler(async (req, res) => {
    res.status(201).json(await enrollmentsService.create(req.body));
  }) as RequestHandler,

  updateStatus: asyncHandler(async (req, res) => {
    res.json(await enrollmentsService.updateStatus(req.params.id as string, req.body.status));
  }) as RequestHandler
};
