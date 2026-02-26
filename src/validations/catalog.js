import { z } from 'zod';
import { stringSchema, idSchema, booleanSchema } from './base';

const optionalStringSchema = z.string().max(255).optional();

// Catalog validation schemas
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

export const createMasterServiceSchema = z.object({
  master_id: idSchema, // ID мастера (обязательно)
  salon_id: idSchema.optional(), // ID салона (опционально)
  category_id: idSchema.optional(), // ID категории услуги (опционально)
  name: z.string().min(2).max(255), // название услуги
  description: z.string().max(1000).optional(), // описание услуги
  price: z.union([z.number().min(0), z.string().regex(/^\d+(\.\d+)?$/)]), // цена услуги (число или строка)
  is_active: z.boolean().optional(), // активна ли услуга
});

export const updateMasterServiceSchema = z.object({
  master_id: idSchema.optional(), // ID мастера (опционально)
  salon_id: idSchema.optional(), // ID салона (опционально)
  category_id: idSchema.optional(), // ID категории услуги (опционально)
  name: z.string().min(2).max(255).optional(), // название услуги
  description: z.string().max(1000).optional(), // описание услуги
  price: z.union([z.number().min(0), z.string().regex(/^\d+(\.\d+)?$/)]).optional(), // цена услуги (число или строка)
  is_active: z.boolean().optional(), // активна ли услуга
});