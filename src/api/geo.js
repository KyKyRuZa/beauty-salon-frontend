import api from './api';

/**
 * Определить город по координатам
 * @param {number} lat - Широта
 * @param {number} lng - Долгота
 * @returns {Promise<{city: string, distance: number}>}
 */
export const detectCity = async (lat, lng) => {
  try {
    const response = await api.post('/geo/detect-city', { lat, lng });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  detectCity
};
