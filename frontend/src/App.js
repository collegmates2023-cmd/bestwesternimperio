import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";

// Public pages
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import RoomsSection from "@/components/RoomsSection";
import FloorBooking from "@/components/FloorBooking";
import AmenitiesSection from "@/components/AmenitiesSection";
import GallerySection from "@/components/GallerySection";
import TestimonialSection from "@/components/TestimonialSection";
import LocationSection from "@/components/LocationSection";
import Footer from "@/components/Footer";

// Admin pages & Route Protection
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import RoomManagement from "@/pages/admin/RoomManagement";
import FloorLayout from "@/pages/admin/FloorLayout";
import BookingManagement from "@/pages/admin/BookingManagement";
import SettingsPage from "@/pages/admin/Settings";
import ProtectedRoute from "@/components/ProtectedRoute";

function PublicSite() {
  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <RoomsSection />
      <FloorBooking />
      <AmenitiesSection />
      <GallerySection />
      <TestimonialSection />
      <LocationSection />
      <Footer />
      <div className="mobile-sticky-book md:hidden">
        <button
          data-testid="mobile-sticky-book-btn"
          onClick={() => { const el = document.querySelector("#booking"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
          className="w-full bg-[#D4AF37] text-black py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#FDE047] transition-all duration-300"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Toaster
        position="top-right"
        toastOptions={{ style: { background: '#141414', border: '1px solid #262626', color: '#fff' } }}
      />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<PublicSite />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin" 
              element={<ProtectedRoute element={<AdminLayout />} />}
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="rooms" element={<RoomManagement />} />
              <Route path="floor-layout" element={<FloorLayout />} />
              <Route path="bookings" element={<BookingManagement />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
