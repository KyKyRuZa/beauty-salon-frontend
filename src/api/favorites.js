import api from './api';

/**
 * API для работы с избранными мастерами
 */

/**
 * Получить список избранных мастеров
 * @returns {Promise}
 */
export const getFavorites = async () => {
  const response = await api.get('/favorites');
  return response.data;
};

/**
 * Добавить мастера в избранное
 * @param {number} masterId - ID мастера
 * @returns {Promise}
 */
export const addFavorite = async (masterId) => {
  const response = await api.post(`/favorites/${masterId}`);
  return response.data;
};

/**
 * Удалить мастера из избранного
 * @param {number} masterId - ID мастера
 * @returns {Promise}
 */
export const removeFavorite = async (masterId) => {
  const response = await api.delete(`/favorites/${masterId}`);
  return response.data;
};

/**
 * Переключить статус избранного
 * @param {number} masterId - ID мастера
 * @returns {Promise}
 */
export const toggleFavorite = async (masterId) => {
  const response = await api.post(`/favorites/${masterId}/toggle`);
  return response.data;
};

/**
 * Проверить, находится ли мастер в избранном
 * @param {number} masterId - ID мастера
 * @returns {Promise}
 */
export const checkFavorite = async (masterId) => {
  const response = await api.get(`/favorites/${masterId}/check`);
  return response.data;
};
