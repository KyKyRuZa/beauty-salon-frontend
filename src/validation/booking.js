import { z } from 'zod';
import { idSchema, optionalIdSchema, dateSchema } from './base';

// Booking validation schemas
export const bookingSchema = z.object({
  id: idSchema,
  userId: idSchema,
  serviceId: idSchema,
  masterId: idSchema,
  bookingDate: dateSchema,
  startTime: z.string(),
  endTime: z.string(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  totalAmount: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().optional(),
});

export const createBookingSchema = z.object({
  serviceId: idSchema,
  bookingDate: dateSchema,
  startTime: z.string(),
  endTime: z.string(),
});

export const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
});

export const bookingFilterSchema = z.object({
  userId: optionalIdSchema,
  serviceId: optionalIdSchema,
  masterId: optionalIdSchema,
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
});