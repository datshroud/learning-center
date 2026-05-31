import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string().min(2),
  capacity: z.coerce.number().int().positive(),
  location: z.string().optional()
});

export const createScheduleSchema = z.object({
  classRoomId: z.string().min(1),
  roomId: z.string().min(1),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/)
});

export const updateScheduleSchema = createScheduleSchema.partial();

export const createStudySessionSchema = z.object({
  classRoomId: z.string().min(1),
  sessionDate: z.string().min(1),
  topic: z.string().optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']).default('SCHEDULED')
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type CreateStudySessionInput = z.infer<typeof createStudySessionSchema>;

