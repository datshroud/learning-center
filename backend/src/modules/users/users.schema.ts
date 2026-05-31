import { z } from 'zod';

export const roleSchema = z.enum(['ADMIN', 'STAFF', 'TEACHER', 'STUDENT']);
export const userStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'LOCKED']);

export const createUserSchema = z.object({
  fullName: z.string().min(2),
  username: z.string().min(3),
  password: z.string().min(6).optional(),
  role: roleSchema,
  phone: z.string().optional(),
  email: z.string().email().optional(),
  student: z
    .object({
      studentCode: z.string().min(2),
      dateOfBirth: z.string().optional(),
      address: z.string().optional(),
      school: z.string().optional()
    })
    .optional(),
  teacher: z
    .object({
      teacherCode: z.string().min(2),
      specialization: z.string().optional(),
      qualification: z.string().optional()
    })
    .optional(),
  staff: z
    .object({
      staffCode: z.string().min(2),
      position: z.string().optional()
    })
    .optional()
});

export const updateUserSchema = createUserSchema.partial().omit({
  password: true,
  role: true,
  student: true,
  teacher: true,
  staff: true
});

export const updateUserStatusSchema = z.object({
  status: userStatusSchema
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

