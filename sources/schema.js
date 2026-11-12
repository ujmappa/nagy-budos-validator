import { z } from 'zod';

// Intentionally entirely server-side. Never expose this schema to the browser.
const realDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const submissionSchema = z.strictObject({
  f0: z.string().trim().min(5),
  f1: z
    .string()
    .regex(/^\d+$/)
    .refine((value) => Number(value) >= 10 && Number(value) <= 99),
  f2: z.string().regex(/^[a-z]{3}$/),
  f3: z.email(),
  f4: z.literal('42'),
  f5: z.string().regex(/^[A-Z]{2}\d{3}$/),
  f6: z.string().min(8).regex(/[A-Z]/).regex(/\d/),
  f7: z.literal('igen'),
  f8: z.string().refine(realDate),
});
