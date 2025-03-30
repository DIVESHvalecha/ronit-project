import { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, Clock, User, Mail, Phone, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DayPicker } from "react-day-picker"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MapPin, Star, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAppointments } from "@/context/AppointmentContext";
import { useAuth } from "@/context/AuthContext";
import { doctorService, Doctor } from "@/services/doctor";
import LoadingSpinner from "@/components/LoadingSpinner";

const DoctorAppointment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addAppointment, isLoading: isAppointmentLoading } = useAppointments();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [consultationType, setConsultationType] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string>("");

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        if (!id) return;
        const data = await doctorService.getDoctor(parseInt(id));
        setDoctor(data);
      } catch (error) {
        console.error('Error fetching doctor:', error);
        toast.error('Failed to load doctor details');
        navigate('/doctors');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctor();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor || !selectedDate || !selectedTime || !consultationType || !symptoms || !user) {
      toast.error('Please fill in all fields and ensure you are logged in');
      return;
    }

    try {
      console.log('Creating appointment with data:', {
        doctorId: doctor.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        consultationType,
        symptoms
      });

      const newAppointment = await addAppointment({
        doctorId: doctor.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        consultationType: consultationType,
        symptoms
      });

      console.log('Appointment created successfully:', newAppointment);
      
      // Small delay to ensure state updates are processed
      setTimeout(() => {
        navigate('/appointment-success');
      }, 100);
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment. Please try again.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!doctor) {
    return <div>Doctor not found</div>;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Doctor Info Card */}
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={doctor.image} alt={doctor.name} />
                <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-2xl font-bold">{doctor.name}</h2>
                <p className="text-gray-600">{doctor.specialty}</p>
                <div className="flex items-center justify-center space-x-1 mt-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>{doctor.rating}</span>
                  <span className="text-gray-500">({doctor.review_count} reviews)</span>
                </div>
              </div>
              <div className="w-full space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{doctor.hospital}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{doctor.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Experience: {doctor.experience}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Video className="h-4 w-4" />
                  <span>{doctor.available_for_video ? 'Available for Video Consultation' : 'Not available for Video Consultation'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Form */}
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Book Appointment</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Time</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09:00">09:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="14:00">02:00 PM</SelectItem>
                        <SelectItem value="15:00">03:00 PM</SelectItem>
                        <SelectItem value="16:00">04:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Consultation Type</Label>
                    <Select value={consultationType} onValueChange={setConsultationType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select consultation type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video Consultation</SelectItem>
                        <SelectItem value="in_clinic">In-Clinic Visit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Consultation Fee</Label>
                    <div className="text-xl font-bold">₹{doctor.consultation_fee}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Describe your symptoms</Label>
                  <Textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Please describe your symptoms in detail..."
                    className="min-h-[100px]"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isAppointmentLoading}>
                  {isAppointmentLoading ? 'Booking...' : 'Book Appointment'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointment;
