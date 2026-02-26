import api from './api';

export const createBooking = async (bookingData) => {
  const response = await api.post('/booking', bookingData);
  return response.data;
};

export const getMyBookings = async (params = {}) => {
  const response = await api.get('/booking/my', { params });
  return response.data;
};

export const cancelBooking = async (id) => {
  const response = await api.post(`/booking/${id}/cancel`);
  return response.data;
};

export const getAvailableSlots = async (params) => {
  const response = await api.get('/booking/available-slots', { params });
  return response.data;
};
