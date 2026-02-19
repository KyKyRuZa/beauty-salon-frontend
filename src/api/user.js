import api from './api';
import { z } from 'zod';

class UserService {
  // Получение профиля текущего пользователя
  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      // response.data - это { success: true, data: { user: ..., profile: ... } }
      // возвращаем только внутренний data
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Обновление профиля пользователя
  async updateProfile(profileData) {
    try {
      // Создаем FormData для отправки данных
      const formData = new FormData();
      
      // Добавляем все данные в formData
      for (const [key, value] of Object.entries(profileData)) {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      }
      
      const response = await api.put('/auth/edit-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(error.errors?.map?.(err => err.message).join(', ') || 'Validation error occurred');
      }
      throw error.response?.data || error;
    }
  }
  // Получение данных мастера по ID
  async getMasterById(masterId) {
    try {
      const response = await api.get(`/providers/master/${masterId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Получение данных салона по ID
  async getSalonById(salonId) {
    try {
      const response = await api.get(`/providers/salon/${salonId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

export default new UserService();