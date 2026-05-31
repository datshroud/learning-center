import type { RequestHandler } from 'express';
import { asyncHandler } from '../../lib/errors.js';
import { studentsService } from './students.service.js';

export const studentsController = {
  list: asyncHandler(async (req, res) => {
    const students = await studentsService.list(
      req.user!,
      req.query.search?.toString(),
      req.query.classRoomId?.toString()
    );
    res.json(students);
  }) as RequestHandler,

  get: asyncHandler(async (req, res) => {
    const student = await studentsService.get(req.params.id as string, req.user!);
    res.json(student);
  }) as RequestHandler,

  create: asyncHandler(async (req, res) => {
    const student = await studentsService.create(req.body);
    res.status(201).json(student);
  }) as RequestHandler,

  update: asyncHandler(async (req, res) => {
    const student = await studentsService.update(req.params.id as string, req.body);
    res.json(student);
  }) as RequestHandler
};
