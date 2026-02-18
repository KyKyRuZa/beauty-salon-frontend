import { z } from 'zod';
import { stringSchema, optionalStringSchema, textSchema, idSchema, optionalIdSchema, booleanSchema, dateSchema } from './base';

// Catalog validation schemas
export const serviceSchema = z.object({
  id: optionalIdSchema,
  title: stringSchema,
  description: textSchema,
  price: z.number().min(0),
  duration: z.number().min(0), // in minutes
  categoryId: idSchema,
  providerId: idSchema,
  isActive: booleanSchema,
  image: optionalStringSchema,
});

export const categorySchema = z.object({
  id: optionalIdSchema,
  name: stringSchema,
  description: optionalStringSchema,
  isActive: booleanSchema,
});

export const bookingSchema = z.object({
  id: optionalIdSchema,
  userId: idSchema,
  serviceId: idSchema,
  providerId: idSchema,
  bookingDate: dateSchema,
  startTime: stringSchema, // время в формате HH:mm
  endTime: stringSchema,   // время в формате HH:mm
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  notes: optionalStringSchema,
});

export const createCategorySchema = z.object({
  name: stringSchema,
  description: optionalStringSchema,
  isActive: booleanSchema,
});

export const updateCategorySchema = z.object({
  name: stringSchema.optional(),
  description: optionalStringSchema.optional(),
  isActive: booleanSchema.optional(),
});

export const createServiceSchema = z.object({
  title: stringSchema,
  description: textSchema,
  price: z.number().min(0),
  duration: z.number().min(0), // in minutes
  categoryId: idSchema,
  providerId: idSchema,
  isActive: booleanSchema,
  image: optionalStringSchema,
});

export const updateServiceSchema = z.object({
  title: stringSchema.optional(),
  description: textSchema.optional(),
  price: z.number().min(0).optional(),
  duration: z.number().min(0).optional(), // in minutes
  categoryId: idSchema.optional(),
  providerId: idSchema.optional(),
  isActive: booleanSchema.optional(),
  image: optionalStringSchema.optional(),
});

export const createMasterServiceSchema = z.object({
  master_id: idSchema, // ID мастера (обязательно)
  salon_id: optionalIdSchema, // ID салона (опционально)
  category_id: optionalIdSchema, // ID категории услуги (опционально)
  name: z.string().min(2).max(255), // название услуги
  description: z.string().max(1000).optional(), // описание услуги
  price: z.union([z.number().min(0), z.string().regex(/^\d+(\.\d+)?$/)]), // цена услуги (число или строка)
  is_active: z.boolean().optional(), // активна ли услуга
});

export const updateMasterServiceSchema = z.object({
  master_id: optionalIdSchema, // ID мастера (опционально)
  salon_id: optionalIdSchema, // ID салона (опционально)
  category_id: optionalIdSchema, // ID категории услуги (опционально)
  name: z.string().min(2).max(255).optional(), // название услуги
  description: z.string().max(1000).optional(), // описание услуги
  price: z.union([z.number().min(0), z.string().regex(/^\d+(\.\d+)?$/)]).optional(), // цена услуги (число или строка)
  is_active: z.boolean().optional(), // активна ли услуга
});