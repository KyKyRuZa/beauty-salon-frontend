import { z } from 'zod';

// Base validation schemas
export const emailSchema = z.string()
  .transform((val) => val?.trim())
  .pipe(z.string().email('Invalid email address'));
  
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');

export const phoneSchema = z.string()
  .regex(/^[+]?[1-9][0-9]{0,15}$/, 'Invalid phone number format');

export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Zа-яА-ЯёЁ\s\-(),.]+$/, 'Name contains invalid characters');

export const idSchema = z.number().int().positive();
export const optionalIdSchema = idSchema.optional();

export const booleanSchema = z.boolean();

export const stringSchema = z.string().min(1).max(255);

export const textSchema = z.string().max(1000);

// Date schemas
export const dateSchema = z.string().datetime();