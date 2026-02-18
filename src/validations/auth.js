import { z } from 'zod';
import { emailSchema, passwordSchema, nameSchema } from './base';

// Auth validation schemas
export const baseRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  phone: z.string(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  }),
});

export const userRegisterSchema = baseRegisterSchema.extend({
  firstName: nameSchema,
  lastName: nameSchema,
});

export const masterRegisterSchema = baseRegisterSchema.extend({
  firstName: nameSchema,
  lastName: nameSchema,
  specialization: z.string().min(1, 'Specialization is required'),
});

export const salonRegisterSchema = baseRegisterSchema.extend({
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

export const profileEditSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: z.string().optional(),
  email: emailSchema.optional(),
  avatar: z.any().optional(), // Используем z.any() для файлов, так как они могут быть проблематичны для валидации в форме
  // Поля для салона
  name: z.string().optional(), // Для салонов - это название салона
  salonName: z.string().optional(), // Альтернативное поле для названия салона
  address: z.string().optional(),
  inn: z.string().optional(),
  description: z.string().optional(),
  // Поля для мастера
  specialization: z.string().optional(),
  experience: z.number().min(0).max(50).optional(),
  // Поля для изменения пароля (не входят в основную схему редактирования профиля)
}).passthrough(); // Разрешаем передачу дополнительных полей

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Пароли не совпадают",
  path: ["confirmNewPassword"],
});