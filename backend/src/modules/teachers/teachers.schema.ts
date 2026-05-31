import { z } from 'zod';

export const createTeacherSchema = z.object({
  fullName: z.string().min(2),
  username: z.string().min(3),
  password: z.string().min(6).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  teacherCode: z.string().min(2),
  specialization: z.string().optional(),
  qualification: z.string().optional()
});

export const updateTeacherSchema = createTeacherSchema.partial().omit({
  username: true,
  password: true,
  teacherCode: true
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;

