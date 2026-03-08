import { string, number, boolean } from 'zod';

// Base validation schemas
export const emailSchema = string()
  .transform((val) => val?.trim())
  .pipe(string().email('Invalid email address'));

export const passwordSchema = string()
  .min(8, 'Пароль должен содержать не менее 8 символов')
  .max(100, 'Пароль должен содержать не более 100 символов')
  .regex(/^(?=.*[a-zа-яА-ЯёЁ])(?=.*[A-ZА-ЯЁ])(?=.*[0-9])/, 'Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву и одну цифру');

export const phoneSchema = string().min(1, 'Номер телефона обязателен');

export const nameSchema = string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Zа-яА-ЯёЁ\s\-(),.]+$/, 'Name contains invalid characters');

export const idSchema = number().int().positive();
export const optionalIdSchema = idSchema.optional();

export const booleanSchema = boolean();

export const stringSchema = string().min(1).max(255);

export const textSchema = string().max(1000);

// Date schemas
export const dateSchema = string().datetime();