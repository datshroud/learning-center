import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const asyncHandler =
  (handler: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, 'Không tìm thấy tài nguyên.'));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Dữ liệu không hợp lệ.',
      issues: error.issues
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message
    });
  }

  console.error(error);
  return res.status(500).json({
    message: 'Lỗi hệ thống.'
  });
};

