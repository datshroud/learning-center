import { z } from 'zod';

export const createExamSchema = z.object({
  classRoomId: z.string().min(1),
  name: z.string().min(2),
  examDate: z.string().min(1),
  maxScore: z.coerce.number().positive()
});

export const createScoreSchema = z.object({
  examId: z.string().min(1),
  studentId: z.string().min(1),
  value: z.coerce.number().min(0),
  comment: z.string().optional()
});

export const updateScoreSchema = z.object({
  value: z.coerce.number().min(0).optional(),
  comment: z.string().optional()
});

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type CreateScoreInput = z.infer<typeof createScoreSchema>;
export type UpdateScoreInput = z.infer<typeof updateScoreSchema>;

