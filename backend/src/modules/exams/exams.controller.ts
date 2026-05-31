import type { RequestHandler } from 'express';
import { asyncHandler } from '../../lib/errors.js';
import { examsService } from './exams.service.js';

export const examsController = {
  list: asyncHandler(async (req, res) => {
    res.json(await examsService.list(req.user!, req.query.classRoomId?.toString()));
  }) as RequestHandler,

  create: asyncHandler(async (req, res) => {
    res.status(201).json(await examsService.create(req.user!, req.body));
  }) as RequestHandler,

  listScores: asyncHandler(async (req, res) => {
    res.json(
      await examsService.listScores(
        req.user!,
        req.query.examId?.toString(),
        req.query.studentId?.toString()
      )
    );
  }) as RequestHandler,

  createScore: asyncHandler(async (req, res) => {
    res.status(201).json(await examsService.createScore(req.user!, req.body));
  }) as RequestHandler,

  updateScore: asyncHandler(async (req, res) => {
    res.json(await examsService.updateScore(req.user!, req.params.id as string, req.body));
  }) as RequestHandler
};
