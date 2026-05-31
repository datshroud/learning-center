import type { RequestHandler } from 'express';
import { asyncHandler } from '../../lib/errors.js';
import { teachersService } from './teachers.service.js';

export const teachersController = {
  list: asyncHandler(async (req, res) => {
    const teachers = await teachersService.list(req.query.search?.toString());
    res.json(teachers);
  }) as RequestHandler,

  create: asyncHandler(async (req, res) => {
    const teacher = await teachersService.create(req.body);
    res.status(201).json(teacher);
  }) as RequestHandler,

  update: asyncHandler(async (req, res) => {
    const teacher = await teachersService.update(req.params.id as string, req.body);
    res.json(teacher);
  }) as RequestHandler
};
