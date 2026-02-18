import api from './api';
import { z } from 'zod';
import { createCategorySchema, updateCategorySchema, adminUpdateSchema } from '../validations';

// API для административных функций

// Получить статистику для дашборда
export const getDashboardStats = async () => {
  return await api.get('/admin/dashboard/stats');
};

// Получить список администраторов
export const getAllAdmins = async (params = {}) => {
  return await api.get('/admin/admins', { params });
};

// Получить профиль текущего администратора
export const getCurrentAdmin = async () => {
  return await api.get('/admin/profile');
};

// Обновить профиль текущего администратора
export const updateCurrentAdmin = async (adminData) => {
  try {
    // Валидация данных с помощью Zod
    const validatedData = adminUpdateSchema.parse(adminData);

    return await api.put('/admin/profile', validatedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors?.map?.(err => err.message).join(', ') || 'Validation error occurred');
    }
    throw error;
  }
};

// Создать нового администратора
export const createAdmin = async (adminData) => {
  return await api.post('/admin/admins', adminData);
};

// Получить список пользователей
export const getAllUsers = async (params = {}) => {
  return await api.get('/admin/users', { params });
};

// Получить список категорий услуг
export const getAllCategories = async (params = {}) => {
  return await api.get('/admin/categories', { params });
};

// Создать новую категорию
export const createCategory = async (categoryData) => {
  try {
    // Валидация данных с помощью Zod
    const validatedData = createCategorySchema.parse(categoryData);

    return await api.post('/admin/categories', validatedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors?.map?.(err => `${err.path.join('.')}: ${err.message}`).join('; ') || 'Validation error occurred');
    } else {
      throw new Error(error.message || 'Validation error occurred');
    }
  }
};

// Обновить категорию
export const updateCategory = async (id, categoryData) => {
  try {
    // Валидация данных с помощью Zod
    const validatedData = updateCategorySchema.parse(categoryData);

    return await api.put(`/admin/categories/${id}`, validatedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors?.map?.(err => err.message).join(', ') || 'Validation error occurred');
    }
    throw error;
  }
};

// Удалить категорию
export const deleteCategory = async (id) => {
  return await api.delete(`/admin/categories/${id}`);
};