import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { appointmentService, Appointment, CreateAppointmentData } from '@/services/appointment';
import { useAuth } from './AuthContext';

interface AppointmentContextType {
  appointments: Appointment[];
  addAppointment: (appointment: CreateAppointmentData) => Promise<Appointment>;
  cancelAppointment: (id: number) => Promise<void>;
  getAppointmentsByDoctor: (doctorId: number) => Appointment[];
  getAppointmentsByPatient: (patientId: number) => Appointment[];
  reloadAppointments: () => Promise<void>;
  isLoading: boolean;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const loadingRef = useRef(false);

  const loadAppointments = useCallback(async () => {
    if (!user || loadingRef.current) {
      console.log('Skipping appointment load:', !user ? 'no user' : 'already loading');
      return;
    }
    
    loadingRef.current = true;
    setIsLoading(true);
    
    try {
      console.log('Fetching appointments for user:', user.id);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        toast.error('Please log in again');
        return;
      }

      const data = await appointmentService.getAppointments();
      console.log('Received appointments data:', data);

      // Validate the appointments array
      if (!Array.isArray(data)) {
        console.error('Invalid appointments data format:', data);
        toast.error('Failed to load appointments: Invalid data format');
        return;
      }

      // Filter out any invalid appointments and transform them
      const validAppointments = data.filter(apt => {
        try {
          // Check if appointment has all required fields
          const hasRequiredFields = apt &&
            typeof apt === 'object' &&
            apt.doctor &&
            typeof apt.doctor === 'object' &&
            'id' in apt.doctor &&
            'name' in apt.doctor &&
            apt.user &&
            typeof apt.user === 'object' &&
            'id' in apt.user &&
            'username' in apt.user &&
            apt.date &&
            apt.time_slot &&
            apt.status;

          if (!hasRequiredFields) {
            console.error('Invalid appointment structure:', apt);
            return false;
          }

          return true;
        } catch (err) {
          console.error('Error validating appointment:', err, apt);
          return false;
        }
      });

      console.log('Valid appointments:', validAppointments);
      
      if (validAppointments.length === 0 && data.length > 0) {
        console.error('No valid appointments found in:', data);
        toast.error('Failed to load appointments: Invalid data structure');
        return;
      }

      setAppointments(validAppointments);
      localStorage.setItem('appointments', JSON.stringify(validAppointments));
      
      if (validAppointments.length < data.length) {
        console.warn(`Filtered out ${data.length - validAppointments.length} invalid appointments`);
      }
    } catch (error: any) {
      console.error('Error loading appointments:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadAppointments();
    } else {
      setAppointments([]);
    }
  }, [user, loadAppointments]);

  const addAppointment = async (appointmentData: CreateAppointmentData) => {
    if (!user) {
      throw new Error('You must be logged in to book an appointment');
    }

    setIsLoading(true);
    try {
      const newAppointment = await appointmentService.createAppointment(appointmentData);
      console.log('New appointment created:', newAppointment);
      
      if (newAppointment && typeof newAppointment === 'object' && 'id' in newAppointment) {
        // Update local state with the new appointment
        setAppointments(prev => [...prev, newAppointment]);
        
        toast.success('Appointment booked successfully!', {
          description: `Your appointment is confirmed for ${appointmentData.date} at ${appointmentData.time}`
        });

        return newAppointment;
      } else {
        throw new Error('Invalid appointment data received from server');
      }
    } catch (error: any) {
      console.error('Error in addAppointment:', error);
      toast.error(error.response?.data?.error || 'Failed to book appointment');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAppointment = async (id: number) => {
    setIsLoading(true);
    try {
      const updatedAppointment = await appointmentService.cancelAppointment(id);
      console.log('Received cancelled appointment:', updatedAppointment);

      if (updatedAppointment && typeof updatedAppointment === 'object' && 'id' in updatedAppointment) {
        // Update the appointment in the local state
        setAppointments(prev => 
          prev.map(apt => apt.id === id ? {
            ...apt,
            status: 'cancelled' // Ensure status is lowercase for frontend consistency
          } : apt)
        );
        
        // Force a reload to ensure we have the latest data
        await loadAppointments();
        
        toast.success('Appointment cancelled successfully');
      } else {
        throw new Error('Invalid appointment data received from server');
      }
    } catch (error: any) {
      console.error('Error cancelling appointment:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(error.response?.data?.message || 'Failed to cancel appointment. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getAppointmentsByDoctor = useCallback((doctorId: number) => {
    return appointments.filter(apt => apt.doctor?.id === doctorId);
  }, [appointments]);

  const getAppointmentsByPatient = useCallback((patientId: number) => {
    return appointments.filter(apt => apt.user?.id === patientId);
  }, [appointments]);

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        addAppointment,
        cancelAppointment,
        getAppointmentsByDoctor,
        getAppointmentsByPatient,
        reloadAppointments: loadAppointments,
        isLoading
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
}; 