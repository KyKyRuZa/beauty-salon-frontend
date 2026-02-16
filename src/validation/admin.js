import { z } from 'zod';
import { emailSchema, passwordSchema, nameSchema } from './base';

// Admin validation schemas
export const adminRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: nameSchema,
  lastName: nameSchema,
  phone: z.string(),
  role: z.enum(['admin', 'superadmin']),
});

export const adminLoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const adminUpdateSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'superadmin']).optional(),
});