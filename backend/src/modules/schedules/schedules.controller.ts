import type { RequestHandler } from 'express';
import { asyncHandler } from '../../lib/errors.js';
import { schedulesService } from './schedules.service.js';

export const schedulesController = {
  listRooms: asyncHandler(async (_req, res) => {
    res.json(await schedulesService.listRooms());
  }) as RequestHandler,

  createRoom: asyncHandler(async (req, res) => {
    res.status(201).json(await schedulesService.createRoom(req.body));
  }) as RequestHandler,

  listSchedules: asyncHandler(async (req, res) => {
    res.json(await schedulesService.listSchedules(req.user!, req.query.classRoomId?.toString()));
  }) as RequestHandler,

  createSchedule: asyncHandler(async (req, res) => {
    res.status(201).json(await schedulesService.createSchedule(req.body));
  }) as RequestHandler,

  updateSchedule: asyncHandler(async (req, res) => {
    res.json(await schedulesService.updateSchedule(req.params.id as string, req.body));
  }) as RequestHandler,

  listStudySessions: asyncHandler(async (req, res) => {
    res.json(await schedulesService.listStudySessions(req.user!, req.query.classRoomId?.toString()));
  }) as RequestHandler,

  createStudySession: asyncHandler(async (req, res) => {
    res.status(201).json(await schedulesService.createStudySession(req.body));
  }) as RequestHandler
};
