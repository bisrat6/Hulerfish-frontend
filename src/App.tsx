import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Tours from "./pages/Tours";
import TourDetail from "./pages/TourDetail";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import Profile from "./pages/Profile";
import MyBookings from "./pages/MyBookings";
import MyReviews from "./pages/MyReviews";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import AdminDashboard from "./pages/AdminDashboard";
import TourManagement from "./pages/TourManagement";
import UserManagement from "./pages/UserManagement";
import ManageHostApplications from "./pages/ManageHostApplications";
import HostManagement from "./pages/HostManagement";
import HostApplication from "./pages/HostApplication";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/experiences" element={<Tours />} />
            <Route path="/experiences/:id" element={<TourDetail />} />
            <Route path="/tours" element={<Tours />} />
            <Route path="/tours/:id" element={<TourDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/update-password"
              element={
                <ProtectedRoute>
                  <UpdatePassword />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/experiences"
              element={
                <ProtectedRoute>
                  <TourManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tours"
              element={
                <ProtectedRoute>
                  <TourManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/host-applications"
              element={
                <ProtectedRoute>
                  <ManageHostApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/hosts"
              element={
                <ProtectedRoute>
                  <HostManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-reviews"
              element={
                <ProtectedRoute>
                  <MyReviews />
                </ProtectedRoute>
              }
            />
            <Route
              path="/host-application"
              element={
                <ProtectedRoute>
                  <HostApplication />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
