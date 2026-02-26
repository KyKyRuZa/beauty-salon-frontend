import { z } from 'zod';
import { emailSchema, passwordSchema, nameSchema } from './base';

const baseRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  phone: z.string(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  }),
});

const userRegisterSchema = baseRegisterSchema.extend({
  firstName: nameSchema,
  lastName: nameSchema,
});

const masterRegisterSchema = baseRegisterSchema.extend({
  firstName: nameSchema,
  lastName: nameSchema,
  specialization: z.string().min(1, 'Specialization is required'),
});

const salonRegisterSchema = baseRegisterSchema.extend({
  salonName: z.string().min(1, 'Salon name is required'),
  address: z.string().min(1, 'Address is required'),
  inn: z.string().min(10, 'INN must be at least 10 digits').max(12, 'INN must be at most 12 digits'),
});

export const getRegisterSchema = (type) => {
  switch (type) {
    case 'user':
      return userRegisterSchema;
    case 'master':
      return masterRegisterSchema;
    case 'salon':
      return salonRegisterSchema;
    default:
      return userRegisterSchema;
  }
};

// Экспорт общего регистрационного схемы (для совместимости)
export const registerSchema = userRegisterSchema;

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Пароли не совпадают",
  path: ["confirmNewPassword"],
});