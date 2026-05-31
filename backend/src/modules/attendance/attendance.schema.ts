import { z } from 'zod';

export const saveAttendanceSchema = z.object({
  studySessionId: z.string().min(1),
  details: z.array(
    z.object({
      studentId: z.string().min(1),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE']),
      note: z.string().optional()
    })
  )
});

export type SaveAttendanceInput = z.infer<typeof saveAttendanceSchema>;

