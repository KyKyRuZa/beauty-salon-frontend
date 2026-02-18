import { z } from 'zod';
import { emailSchema, passwordSchema, nameSchema } from './base';

// Admin validation schemas
export const adminRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  first_name: nameSchema,
  last_name: nameSchema,
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  termsAccepted: z.boolean().transform((val) => val === true).refine(
    (val) => val === true,
    { message: 'Необходимо принять условия политики конфиденциальности' }
  ),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
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