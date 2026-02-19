import api from './api'
import { z } from 'zod';
import { registerSchema, loginSchema, adminRegisterSchema, adminLoginSchema } from '../validations';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token') || null;
    const userStr = localStorage.getItem('user');
    this.user = userStr && userStr !== 'undefined' ? JSON.parse(userStr) : null;
    // Добавляем свойство для хранения полного профиля
    this.profileData = null;
  }

  // Вход пользователя
  async login(credentials) {
    try {
      // Валидация данных с помощью Zod
      const validatedCredentials = loginSchema.parse(credentials);

      const { data } = await api.post('/auth/login', validatedCredentials)
      this.setAuthData(data)
      this.emitAuthChange() // Уведомляем об изменении
      return { success: true, data }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors?.map?.(err => err.message).join(', ') || 'Validation error occurred'
        };
      }
      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          error: error.response.data?.message || error.response.data?.error || 'Login failed'
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          error: 'Network error: No response from server'
        };
      } else {
        // Something else happened
        return {
          success: false,
          error: error.message || 'Login failed'
        };
      }
    }
  }

  // Регистрация
  async register(userData) {
    try {
      // Валидация данных с помощью Zod
      const validatedData = registerSchema.parse(userData);

      const { data } = await api.post('/auth/register', validatedData)
      this.setAuthData(data)
      this.emitAuthChange() // Уведомляем об изменении
      return { success: true, data }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors?.map?.(err => err.message).join(', ') || 'Validation error occurred'
        };
      }
      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          error: error.response.data?.message || error.response.data?.error || 'Registration failed'
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          error: 'Network error: No response from server'
        };
      } else {
        // Something else happened
        return {
          success: false,
          error: error.message || 'Registration failed'
        };
      }
    }
  }

  // Выход
  logout() {
    this.clearAuth()
    this.emitAuthChange() // Уведомляем об изменении

    // Можно добавить редирект на главную
    if (window.location.pathname !== '/') {
      window.location.href = '/'
    }
  }

  // Изменение пароля
  async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return { success: true, message: response.data.message };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors?.map?.(err => err.message).join(', ') || 'Validation error occurred'
        };
      }
      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          error: error.response.data?.message || error.response.data?.error || 'Failed to change password'
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          error: 'Network error: No response from server'
        };
      } else {
        // Something else happened
        return {
          success: false,
          error: error.message || 'Failed to change password'
        };
      }
    }
  }

  // Получение профиля
  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      const profileData = response.data.data;

      // Убедимся, что profileData.user существует
      this.user = profileData?.user || null;
      this.profileData = profileData; // Сохраняем полные данные профиля

      if (profileData?.user) {
        localStorage.setItem('user', JSON.stringify(profileData.user));
      }

      return { success: true, data: profileData };
    } catch (error) {
      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          error: error.response.data?.message || error.response.data?.error || 'Failed to get profile'
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          error: 'Network error: No response from server'
        };
      } else {
        // Something else happened
        return {
          success: false,
          error: error.message || 'Failed to get profile'
        };
      }
    }
  }

  // Обновление профиля
  async updateProfile(profileData) {
    try {
      let formDataToSend;

      // Если profileData уже является FormData, используем его напрямую
      if (profileData instanceof FormData) {
        formDataToSend = profileData;
      } else {
        // Создаем FormData для отправки данных
        const formData = new FormData();

        // Добавляем все данные в formData
        for (const [key, value] of Object.entries(profileData)) {
          if (value !== undefined && value !== null) {
            // Проверяем, является ли значение FileList
            if (value instanceof FileList) {
              // Если это FileList, извлекаем первый файл
              if (value.length > 0) {
                formData.append(key, value[0], value[0].name);
              }
            } else {
              formData.append(key, value);
            }
          }
        }

        formDataToSend = formData;
      }


      const response = await api.put('/auth/edit-profile', formDataToSend)
      const profileDataResponse = response.data.data; // Извлекаем полные данные из ответа

      this.user = profileDataResponse.user
      // Обновляем полные данные профиля
      if (this.profileData) {
        this.profileData.user = profileDataResponse.user;
        if (profileDataResponse.profile) {
          this.profileData.profile = profileDataResponse.profile;
        }
      }
      if (profileDataResponse.user) {
        localStorage.setItem('user', JSON.stringify(profileDataResponse.user))
      }
      this.emitAuthChange() // Уведомляем об изменении
      return { success: true, data: profileDataResponse }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors?.map?.(err => err.message).join(', ') || 'Validation error occurred'
        };
      }
      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          error: error.response.data?.message || error.response.data?.error || 'Failed to update profile'
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          error: 'Network error: No response from server'
        };
      } else {
        // Something else happened
        return {
          success: false,
          error: error.message || 'Failed to update profile'
        };
      }
    }
  }

  // Вход администратора
  async adminLogin(credentials) {
    try {
      // Валидация данных с помощью Zod
      const validatedCredentials = adminLoginSchema.parse(credentials);

      const { data } = await api.post('/auth/admin/login', validatedCredentials)
      this.setAuthData(data)
      this.emitAuthChange() // Уведомляем об изменении
      return { success: true, data }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors?.map?.(err => err.message).join(', ') || 'Validation error occurred'
        };
      }
      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          error: error.response.data?.message || error.response.data?.error || 'Admin login failed'
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          error: 'Network error: No response from server'
        };
      } else {
        // Something else happened
        return {
          success: false,
          error: error.message || 'Admin login failed'
        };
      }
    }
  }

  // Регистрация администратора
  async adminRegister(userData) {
    try {
      // Валидация данных с помощью Zod
      const validatedData = adminRegisterSchema.parse(userData);

      const { data } = await api.post('/auth/admin/register', validatedData)
      this.setAuthData(data)
      this.emitAuthChange() // Уведомляем об изменении
      return { success: true, data }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors?.map?.(err => err.message).join(', ') || 'Validation error occurred'
        };
      }
      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          error: error.response.data?.message || error.response.data?.error || 'Admin registration failed'
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          error: 'Network error: No response from server'
        };
      } else {
        // Something else happened
        return {
          success: false,
          error: error.message || 'Admin registration failed'
        };
      }
    }
  }

  // Проверка авторизации
  isAuthenticated() {
    return !!this.token
  }

  // Получение текущего пользователя
  getCurrentUser() {
    return this.user
  }

  // Получение полных данных профиля (включая профиль и пользователя)
  getFullProfile() {
    return this.profileData;
  }

  // Установка данных авторизации
  setAuthData(authData) {
    this.token = authData.token
    this.user = authData?.user || null
    localStorage.setItem('token', authData.token)
    if (authData?.user) {
      localStorage.setItem('user', JSON.stringify(authData.user))
    }
  }

  // Очистка данных авторизации
  clearAuth() {
    this.token = null
    this.user = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Эмиттер событий для уведомления компонентов
  emitAuthChange() {
    // Кастомное событие для обновления состояния в компонентах
    window.dispatchEvent(new Event('authChange'))
  }
}

// Экспортируем синглтон
export default new AuthService()