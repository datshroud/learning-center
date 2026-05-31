import { z } from 'zod';

export const createStudentSchema = z.object({
  fullName: z.string().min(2),
  username: z.string().min(3),
  password: z.string().min(6).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'LOCKED']).optional(),
  customerRole: z.enum(['STUDENT', 'PARENT']).default('STUDENT'),
  studentCode: z.string().min(2),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  school: z.string().optional(),
  parents: z
    .array(
      z.object({
        fullName: z.string().min(2),
        phone: z.string().min(6),
        email: z.string().email().optional(),
        relationship: z.string().min(1)
      })
    )
    .default([])
});

export const updateStudentSchema = createStudentSchema.partial().omit({
  username: true,
  password: true,
  studentCode: true,
  parents: true
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
