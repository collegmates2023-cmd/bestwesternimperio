import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, MapPin, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import api from "@/config/api";

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "Rooms", href: "#rooms" },
  { label: "Amenities", href: "#amenities" },
  { label: "Gallery", href: "#gallery" },
  { label: "Booking", href: "#booking" },
];

export default function Footer() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);

  const scrollTo = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/contact', form);
      toast.success("Message sent successfully! We'll get back to you soon.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
    setLoading(false);
  };

  return (
    <footer id="contact" data-testid="footer-section" className="bg-[#0A0A0A] border-t border-[#262626]">
      {/* Contact Form + Info */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div>
            <p className="overline mb-4">Get in Touch</p>
            <h2
              className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-8"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Contact Us
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5" data-testid="contact-form">
              <div>
                <input
                  data-testid="contact-name-input"
                  type="text"
                  placeholder="Your Name *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-[#D4AF37] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <input
                  data-testid="contact-email-input"
                  type="email"
                  placeholder="Email Address *"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-[#D4AF37] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <input
                  data-testid="contact-phone-input"
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-[#D4AF37] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <textarea
                  data-testid="contact-message-input"
                  placeholder="Your Message *"
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"
                />
              </div>
              <button
                data-testid="contact-submit-btn"
                type="submit"
                disabled={loading}
                className="bg-[#D4AF37] text-black px-8 py-4 text-xs uppercase tracking-widest font-semibold hover:bg-[#FDE047] transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="mb-12">
                <span className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase font-semibold block" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Best Western
                </span>
                <span
                  className="text-4xl md:text-5xl text-white tracking-widest font-medium block mt-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  IMPERIO
                </span>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin size={18} className="text-[#D4AF37] mt-1 shrink-0" />
                  <p className="text-sm text-neutral-400">
                    Bye Pass, Raipur Road,<br />Hisar, Haryana, India
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Phone size={18} className="text-[#D4AF37] shrink-0" />
                  <a href="tel:+911234567890" className="text-sm text-neutral-400 hover:text-[#D4AF37] transition-colors">
                    +91 123 456 7890
                  </a>
                </div>
                <div className="flex items-center gap-4">
                  <Mail size={18} className="text-[#D4AF37] shrink-0" />
                  <a href="mailto:info@bwimperio.com" className="text-sm text-neutral-400 hover:text-[#D4AF37] transition-colors">
                    info@bwimperio.com
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <p className="overline mb-4">Quick Links</p>
              <div className="flex flex-wrap gap-4">
                {quickLinks.map((link) => (
                  <button
                    key={link.href}
                    data-testid={`footer-link-${link.label.toLowerCase()}`}
                    onClick={() => scrollTo(link.href)}
                    className="text-xs text-neutral-500 hover:text-[#D4AF37] transition-colors tracking-widest uppercase"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#262626] py-6">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="text-xs text-neutral-600">
              {new Date().getFullYear()} Best Western Imperio, Hisar. All rights reserved.
            </p>
            <button
              data-testid="footer-admin-link"
              onClick={() => navigate("/admin")}
              className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-[#D4AF37] transition-colors tracking-widest uppercase"
            >
              <ShieldCheck size={12} /> Admin
            </button>
          </div>
          <div className="flex gap-6">
            {["facebook", "instagram", "twitter"].map((social) => (
              <a
                key={social}
                href={`https://${social}.com`}
                data-testid={`social-${social}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-neutral-600 hover:text-[#D4AF37] transition-colors uppercase tracking-widest"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
