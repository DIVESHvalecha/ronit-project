import api from './api';

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  experience: number;
  qualification: string;
  description: string;
  image: string;
  consultation_fee: number;
  available_slots: string[];
  rating: number;
}

export const doctorService = {
  getAll: async () => {
    const response = await api.get('/doctors/');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/doctors/${id}/`);
    return response.data;
  },

  getAvailableSlots: async (id: number) => {
    const response = await api.get(`/doctors/${id}/available_slots/`);
    return response.data;
  },

  bookAppointment: async (doctorId: number, date: string, timeSlot: string) => {
    const response = await api.post('/appointments/', {
      doctor: doctorId,
      date,
      time_slot: timeSlot
    });
    return response.data;
  }
}; 