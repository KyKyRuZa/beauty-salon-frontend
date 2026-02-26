import api from './api';

export const createReview = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

export const getMasterReviews = async (masterId, params = {}) => {
  const response = await api.get(`/reviews/master/${masterId}`, { params });
  return response.data;
};

export const getSalonReviews = async (salonId, params = {}) => {
  const response = await api.get(`/reviews/salon/${salonId}`, { params });
  return response.data;
};
