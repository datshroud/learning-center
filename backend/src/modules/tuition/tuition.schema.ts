import { z } from 'zod';

export const payTuitionSchema = z.object({
  amount: z.coerce.number().positive(),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'CARD']),
  note: z.string().optional()
});

export type PayTuitionInput = z.infer<typeof payTuitionSchema>;

