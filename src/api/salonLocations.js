import api from './api';

/**
 * Получить все локации салонов
 */
export const getAllSalonLocations = async (params = {}) => {
  try {
    const response = await api.get('/salon-locations', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Получить локации салонов по городу
 */
export const getSalonLocationsByCity = async (city) => {
  try {
    const response = await api.get(`/salon-locations/city/${city}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Получить локацию конкретного салона
 */
export const getSalonLocation = async (salonId) => {
  try {
    const response = await api.get(`/salon-locations/salon/${salonId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Найти ближайшие салоны по координатам
 */
export const getNearbySalons = async (lat, lng, city = null) => {
  try {
    const response = await api.get('/salon-locations/nearby', {
      params: { lat, lng, city }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Создать локацию салона
 */
export const createSalonLocation = async (locationData) => {
  try {
    const response = await api.post('/salon-locations', locationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Обновить локацию салона
 */
export const updateSalonLocation = async (salonId, locationData) => {
  try {
    const response = await api.put(`/salon-locations/${salonId}`, locationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Удалить локацию салона
 */
export const deleteSalonLocation = async (salonId) => {
  try {
    const response = await api.delete(`/salon-locations/${salonId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  getAllSalonLocations,
  getSalonLocationsByCity,
  getSalonLocation,
  getNearbySalons,
  createSalonLocation,
  updateSalonLocation,
  deleteSalonLocation
};
