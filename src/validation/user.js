import { z } from 'zod';
import { emailSchema, nameSchema, phoneSchema, idSchema, booleanSchema, optionalStringSchema } from './base';

// User validation schemas
export const userSchema = z.object({
  id: idSchema,
  email: emailSchema,
  firstName: nameSchema,
  lastName: nameSchema.optional(),
  phone: phoneSchema.optional(),
  role: z.enum(['client', 'master', 'salon', 'admin']),
  isActive: booleanSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().optional(),
});

export const createUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
  firstName: nameSchema,
  lastName: nameSchema.optional(),
  phone: phoneSchema.optional(),
  role: z.enum(['client', 'master', 'salon']),
  isActive: booleanSchema.optional(),
});

export const updateUserSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: phoneSchema.optional(),
  isActive: booleanSchema.optional(),
  avatar: z.any().optional(), // Используем z.any() для файлов, так как они могут быть проблематичны для валидации в форме
}).passthrough(); // Разрешаем передачу дополнительных полей

export const userFilterSchema = z.object({
  role: z.enum(['client', 'master', 'salon', 'admin']).optional(),
  isActive: booleanSchema.optional(),
  search: optionalStringSchema,
});