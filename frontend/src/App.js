import "@/App.css";
import { Toaster } from "sonner";
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

function App() {
  return (
    <div className="App bg-[#0A0A0A] min-h-screen">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#141414',
            border: '1px solid #262626',
            color: '#fff',
          },
        }}
      />
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

      {/* Mobile sticky booking button */}
      <div className="mobile-sticky-book md:hidden">
        <button
          data-testid="mobile-sticky-book-btn"
          onClick={() => {
            const el = document.querySelector("#booking");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="w-full bg-[#D4AF37] text-black py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#FDE047] transition-all duration-300"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}

export default App;
