import type { RequestHandler } from 'express';
import { asyncHandler } from '../../lib/errors.js';
import { classesService } from './classes.service.js';

export const classesController = {
  list: asyncHandler(async (req, res) => {
    res.json(await classesService.list(req.user!, req.query.search?.toString()));
  }) as RequestHandler,

  get: asyncHandler(async (req, res) => {
    res.json(await classesService.get(req.params.id as string, req.user!));
  }) as RequestHandler,

  create: asyncHandler(async (req, res) => {
    res.status(201).json(await classesService.create(req.body));
  }) as RequestHandler,

  updateStatus: asyncHandler(async (req, res) => {
    res.json(await classesService.updateStatus(req.params.id as string, req.body.status));
  }) as RequestHandler,

  update: asyncHandler(async (req, res) => {
    res.json(await classesService.update(req.params.id as string, req.body));
  }) as RequestHandler,

  createAssignment: asyncHandler(async (req, res) => {
    res.status(201).json(await classesService.createAssignment(req.body));
  }) as RequestHandler
};
