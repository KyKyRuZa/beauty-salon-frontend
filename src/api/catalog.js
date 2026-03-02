import api from './api';
import { z } from 'zod';
import { createCategorySchema, updateCategorySchema, createMasterServiceSchema, updateMasterServiceSchema } from '../validations';
import { logger } from '../utils/logger';

// API для работы с каталогом услуг

// Получить все категории услуг
export const getCatalogCategories = async (params = {}) => {
  return await api.get('/catalog/categories', { params });
};

// Получить популярные категории услуг
// Удалено как неиспользуемое

// Получить категорию услуг по ID
export const getCategoryById = async (id) => {
  return await api.get(`/catalog/categories/${id}`);
};

// Создать новую категорию услуг (требуется аутентификация)
export const createCatalogCategory = async (categoryData) => {
  try {
    // Валидация данных с помощью Zod
    const validatedData = createCategorySchema.parse(categoryData);

    return await api.post('/catalog/categories', validatedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors?.map?.(err => err.message).join(', ') || 'Validation error occurred');
    }
    throw error;
  }
};

// Обновить категорию услуг (требуется аутентификация)
export const updateCatalogCategory = async (id, categoryData) => {
  try {
    // Валидация данных с помощью Zod
    const validatedData = updateCategorySchema.parse(categoryData);

    return await api.put(`/catalog/categories/${id}`, validatedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors?.map?.(err => err.message).join(', ') || 'Validation error occurred');
    }
    throw error;
  }
};

// Удалить категорию услуг (требуется аутентификация)
export const deleteCatalogCategory = async (id) => {
  return await api.delete(`/catalog/categories/${id}`);
};

// Получить все варианты услуг
export const getCatalogServices = async (params = {}) => {
  return await api.get('/catalog', { params });
};

// Получить варианты услуг по категории
export const getServicesByCategory = async (categoryId, params = {}) => {
  return await api.get(`/catalog/by-category/${categoryId}`, { params });
};

// Получить варианты услуги (остается без изменений, но теперь работает с вариациями)
export const getServiceVariations = async (serviceId, params = {}) => {
  return await api.get(`/catalog/variations/${serviceId}`, { params });
};

// Получить вариант услуги по ID
export const getCatalogServiceById = async (id) => {
  return await api.get(`/catalog/${id}`);
};

// Создать новый вариант услуги (требуется аутентификация)
// Удалено как неиспользуемое

// Обновить вариант услуги (требуется аутентификация)
// Удалено как неиспользуемое

// Удалить вариант услуги (требуется аутентификация)
// Удалено как неиспользуемое

// Создать вариант услуги для мастера (требуется аутентификация как мастер)
export const createMasterService = async (serviceData) => {
  try {
    // Подготовка данных для отправки, сохраняя исходные типы для валидации
    const submitData = {
      master_id: serviceData.master_id, // Добавляем master_id
      salon_id: serviceData.salon_id, // Добавляем salon_id если есть
      category_id: serviceData.category_id, // Добавляем category_id если есть
      name: serviceData.name,
      description: serviceData.description,
      price: serviceData.price,
      is_active: serviceData.is_active !== undefined ? serviceData.is_active : true, // По умолчанию активно
    };

    logger.debug('Creating master service:', submitData);

    // Валидация данных с помощью Zod
    const validatedData = createMasterServiceSchema.parse(submitData);

    return await api.post('/catalog/master/service', validatedData);
  } catch (error) {
    logger.error('Error in createMasterService:', error.message);
    if (error instanceof z.ZodError) {
      throw new Error(error.errors?.map?.(err => err.message).join(', ') || 'Validation error occurred');
    }
    throw error;
  }
};

// Получить варианты услуг мастера (требуется аутентификация как мастер)
export const getMasterServices = async (params = {}) => {
  return await api.get('/catalog/master/services', { params });
};

// Обновить вариант услуги мастера (требуется аутентификация как мастер)
export const updateMasterService = async (id, serviceData) => {
  try {
    // Подготовка данных для отправки, сохраняя исходные типы для валидации
    const submitData = {
      master_id: serviceData.master_id, // Добавляем master_id если есть
      salon_id: serviceData.salon_id, // Добавляем salon_id если есть
      category_id: serviceData.category_id, // Добавляем category_id если есть
      name: serviceData.name,
      description: serviceData.description,
      price: serviceData.price,
      is_active: serviceData.is_active,
    };

    logger.debug('Updating master service:', submitData);

    // Валидация данных с помощью Zod
    const validatedData = updateMasterServiceSchema.parse(submitData);

    return await api.put(`/catalog/master/service/${id}`, validatedData);
  } catch (error) {
    logger.error('Error in updateMasterService:', error.message);
    if (error instanceof z.ZodError) {
      throw new Error(error.errors?.map?.(err => err.message).join(', ') || 'Validation error occurred');
    }
    throw error;
  }
};

// Удалить вариант услуги мастера (требуется аутентификация как мастер)
export const deleteMasterService = async (id) => {
  return await api.delete(`/catalog/master/service/${id}`);
};

// Создать вариант услуги для салона (требуется аутентификация как салон)
export const createSalonService = async (serviceData) => {
  try {
    // Подготовка данных для отправки, сохраняя исходные типы для валидации
    const submitData = {
      master_id: serviceData.master_id, // Добавляем master_id если есть
      salon_id: serviceData.salon_id, // Добавляем salon_id
      category_id: serviceData.category_id, // Добавляем category_id если есть
      name: serviceData.name,
      description: serviceData.description,
      price: serviceData.price,
      is_active: serviceData.is_active !== undefined ? serviceData.is_active : true, // По умолчанию активно
    };

    logger.debug('Creating salon service:', submitData);

    // Валидация данных с помощью Zod
    const validatedData = createMasterServiceSchema.parse(submitData);

    return await api.post('/catalog/salon/service', validatedData);
  } catch (error) {
    logger.error('Error in createSalonService:', error.message);
    if (error instanceof z.ZodError) {
      throw new Error(error.errors?.map?.(err => err.message).join(', ') || 'Validation error occurred');
    }
    throw error;
  }
};

// Получить варианты услуг салона (требуется аутентификация как салон)
export const getSalonServices = async (params = {}) => {
  return await api.get('/catalog/salon/services', { params });
};

// Обновить вариант услуги салона (требуется аутентификация как салон)
export const updateSalonService = async (id, serviceData) => {
  try {
    // Подготовка данных для отправки, сохраняя исходные типы для валидации
    const submitData = {
      master_id: serviceData.master_id, // Добавляем master_id если есть
      salon_id: serviceData.salon_id, // Добавляем salon_id
      category_id: serviceData.category_id, // Добавляем category_id если есть
      name: serviceData.name,
      description: serviceData.description,
      price: serviceData.price,
      is_active: serviceData.is_active,
    };

    logger.debug('Updating salon service:', submitData);

    // Валидация данных с помощью Zod
    const validatedData = updateMasterServiceSchema.parse(submitData);

    return await api.put(`/catalog/salon/service/${id}`, validatedData);
  } catch (error) {
    logger.error('Error in updateSalonService:', error.message);
    if (error instanceof z.ZodError) {
      throw new Error(error.errors?.map?.(err => err.message).join(', ') || 'Validation error occurred');
    }
    throw error;
  }
};

// Удалить вариант услуги салона (требуется аутентификация как салон)
export const deleteSalonService = async (id) => {
  return await api.delete(`/catalog/salon/service/${id}`);
};

// Получить мастеров, предоставляющих определенную услугу
// Удалено как неиспользуемое

// ============================================
// Поиск с использованием триграмм (GIN-индекс)
// ============================================

/**
 * Поиск категорий с использованием триграмм
 * @param {string} query - Поисковый запрос
 */
export const searchCategories = async (query) => {
  const response = await api.get('/catalog/search/categories', { params: { q: query } });
  return response.data;
};

/**
 * Поиск услуг мастеров с использованием триграмм
 * @param {string} query - Поисковый запрос
 */
// Удалено как неиспользуемое

/**
 * Поиск мастеров с использованием триграмм
 * @param {string} query - Поисковый запрос
 */
// Удалено как неиспользуемое