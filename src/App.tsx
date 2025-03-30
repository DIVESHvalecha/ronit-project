import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Layout from "@/components/layout/Layout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Medicines from "./pages/Medicines";
import Doctors from "./pages/Doctors";
import DoctorAppointment from "./pages/DoctorAppointment";
import AmbulanceBooking from "./pages/AmbulanceBooking";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import { CartProvider } from "./context/CartContext";
import { AppointmentProvider } from "./context/AppointmentContext";
import MyAppointments from "./pages/MyAppointments";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";
import RescheduleAppointment from "./pages/RescheduleAppointment";
import MedicineDetails from "./pages/MedicineDetails";
import AppointmentSuccess from "./pages/AppointmentSuccess";
import { Suspense, lazy } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import Ambulance from "./pages/Ambulance";

// Lazy load the new pages
const About = lazy(() => import("./pages/About"));
const HealthPackages = lazy(() => import("./pages/HealthPackages"));
const Careers = lazy(() => import("./pages/Careers"));
const MedicineDelivery = lazy(() => import("./pages/MedicineDelivery"));
const OnlineConsultation = lazy(() => import("./pages/OnlineConsultation"));
const EmergencyServices = lazy(() => import("./pages/EmergencyServices"));
const HealthRecords = lazy(() => import("./pages/HealthRecords"));
const LabTests = lazy(() => import("./pages/LabTests"));
const HealthBlogs = lazy(() => import("./pages/HealthBlogs"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Support = lazy(() => import("./pages/Support"));
const Refund = lazy(() => import("./pages/Refund"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <AppointmentProvider>
              <Toaster />
              <Sonner />
              <Router>
                <Suspense fallback={<LoadingSpinner size={32} />}>
                  <Layout>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/medicines" element={<Medicines />} />
                      <Route path="/medicines/:id" element={<MedicineDetails />} />
                      <Route path="/doctors" element={<Doctors />} />
                      <Route path="/doctors/:id" element={<DoctorAppointment />} />
                      <Route path="/lab-tests" element={<LabTests />} />
                      <Route path="/health-packages" element={<HealthPackages />} />
                      <Route path="/emergency-services" element={<EmergencyServices />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/careers" element={<Careers />} />
                      <Route path="/medicine-delivery" element={<MedicineDelivery />} />
                      <Route path="/health-blogs" element={<HealthBlogs />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/support" element={<Support />} />
                      <Route path="/refund" element={<Refund />} />
                      <Route path="/ambulance" element={<Ambulance />} />
                      <Route path="/cart" element={<Cart />} />
                      
                      {/* Protected Routes */}
                      <Route path="/doctor-appointment/:id" element={
                        <ProtectedRoute>
                          <DoctorAppointment />
                        </ProtectedRoute>
                      } />
                      <Route path="/my-orders" element={
                        <ProtectedRoute>
                          <MyOrders />
                        </ProtectedRoute>
                      } />
                      <Route path="/my-appointments" element={
                        <ProtectedRoute>
                          <MyAppointments />
                        </ProtectedRoute>
                      } />
                      <Route path="/health-records" element={
                        <ProtectedRoute>
                          <HealthRecords />
                        </ProtectedRoute>
                      } />
                      <Route path="/online-consultation" element={
                        <ProtectedRoute>
                          <OnlineConsultation />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } />
                      <Route path="/reschedule-appointment/:id" element={
                        <ProtectedRoute>
                          <RescheduleAppointment />
                        </ProtectedRoute>
                      } />
                      <Route path="/appointment-success" element={
                        <ProtectedRoute>
                          <AppointmentSuccess />
                        </ProtectedRoute>
                      } />
                      <Route path="/ambulance" element={
                        <ProtectedRoute>
                          <AmbulanceBooking />
                        </ProtectedRoute>
                      } />
                      
                      {/* 404 Route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </Suspense>
              </Router>
            </AppointmentProvider>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
