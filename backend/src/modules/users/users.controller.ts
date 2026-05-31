import type { RequestHandler } from 'express';
import { asyncHandler } from '../../lib/errors.js';
import { usersService } from './users.service.js';

export const usersController = {
  list: asyncHandler(async (req, res) => {
    const users = await usersService.list(req.query.search?.toString());
    res.json(users);
  }) as RequestHandler,

  create: asyncHandler(async (req, res) => {
    const user = await usersService.create(req.body);
    res.status(201).json(user);
  }) as RequestHandler,

  update: asyncHandler(async (req, res) => {
    const user = await usersService.update(req.params.id as string, req.body);
    res.json(user);
  }) as RequestHandler,

  updateStatus: asyncHandler(async (req, res) => {
    const user = await usersService.updateStatus(req.params.id as string, req.body.status);
    res.json(user);
  }) as RequestHandler
};
