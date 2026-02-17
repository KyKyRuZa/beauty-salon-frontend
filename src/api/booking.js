import api from './api';

/**
 * API для работы с бронированиями
 * Обновлённая версия для новой системы бронирования
 */

/**
 * Создать бронирование
 * @param {Object} bookingData - Данные бронирования
 * @param {number} bookingData.master_id - ID мастера
 * @param {number} bookingData.master_service_id - ID услуги мастера
 * @param {string} bookingData.start_time - Время начала (ISO 8601)
 * @param {string} bookingData.end_time - Время окончания (ISO 8601)
 * @param {number} [bookingData.time_slot_id] - ID временного слота (опционально)
 * @param {string} [bookingData.comment] - Комментарий клиента
 * @returns {Promise}
 */
export const createBooking = async (bookingData) => {
  const response = await api.post('/booking', bookingData);
  return response.data;
};

/**
 * Получить мои записи (для клиента)
 * @param {Object} params - Параметры запроса
 * @param {string} [params.status] - Фильтр по статусу
 * @returns {Promise}
 */
export const getMyBookings = async (params = {}) => {
  const response = await api.get('/booking/my', { params });
  return response.data;
};

/**
 * Получить записи мастера
 * @param {Object} params - Параметры запроса
 * @param {string} [params.status] - Фильтр по статусу
 * @param {string} [params.date] - Фильтр по дате (YYYY-MM-DD)
 * @returns {Promise}
 */
export const getMasterBookings = async (params = {}) => {
  const response = await api.get('/booking/master', { params });
  return response.data;
};

/**
 * Получить бронирование по ID
 * @param {number} id - ID бронирования
 * @returns {Promise}
 */
export const getBookingById = async (id) => {
  const response = await api.get(`/booking/${id}`);
  return response.data;
};

/**
 * Обновить бронирование
 * @param {number} id - ID бронирования
 * @param {Object} updateData - Данные для обновления
 * @returns {Promise}
 */
export const updateBooking = async (id, updateData) => {
  const response = await api.put(`/booking/${id}`, updateData);
  return response.data;
};

/**
 * Отменить бронирование
 * @param {number} id - ID бронирования
 * @returns {Promise}
 */
export const cancelBooking = async (id) => {
  const response = await api.post(`/booking/${id}/cancel`);
  return response.data;
};

/**
 * Подтвердить бронирование (для мастера)
 * @param {number} id - ID бронирования
 * @returns {Promise}
 */
export const confirmBooking = async (id) => {
  const response = await api.post(`/booking/${id}/confirm`);
  return response.data;
};

/**
 * Получить доступные слоты
 * @param {Object} params - Параметры запроса
 * @param {number} params.master_id - ID мастера
 * @param {string} params.date - Дата (YYYY-MM-DD)
 * @param {number} [params.service_id] - ID услуги (опционально)
 * @returns {Promise}
 */
export const getAvailableSlots = async (params) => {
  const response = await api.get('/booking/available-slots', { params });
  return response.data;
};

/**
 * Получить свободные окна для записи
 * @param {Object} params - Параметры запроса
 * @param {number} params.master_id - ID мастера
 * @param {string} params.date - Дата (YYYY-MM-DD)
 * @param {number} [params.duration=60] - Длительность услуги в минутах
 * @returns {Promise}
 */
export const getFreeWindows = async (params) => {
  const response = await api.get('/booking/free-windows', { params });
  return response.data;
};
