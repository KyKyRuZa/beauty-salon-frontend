import { z } from 'zod';
import { optionalIdSchema } from './base';

// Схема для формы бронирования (старая форма - для совместимости)
export const appointmentSchema = z.object({
  name: z.string().min(2, "Имя должно содержать не менее 2 символов").max(100, "Имя не должно превышать 100 символов"),
  phone: z.string().regex(/^[+]?[1-9][\d\s()\-]{9,19}$/, "Некорректный номер телефона"),
  date: z.string().min(1, "Дата обязательна"),
  time: z.string().min(1, "Время обязательно"),
  master_id: optionalIdSchema,
  service_id: optionalIdSchema,
});

// Схема для логина
export const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Пароль обязателен"),
});

// Схема для регистрации администратора
export const adminRegisterSchema = z.object({
  email: z.string().email("Некорректный email").min(1, "Email обязателен"),
  phone: z.string().regex(/^[+]?[1-9][\d\s()\-]{9,19}$/, "Некорректный номер телефона"),
  first_name: z.string().min(2, "Имя должно содержать не менее 2 символов").max(100, "Имя не должно превышать 100 символов"),
  last_name: z.string().min(2, "Фамилия должна содержать не менее 2 символов").max(100, "Фамилия не должна превышать 100 символов"),
  password: z.string().min(6, "Пароль должен содержать не менее 6 символов"),
  confirmPassword: z.string().min(1, "Подтвердите пароль"),
  termsAccepted: z.boolean().refine(val => val === true, { message: "Необходимо принять условия политики конфиденциальности" })
}).refine(data => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"]
});