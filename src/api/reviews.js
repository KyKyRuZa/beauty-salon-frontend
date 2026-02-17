import api from './api';

/**
 * API для работы с отзывами
 */

/**
 * Создать отзыв
 * @param {Object} reviewData - Данные отзыва
 * @param {number} [reviewData.master_id] - ID мастера
 * @param {number} [reviewData.salon_id] - ID салона
 * @param {number} [reviewData.booking_id] - ID бронирования
 * @param {number} reviewData.rating - Рейтинг (1-5)
 * @param {string} [reviewData.comment] - Комментарий
 * @returns {Promise}
 */
export const createReview = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

/**
 * Получить отзывы мастера
 * @param {number} masterId - ID мастера
 * @param {Object} params - Параметры запроса
 * @param {number} [params.limit=20] - Лимит
 * @param {number} [params.offset=0] - Смещение
 * @returns {Promise}
 */
export const getMasterReviews = async (masterId, params = {}) => {
  const response = await api.get(`/reviews/master/${masterId}`, { params });
  return response.data;
};

/**
 * Получить отзывы салона
 * @param {number} salonId - ID салона
 * @param {Object} params - Параметры запроса
 * @param {number} [params.limit=20] - Лимит
 * @param {number} [params.offset=0] - Смещение
 * @returns {Promise}
 */
export const getSalonReviews = async (salonId, params = {}) => {
  const response = await api.get(`/reviews/salon/${salonId}`, { params });
  return response.data;
};

/**
 * Получить статистику отзывов мастера
 * @param {number} masterId - ID мастера
 * @returns {Promise}
 */
export const getMasterReviewStats = async (masterId) => {
  const response = await api.get(`/reviews/stats/master/${masterId}`);
  return response.data;
};

/**
 * Получить статистику отзывов салона
 * @param {number} salonId - ID салона
 * @returns {Promise}
 */
export const getSalonReviewStats = async (salonId) => {
  const response = await api.get(`/reviews/stats/salon/${salonId}`);
  return response.data;
};

/**
 * Получить отзыв по ID
 * @param {number} id - ID отзыва
 * @returns {Promise}
 */
export const getReviewById = async (id) => {
  const response = await api.get(`/reviews/${id}`);
  return response.data;
};

/**
 * Обновить отзыв
 * @param {number} id - ID отзыва
 * @param {Object} updateData - Данные для обновления
 * @param {number} [updateData.rating] - Рейтинг
 * @param {string} [updateData.comment] - Комментарий
 * @returns {Promise}
 */
export const updateReview = async (id, updateData) => {
  const response = await api.put(`/reviews/${id}`, updateData);
  return response.data;
};

/**
 * Удалить отзыв
 * @param {number} id - ID отзыва
 * @returns {Promise}
 */
export const deleteReview = async (id) => {
  const response = await api.delete(`/reviews/${id}`);
  return response.data;
};
