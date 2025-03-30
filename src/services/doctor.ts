import api from './api';

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  review_count: number;
  consultation_fee: number;
  available_today: boolean;
  available_for_video: boolean;
  available_for_in_clinic: boolean;
  next_available: string;
  image: string;
  hospital: string;
  location: string;
  education: string;
  languages: string[];
}

export const doctorService = {
  getDoctors: async () => {
    try {
      const response = await api.get('/doctors/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  },

  getDoctor: async (id: number) => {
    try {
      const response = await api.get(`/doctors/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching doctor:', error);
      throw error;
    }
  },

  getDoctorAppointments: async (id: number) => {
    try {
      const response = await api.get(`/doctors/${id}/appointments/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching doctor appointments:', error);
      throw error;
    }
  }
}; 