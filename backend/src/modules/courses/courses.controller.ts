import type { RequestHandler } from 'express';
import { asyncHandler } from '../../lib/errors.js';
import { coursesService } from './courses.service.js';

export const coursesController = {
  listSubjects: asyncHandler(async (_req, res) => {
    res.json(await coursesService.listSubjects());
  }) as RequestHandler,

  createSubject: asyncHandler(async (req, res) => {
    res.status(201).json(await coursesService.createSubject(req.body));
  }) as RequestHandler,

  updateSubject: asyncHandler(async (req, res) => {
    res.json(await coursesService.updateSubject(req.params.id as string, req.body));
  }) as RequestHandler,

  listCourses: asyncHandler(async (req, res) => {
    res.json(await coursesService.listCourses(req.query.search?.toString()));
  }) as RequestHandler,

  createCourse: asyncHandler(async (req, res) => {
    res.status(201).json(await coursesService.createCourse(req.body));
  }) as RequestHandler,

  updateCourse: asyncHandler(async (req, res) => {
    res.json(await coursesService.updateCourse(req.params.id as string, req.body));
  }) as RequestHandler
};
