import { z } from 'zod';
import { differenceInYears } from 'date-fns';

export const PreAppSchema = z.object({
  requestorName: z
    .string()
    .min(2)
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/, 'Invalid name'),
  dob: z
    .string()
    .refine(
      (d) => differenceInYears(new Date(), new Date(d)) >= 18,
      'Must be 18+'
    ),
  businessName: z.string().min(2),
  type: z.enum(['Business', 'Event', 'Freelancer']),
  description: z.string().min(20),
  location: z.string().min(1),
  budget: z.number().int().min(1),
  category: z.enum([
    'Food',
    'Alcohol',
    'Entertainment',
    'Services',
    'Security',
    'Transportation',
  ]),
});
