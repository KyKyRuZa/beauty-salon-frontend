import api from './api';

/**
 * Получить топ мастеров
 * @param {number} limit - Количество мастеров (по умолчанию 4)
 * @param {number} minRating - Минимальный рейтинг (по умолчанию 4.5)
 * @returns {Promise<Array>}
 */
export const getTopMasters = async (limit = 4, minRating = 4.5) => {
  try {
    const response = await api.get('/providers/top', {
      params: { limit, minRating }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Получить данные мастера по ID
 * @param {number} masterId - ID мастера
 * @returns {Promise<Object>}
 */
export const getMasterById = async (masterId) => {
  try {
    const response = await api.get(`/providers/master/${masterId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Получить данные салона по ID
 * @param {number} salonId - ID салона
 * @returns {Promise<Object>}
 */
export const getSalonById = async (salonId) => {
  try {
    const response = await api.get(`/providers/salon/${salonId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  getTopMasters,
  getMasterById,
  getSalonById
};
