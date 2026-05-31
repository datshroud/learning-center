import { z } from 'zod';

export const classStatusSchema = z.enum([
  'NOT_OPENED',
  'ENROLLING',
  'ACTIVE',
  'POSTPONED',
  'FINISHED',
  'CANCELLED'
]);

export const createClassSchema = z.object({
  courseId: z.string().min(1),
  name: z.string().min(2),
  maxStudents: z.coerce.number().int().positive(),
  status: classStatusSchema.default('NOT_OPENED'),
  roomIds: z.array(z.string().min(1)).optional().default([]),
  note: z.string().optional()
});

export const updateClassStatusSchema = z.object({
  status: classStatusSchema
});

export const updateClassSchema = z.object({
  courseId: z.string().min(1).optional(),
  name: z.string().min(2).optional(),
  maxStudents: z.coerce.number().int().positive().optional(),
  status: classStatusSchema.optional(),
  roomIds: z.array(z.string().min(1)).optional(),
  note: z.string().optional()
});

export const createTeachingAssignmentSchema = z.object({
  teacherId: z.string().min(1),
  classRoomId: z.string().min(1),
  role: z.string().optional()
});

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type CreateTeachingAssignmentInput = z.infer<typeof createTeachingAssignmentSchema>;
