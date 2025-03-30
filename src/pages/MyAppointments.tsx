import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppointments } from "@/context/AppointmentContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, MapPin, Phone, Search, Filter, ChevronDown, X } from "lucide-react";
import { format, isAfter, isBefore, parseISO, addMinutes } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Appointment as BackendAppointment } from "@/services/appointment";
import { Doctor } from "@/services/doctor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// User interface matching the backend response
interface AppointmentUser {
  id: number;
  username: string;
  email: string;
  phone_number?: string;
}

// Backend appointment with expanded doctor and user details
interface AppointmentResponse extends Omit<BackendAppointment, 'doctor' | 'user'> {
  doctor: Doctor;
  user: AppointmentUser;
  symptoms: string;
  consultation_type: string;
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

const MyAppointments = () => {
  const { user } = useAuth();
  const { appointments, cancelAppointment, reloadAppointments } = useAppointments();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<DisplayAppointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [filterStatus, setFilterStatus] = useState<"all" | "confirmed" | "cancelled">("all");

  useEffect(() => {
    reloadAppointments();
  }, [reloadAppointments]);

  // Transform appointments with proper type checking
  const transformedAppointments = appointments
    .filter((apt): apt is AppointmentResponse => {
      if (!apt || typeof apt !== 'object') return false;
      if (!('doctor' in apt) || !('user' in apt)) return false;
      return true;
    })
    .map(transformAppointment);

  console.log('Original appointments:', appointments);
  console.log('Transformed appointments:', transformedAppointments);

  const filteredAppointments = transformedAppointments
    .filter(appointment => {
      // Filter by search query
      const matchesSearch = searchQuery === "" ||
        appointment.id.toString().includes(searchQuery) ||
        appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by status
      const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;

      // Filter by date
      const appointmentDate = parseISO(appointment.date);
      const now = new Date();

      if (activeTab === "upcoming") {
        return isAfter(appointmentDate, now) && matchesSearch && matchesStatus;
      } else {
        return isBefore(appointmentDate, now) && matchesSearch && matchesStatus;
      }
    })
    .sort((a, b) => {
      const dateA = parseISO(`${a.date}T${a.time}`);
      const dateB = parseISO(`${b.date}T${b.time}`);
      
      return sortOrder === "newest" 
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

  const handleCancel = async (appointmentId: number) => {
    try {
      console.log('Initiating appointment cancellation:', appointmentId);
      
      // Show loading toast
      toast.loading('Cancelling appointment...');
      
      await cancelAppointment(appointmentId);
      
      // Clear loading toast and show success
      toast.dismiss();
      toast.success("Appointment cancelled successfully");
      
      // Reload appointments to ensure we have the latest data
      await reloadAppointments();
    } catch (error: any) {
      console.error('Failed to cancel appointment:', {
        appointmentId,
        error: error.message,
        response: error.response?.data
      });
      
      // Clear loading toast and show error
      toast.dismiss();
      toast.error(error.response?.data?.message || "Failed to cancel appointment. Please try again.");
    }
  };

  const handleReschedule = (appointmentId: number) => {
    navigate(`/reschedule-appointment/${appointmentId}`);
  };

  const handleViewDetails = (appointment: DisplayAppointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const clearFilters = () => {
    setFilterStatus("all");
    setSortOrder("newest");
    setSearchQuery("");
  };

  const getConsultationIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />;
      case "in-clinic":
        return <MapPin className="h-5 w-5" />;
      case "phone":
        return <Phone className="h-5 w-5" />;
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your appointments</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Appointments</h1>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div className="flex space-x-4">
            <Button
              variant={activeTab === "upcoming" ? "default" : "outline"}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming
            </Button>
            <Button
              variant={activeTab === "past" ? "default" : "outline"}
              onClick={() => setActiveTab("past")}
            >
              Past
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-8 w-full md:w-[200px]"
              />
              {searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <Filter className="h-4 w-4" />
                  <span className="hidden md:inline">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                    <span className={filterStatus === "all" ? "font-semibold" : ""}>All Statuses</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("confirmed")}>
                    <span className={filterStatus === "confirmed" ? "font-semibold" : ""}>Confirmed</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("cancelled")}>
                    <span className={filterStatus === "cancelled" ? "font-semibold" : ""}>Cancelled</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <ChevronDown className="h-4 w-4" />
                  <span className="hidden md:inline">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                    <span className={sortOrder === "newest" ? "font-semibold" : ""}>Newest First</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                    <span className={sortOrder === "oldest" ? "font-semibold" : ""}>Oldest First</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {(searchQuery || filterStatus !== "all" || sortOrder !== "newest") && (
              <Button variant="ghost" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map(appointment => (
              <div
                key={appointment.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{appointment.doctorName}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-5 w-5 mr-2 text-medical-500" />
                        {format(new Date(appointment.date), "MMMM d, yyyy")}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-5 w-5 mr-2 text-medical-500" />
                        {appointment.time}
                      </div>
                      <div className="flex items-center text-gray-600">
                        {getConsultationIcon(appointment.consultationType)}
                        <span className="ml-2 capitalize">{appointment.consultationType} Consultation</span>
                      </div>
                      {appointment.symptoms && (
                        <div className="text-gray-600 mt-2">
                          <span className="font-medium">Symptoms: </span>
                          {appointment.symptoms.length > 50 
                            ? `${appointment.symptoms.substring(0, 50)}...` 
                            : appointment.symptoms}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-4">
                    <Badge 
                      variant={
                        appointment.status === "confirmed" ? "default" :
                        appointment.status === "pending" ? "outline" : "destructive"
                      }
                    >
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </Badge>
                    
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(appointment)}
                        className="w-full sm:w-auto"
                      >
                        View Details
                      </Button>
                      {appointment.status !== "cancelled" && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReschedule(appointment.id)}
                            className="w-full sm:w-auto"
                          >
                            Reschedule
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleCancel(appointment.id)}
                            className="w-full sm:w-auto"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">No {activeTab} appointments found.</p>
              {(searchQuery || filterStatus !== "all") && (
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Appointment Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Complete information about your appointment
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{selectedAppointment.doctorName}</h3>
                <Badge 
                  variant={
                    selectedAppointment.status === "confirmed" ? "default" :
                    selectedAppointment.status === "pending" ? "outline" : "destructive"
                  }
                >
                  {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2 text-medical-500" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p>{format(new Date(selectedAppointment.date), "MMMM d, yyyy")}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2 text-medical-500" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p>{selectedAppointment.time}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    {getConsultationIcon(selectedAppointment.consultationType)}
                    <div className="ml-2">
                      <p className="font-medium">Consultation Type</p>
                      <p className="capitalize">{selectedAppointment.consultationType}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2 text-medical-500" />
                    <div>
                      <p className="font-medium">Booked On</p>
                      <p>{selectedAppointment.createdAt ? format(parseISO(selectedAppointment.createdAt), "MMM d, yyyy") : "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedAppointment.symptoms && (
                <div className="border-t pt-4 mt-4">
                  <p className="font-medium">Symptoms</p>
                  <p className="text-gray-600 mt-1">{selectedAppointment.symptoms}</p>
                </div>
              )}
              
              {selectedAppointment.status !== "cancelled" && (
                <div className="flex space-x-4 pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      handleReschedule(selectedAppointment.id);
                      setIsDetailsOpen(false);
                    }}
                  >
                    Reschedule
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => {
                      handleCancel(selectedAppointment.id);
                      setIsDetailsOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyAppointments; 