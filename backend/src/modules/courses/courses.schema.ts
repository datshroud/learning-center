import { z } from 'zod';

export const createSubjectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional()
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const createCourseSchema = z.object({
  subjectId: z.string().min(1),
  name: z.string().min(2),
  grade: z.coerce.number().int().min(1).max(12),
  tuitionFee: z.coerce.number().positive(),
  numberOfSessions: z.coerce.number().int().positive(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export const updateCourseSchema = createCourseSchema.partial();

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;

