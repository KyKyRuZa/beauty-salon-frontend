import { object, string, boolean } from 'zod';
import { optionalIdSchema } from './base';

// Схема для формы бронирования (старая форма - для совместимости)
export const appointmentSchema = object({
  name: string().min(2, "Имя должно содержать не менее 2 символов").max(100, "Имя не должно превышать 100 символов"),
  phone: string().regex(/^[+]?[1-9][\d\s() -]{9,19}$/, "Некорректный номер телефона"),
  date: string().min(1, "Дата обязательна"),
  time: string().min(1, "Время обязательно"),
  master_id: optionalIdSchema,
  service_id: optionalIdSchema,
});

// Схема для регистрации администратора
export const adminRegisterSchema = object({
  email: string().email("Некорректный email").min(1, "Email обязателен"),
  phone: string().regex(/^[+]?[1-9][\d\s() -]{9,19}$/, "Некорректный номер телефона"),
  first_name: string().min(2, "Имя должно содержать не менее 2 символов").max(100, "Имя не должно превышать 100 символов"),
  last_name: string().min(2, "Фамилия должна содержать не менее 2 символов").max(100, "Фамилия не должна превышать 100 символов"),
  password: string().min(6, "Пароль должен содержать не менее 6 символов"),
  confirmPassword: string().min(1, "Подтвердите пароль"),
  termsAccepted: boolean().refine(val => val === true, { message: "Необходимо принять условия политики конфиденциальности" })
}).refine(data => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"]
});