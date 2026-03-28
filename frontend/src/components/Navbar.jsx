import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Rooms", href: "#rooms" },
  { label: "Amenities", href: "#amenities" },
  { label: "Gallery", href: "#gallery" },
  { label: "Booking", href: "#booking" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl bg-[#0A0A0A]/80 border-b border-white/10 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-between h-20">
        <button
          data-testid="logo-link"
          onClick={() => scrollTo("#home")}
          className="flex flex-col leading-none"
        >
          <span className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Best Western
          </span>
          <span className="text-white text-xl tracking-widest font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
            IMPERIO
          </span>
        </button>

        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <button
              key={link.href}
              data-testid={`nav-${link.label.toLowerCase()}`}
              onClick={() => scrollTo(link.href)}
              className="text-xs tracking-[0.15em] uppercase text-white/80 hover:text-[#D4AF37] transition-colors duration-300"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <button
            data-testid="nav-admin-btn"
            onClick={() => navigate("/admin")}
            className="flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase text-neutral-400 hover:text-[#D4AF37] transition-colors duration-300"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            <ShieldCheck size={14} />
            Admin
          </button>
          <button
            data-testid="nav-book-now-btn"
            onClick={() => scrollTo("#booking")}
            className="bg-[#D4AF37] text-black px-7 py-3 text-xs uppercase tracking-[0.15em] font-semibold hover:bg-[#FDE047] transition-all duration-300"
          >
            Book Now
          </button>
        </div>

        <button
          data-testid="mobile-menu-toggle"
          className="lg:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden backdrop-blur-xl bg-[#0A0A0A]/95 border-b border-white/10 px-6 pb-6"
          >
            {navLinks.map((link) => (
              <button
                key={link.href}
                data-testid={`mobile-nav-${link.label.toLowerCase()}`}
                onClick={() => scrollTo(link.href)}
                className="block w-full text-left py-3 text-sm tracking-widest uppercase text-white/80 hover:text-[#D4AF37] transition-colors border-b border-white/5"
              >
                {link.label}
              </button>
            ))}
            <button
              data-testid="mobile-admin-btn"
              onClick={() => { setMobileOpen(false); navigate("/admin"); }}
              className="mt-4 w-full flex items-center justify-center gap-2 border border-[#D4AF37] text-[#D4AF37] py-3 text-xs uppercase tracking-widest font-semibold"
            >
              <ShieldCheck size={14} /> Admin Panel
            </button>
            <button
              data-testid="mobile-book-now-btn"
              onClick={() => scrollTo("#booking")}
              className="mt-2 w-full bg-[#D4AF37] text-black py-3 text-xs uppercase tracking-widest font-semibold"
            >
              Book Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
