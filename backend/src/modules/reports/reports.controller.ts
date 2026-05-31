import type { RequestHandler } from 'express';
import { asyncHandler } from '../../lib/errors.js';
import { reportsService } from './reports.service.js';

export const reportsController = {
  dashboard: asyncHandler(async (_req, res) => {
    res.json(await reportsService.dashboard());
  }) as RequestHandler,

  revenue: asyncHandler(async (_req, res) => {
    res.json(await reportsService.revenue());
  }) as RequestHandler,

  attendance: asyncHandler(async (_req, res) => {
    res.json(await reportsService.attendance());
  }) as RequestHandler,

  learningResults: asyncHandler(async (_req, res) => {
    res.json(await reportsService.learningResults());
  }) as RequestHandler,

  analytics: asyncHandler(async (req, res) => {
    const metric = req.params.metric as never;
    const period = (req.query.period?.toString() || 'month') as never;
    res.json(await reportsService.analytics(metric, period));
  }) as RequestHandler
};
