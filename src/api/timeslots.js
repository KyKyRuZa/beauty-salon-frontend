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

export const setAvailability = async (availabilityData) => {
  const response = await api.post('/availability', availabilityData);
  return response.data;
};

export const getAvailabilityWithSlots = async (date, masterId = null, serviceId = null) => {
  const params = {};
  if (masterId) {
    params.master_id = masterId;
  }
  if (serviceId) {
    params.service_id = serviceId;
  }
  const response = await api.get(`/availability/${date}`, { params });
  return response.data;
};

export const getAvailableDates = async (masterId, serviceId = null) => {
  const params = { master_id: masterId };
  if (serviceId) {
    params.service_id = serviceId;
  }
  const response = await api.get('/availability/available-dates', { params });
  return response.data;
};
