import { object, string, number, boolean, union } from 'zod';
import { stringSchema, idSchema, booleanSchema } from './base';

const optionalStringSchema = string().max(255).optional();

// Catalog validation schemas
export const createCategorySchema = object({
  name: stringSchema,
  description: optionalStringSchema,
  isActive: booleanSchema,
});

export const updateCategorySchema = object({
  name: stringSchema.optional(),
  description: optionalStringSchema.optional(),
  isActive: booleanSchema.optional(),
});

export const createMasterServiceSchema = object({
  master_id: idSchema, // ID мастера (обязательно)
  salon_id: idSchema.optional(), // ID салона (опционально)
  category_id: idSchema.optional(), // ID категории услуги (опционально)
  name: string().min(2).max(255), // название услуги
  description: string().max(1000).optional(), // описание услуги
  price: union([number().min(0), string().regex(/^\d+(\.\d+)?$/)]), // цена услуги (число или строка)
  is_active: boolean().optional(), // активна ли услуга
});

export const updateMasterServiceSchema = object({
  master_id: idSchema.optional(), // ID мастера (опционально)
  salon_id: idSchema.optional(), // ID салона (опционально)
  category_id: idSchema.optional(), // ID категории услуги (опционально)
  name: string().min(2).max(255).optional(), // название услуги
  description: string().max(1000).optional(), // описание услуги
  price: union([number().min(0), string().regex(/^\d+(\.\d+)?$/)]).optional(), // цена услуги (число или строка)
  is_active: boolean().optional(), // активна ли услуга
});