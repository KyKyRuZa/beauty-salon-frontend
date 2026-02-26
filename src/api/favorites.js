import api from './api';

export const getFavorites = async () => {
  const response = await api.get('/favorites');
  return response.data;
};

export const toggleFavorite = async (masterId) => {
  const response = await api.post(`/favorites/${masterId}/toggle`);
  return response.data;
};

export const checkFavorite = async (masterId) => {
  const response = await api.get(`/favorites/${masterId}/check`);
  return response.data;
};
