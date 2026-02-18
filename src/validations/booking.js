import { z } from 'zod';
import { idSchema, optionalIdSchema, dateSchema } from './base';

// Booking validation schemas
export const bookingSchema = z.object({
  id: idSchema,
  userId: idSchema,
  serviceId: idSchema,
  masterId: idSchema,
  masterServiceId: optionalIdSchema, // ID услуги мастера
  bookingDate: dateSchema,
  startTime: z.string(),
  endTime: z.string(),
  status: z.enum(['confirmed', 'cancelled', 'completed']),
  totalAmount: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().optional(),
});

export const createBookingSchema = z.object({
  masterId: idSchema,
  masterServiceId: idSchema, // ID услуги мастера (обязательно)
  timeSlotId: optionalIdSchema, // ID временного слота (опционально)
  bookingDate: dateSchema,
  startTime: z.string(),
  endTime: z.string(),
  comment: z.string().max(500).optional(),
});

export const updateBookingSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'completed']).optional(),
  comment: z.string().max(500).optional(),
});

export const bookingFilterSchema = z.object({
  userId: optionalIdSchema,
  serviceId: optionalIdSchema,
  masterId: optionalIdSchema,
  masterServiceId: optionalIdSchema,
  status: z.enum(['confirmed', 'cancelled', 'completed']).optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
});

export const availableSlotsSchema = z.object({
  masterId: idSchema,
  date: dateSchema,
  serviceId: optionalIdSchema, // ID услуги для фильтрации слотов
});