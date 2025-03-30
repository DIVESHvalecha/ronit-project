import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Calendar, Clock, MapPin, User as UserIcon, Video } from "lucide-react";
import { useAppointments } from "@/context/AppointmentContext";
import { Appointment as BackendAppointment } from "@/services/appointment";
import { Doctor } from "@/services/doctor";

// User interface matching the backend response
interface AppointmentUser {
  id: number;
  username: string;
  email: string;
  phone_number?: string;
}

// Frontend appointment interface for display purposes
interface DisplayAppointment {
  id: number;
  doctorId: number;
  doctorName: string;
  patientName: string;
  patientEmail: string;
  patientAge: string;
  patientPhone: string;
  symptoms: string;
  date: string;
  time: string;
  consultationType: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

// Backend appointment with expanded doctor and user details
interface AppointmentResponse extends Omit<BackendAppointment, 'doctor' | 'user'> {
  doctor: Doctor;
  user: AppointmentUser;
  symptoms: string;
  consultation_type: string;
}

// Transform backend appointment to frontend display format
const transformAppointment = (apt: AppointmentResponse): DisplayAppointment => {
  return {
    id: apt.id,
    doctorId: apt.doctor.id,
    doctorName: apt.doctor.name,
    patientName: apt.user.username,
    patientEmail: apt.user.email,
    patientAge: "N/A",
    patientPhone: apt.user.phone_number || "N/A",
    symptoms: apt.symptoms || "",
    date: apt.date,
    time: apt.time_slot,
    consultationType: apt.consultation_type || "in-clinic",
    status: apt.status.toLowerCase() as 'pending' | 'confirmed' | 'cancelled',
    createdAt: apt.created_at
  };
};

const AppointmentSuccess = () => {
  const navigate = useNavigate();
  const { appointments, reloadAppointments, isLoading } = useAppointments();
  const [appointment, setAppointment] = useState<DisplayAppointment | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLatestAppointment = async () => {
      try {
        await reloadAppointments();
        
        if (!appointments || appointments.length === 0) {
          console.error('No appointments found');
          setError('No appointments found');
          return;
        }

        console.log('All appointments:', appointments);

        // Get the most recent appointment (regardless of status)
        const latestAppointment = appointments[appointments.length - 1] as unknown as AppointmentResponse;
        
        if (!latestAppointment) {
          console.error('Invalid appointment data');
          setError('Invalid appointment data');
          return;
        }

        console.log('Latest appointment:', latestAppointment);
        const transformedAppointment = transformAppointment(latestAppointment);
        console.log('Transformed appointment:', transformedAppointment);
        setAppointment(transformedAppointment);
      } catch (error) {
        console.error('Error retrieving appointment:', error);
        setError('Error retrieving appointment data');
      }
    };

    loadLatestAppointment();
  }, [appointments, reloadAppointments]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-500"></div>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Appointment Information Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "We couldn't find your appointment information."}
          </p>
          <Button onClick={() => navigate('/doctors')}>
            Book an Appointment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Appointment Booked Successfully!
              </h1>
              <p className="text-gray-600">
                Your appointment has been confirmed. You will receive a confirmation email shortly.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center text-gray-600">
                <UserIcon className="h-5 w-5 mr-3 text-medical-500" />
                <div>
                  <p className="font-medium text-gray-900">Doctor</p>
                  <p>{appointment.doctorName}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-3 text-medical-500" />
                <div>
                  <p className="font-medium text-gray-900">Date</p>
                  <p>{appointment.date}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-3 text-medical-500" />
                <div>
                  <p className="font-medium text-gray-900">Time</p>
                  <p>{appointment.time}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                {appointment.consultationType === "video" ? (
                  <Video className="h-5 w-5 mr-3 text-medical-500" />
                ) : (
                  <MapPin className="h-5 w-5 mr-3 text-medical-500" />
                )}
                <div>
                  <p className="font-medium text-gray-900">Consultation Type</p>
                  <p>{appointment.consultationType === "video" ? "Video Consultation" : "In-Clinic Visit"}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="font-medium text-gray-900">Patient Details</p>
                <p className="text-gray-800">Name: {appointment.patientName}</p>
                <p className="text-gray-800">Email: {appointment.patientEmail}</p>
                <p className="text-gray-800">Phone: {appointment.patientPhone}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="flex-1 bg-medical-500 hover:bg-medical-600"
                onClick={() => navigate('/my-appointments')}
              >
                View All Appointments
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/doctors')}
              >
                Book Another Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentSuccess; 