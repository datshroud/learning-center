import { z } from 'zod';

export const createEnrollmentSchema = z.object({
  studentId: z.string().min(1),
  classRoomId: z.string().min(1)
});

export const updateEnrollmentStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'CANCELLED', 'COMPLETED'])
});

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type UpdateEnrollmentStatusInput = z.infer<typeof updateEnrollmentStatusSchema>;
