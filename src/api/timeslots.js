import api from './api';

export const getMasterSlots = async (params) => {
  const response = await api.get('/timeslots/master', { params });
  return response.data;
};

export const createTimeSlot = async (slotData) => {
  const response = await api.post('/timeslots', slotData);
  return response.data;
};


export const updateTimeSlot = async (id, updateData) => {
  const response = await api.put(`/timeslots/${id}`, updateData);
  return response.data;
};

export const deleteTimeSlot = async (id) => {
  const response = await api.delete(`/timeslots/${id}`);
  return response.data;
};

export const createSchedule = async (scheduleData) => {
  const response = await api.post('/timeslots/schedule', scheduleData);
  return response.data;
};

export const setAvailability = async (availabilityData) => {
  console.log('=== setAvailability START ===');
  console.log('setAvailability API вызов с данными:', availabilityData);
  try {
    console.log('Отправка POST запроса на /availability...');
    const response = await api.post('/availability', availabilityData);
    console.log('setAvailability API ответ:', response.data);
    console.log('=== setAvailability SUCCESS ===');
    return response.data;
  } catch (error) {
    console.error('=== setAvailability ERROR ===');
    console.error('Ошибка:', error);
    console.error('Ответ сервера:', error.response?.data);
    console.error('Статус:', error.response?.status);
    throw error;
  }
};

export const getAvailability = async (params) => {
  const response = await api.get('/availability', { params });
  return response.data;
};

export const getAvailabilityWithSlots = async (date) => {
  const response = await api.get(`/availability/${date}`);
  return response.data;
};

export const updateAvailability = async (id, updateData) => {
  const response = await api.put(`/availability/${id}`, updateData);
  return response.data;
};

export const deleteAvailability = async (id) => {
  const response = await api.delete(`/availability/${id}`);
  return response.data;
};

export const regenerateSlots = async (id) => {
  const response = await api.post(`/availability/${id}/regenerate`);
  return response.data;
};
