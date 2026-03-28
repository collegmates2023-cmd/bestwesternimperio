import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Users, BedDouble, ChevronDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

const HERO_IMG = "https://customer-assets.emergentagent.com/job_imperio-luxury/artifacts/ooypb31c_bc1f036e726111e799540a4cef95d023.jpg";

export default function HeroSection() {
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState("");
  const [roomType, setRoomType] = useState("");

  const scrollTo = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" data-testid="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_IMG}
          alt="Best Western Imperio Hotel"
          className="w-full h-full object-cover animate-slow-zoom"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-[#0A0A0A] z-10" />

      {/* Content */}
      <div className="relative z-20 text-center flex flex-col items-center gap-6 px-6 mt-16">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="overline"
        >
          Best Western Imperio
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-medium tracking-tight leading-none text-white max-w-4xl"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Experience Luxury
          <br />
          <span className="text-[#D4AF37]">Stay in Hisar</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-base md:text-lg font-light text-neutral-400 max-w-xl leading-relaxed"
        >
          Discover unparalleled comfort and elegance at the heart of Hisar
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 mt-4"
        >
          <button
            data-testid="hero-book-now-btn"
            onClick={() => scrollTo("#booking")}
            className="bg-[#D4AF37] text-black px-8 py-4 text-sm uppercase tracking-widest font-semibold hover:bg-[#FDE047] transition-all duration-300"
          >
            Book Now
          </button>
          <button
            data-testid="hero-explore-rooms-btn"
            onClick={() => scrollTo("#rooms")}
            className="border border-[#D4AF37] text-[#D4AF37] px-8 py-4 text-sm uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            Explore Rooms
          </button>
        </motion.div>
      </div>

      {/* Floating Booking Bar */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        data-testid="booking-bar"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-5xl hidden md:block"
      >
        <div className="backdrop-blur-2xl bg-[#0A0A0A]/80 border border-white/10 p-6 flex flex-col lg:flex-row gap-4 items-end justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          {/* Check-in */}
          <div className="flex-1 w-full">
            <label className="overline text-[10px] mb-2 block">Check-in</label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  data-testid="checkin-date-picker"
                  className="w-full flex items-center gap-3 bg-transparent border-b border-white/20 pb-2 text-sm text-white hover:border-[#D4AF37] transition-colors"
                >
                  <CalendarIcon size={16} className="text-[#D4AF37]" />
                  {checkIn ? format(checkIn, "MMM dd, yyyy") : "Select date"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#141414] border-[#262626]" align="start">
                <Calendar
                  mode="single"
                  selected={checkIn}
                  onSelect={setCheckIn}
                  disabled={(date) => date < new Date()}
                  className="text-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Check-out */}
          <div className="flex-1 w-full">
            <label className="overline text-[10px] mb-2 block">Check-out</label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  data-testid="checkout-date-picker"
                  className="w-full flex items-center gap-3 bg-transparent border-b border-white/20 pb-2 text-sm text-white hover:border-[#D4AF37] transition-colors"
                >
                  <CalendarIcon size={16} className="text-[#D4AF37]" />
                  {checkOut ? format(checkOut, "MMM dd, yyyy") : "Select date"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#141414] border-[#262626]" align="start">
                <Calendar
                  mode="single"
                  selected={checkOut}
                  onSelect={setCheckOut}
                  disabled={(date) => date < (checkIn || new Date())}
                  className="text-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Guests */}
          <div className="flex-1 w-full">
            <label className="overline text-[10px] mb-2 block">Guests</label>
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger
                data-testid="guests-select"
                className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 text-sm text-white shadow-none focus:ring-0 h-auto pb-2"
              >
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-[#D4AF37]" />
                  <SelectValue placeholder="Select guests" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#141414] border-[#262626] text-white">
                <SelectItem value="1">1 Guest</SelectItem>
                <SelectItem value="2">2 Guests</SelectItem>
                <SelectItem value="3">3 Guests</SelectItem>
                <SelectItem value="4">4 Guests</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Room Type */}
          <div className="flex-1 w-full">
            <label className="overline text-[10px] mb-2 block">Room Type</label>
            <Select value={roomType} onValueChange={setRoomType}>
              <SelectTrigger
                data-testid="room-type-select"
                className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 text-sm text-white shadow-none focus:ring-0 h-auto pb-2"
              >
                <div className="flex items-center gap-3">
                  <BedDouble size={16} className="text-[#D4AF37]" />
                  <SelectValue placeholder="Room type" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#141414] border-[#262626] text-white">
                <SelectItem value="deluxe">Deluxe Room</SelectItem>
                <SelectItem value="executive">Executive Room</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button
            data-testid="check-availability-btn"
            onClick={() => scrollTo("#booking")}
            className="bg-[#D4AF37] text-black px-8 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#FDE047] transition-all duration-300 whitespace-nowrap"
          >
            Check Availability
          </button>
        </div>
      </motion.div>

      {/* Scroll indicator - hidden on desktop where booking bar shows */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-4 z-10 md:hidden pointer-events-none"
      >
        <ChevronDown size={24} className="text-[#D4AF37]/60" />
      </motion.div>
    </section>
  );
}
