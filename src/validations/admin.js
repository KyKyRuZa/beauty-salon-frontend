import { object, string, boolean, enum as enumType } from 'zod';
import { emailSchema, passwordSchema, nameSchema } from './base';

export const adminRegisterSchema = object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: string(),
  first_name: nameSchema,
  last_name: nameSchema,
  phone: string().min(10, 'Введите корректный номер телефона'),
  termsAccepted: boolean().transform((val) => val === true).refine(
    (val) => val === true,
    { message: 'Необходимо принять условия политики конфиденциальности' }
  ),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

export const adminLoginSchema = object({
  email: emailSchema,
  password: passwordSchema,
});

export const adminUpdateSchema = object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: string().optional(),
  role: enumType(['admin']).optional(),
});