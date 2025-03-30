import api from './api';
import { Doctor } from './doctor';

interface AppointmentUser {
  id: number;
  username: string;
  email: string;
  phone_number?: string;
}

export interface Appointment {
  id: number;
  doctor: Doctor;
  user: AppointmentUser;
  date: string;
  time_slot: string;
  consultation_type: string;
  symptoms: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentData {
  doctorId: number;
  date: string;
  time: string;
  consultationType: string;
  symptoms: string;
}

const transformAppointmentData = (data: CreateAppointmentData) => {
  return {
    doctor_id: data.doctorId,
    date: data.date,
    time_slot: data.time,
    consultation_type: data.consultationType,
    symptoms: data.symptoms
  };
};

export const appointmentService = {
  createAppointment: async (data: CreateAppointmentData) => {
    try {
      console.log('Creating appointment with data:', data);
      const transformedData = transformAppointmentData(data);
      console.log('Transformed appointment data:', transformedData);
      
      const response = await api.post('/appointments/', transformedData);
      console.log('Appointment creation response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating appointment:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  getAppointments: async () => {
    try {
      console.log('Fetching appointments...');
      const token = localStorage.getItem('token');
      console.log('Auth token:', token ? 'Present' : 'Missing');
      
      const response = await api.get('/appointments/');
      console.log('Raw appointments response:', response);

      // Check if response.data is an array or has a results property (common in DRF)
      const appointmentsData = Array.isArray(response.data) ? response.data : response.data.results;
      
      if (!Array.isArray(appointmentsData)) {
        console.error('Invalid appointments data format:', response.data);
        throw new Error('Invalid appointments data format received from server');
      }

      // Validate each appointment
      const validAppointments = appointmentsData.filter(apt => {
        const isValid = apt && 
          typeof apt === 'object' &&
          'id' in apt &&
          'doctor' in apt &&
          'user' in apt &&
          'date' in apt &&
          'time_slot' in apt &&
          'status' in apt;

        if (!isValid) {
          console.error('Invalid appointment data structure:', apt);
        }
        return isValid;
      });

      console.log('Validated appointments:', validAppointments);
      return validAppointments;
    } catch (error: any) {
      console.error('Error fetching appointments:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers
      });
      throw error;
    }
  },

  getAppointment: async (id: number) => {
    try {
      const response = await api.get(`/appointments/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching appointment:', error);
      throw error;
    }
  },

  cancelAppointment: async (id: number) => {
    try {
      console.log('Attempting to cancel appointment:', id);
      const token = localStorage.getItem('token');
      console.log('Auth token:', token ? 'Present' : 'Missing');

      const response = await api.patch(`/appointments/${id}/`, {
        status: 'CANCELLED'
      });

      console.log('Cancel appointment response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response data from server');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error cancelling appointment:', {
        appointmentId: id,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers
      });
      throw error;
    }
  }
}; 