import { motion } from "framer-motion";
import { Dumbbell, UtensilsCrossed, ConciergeBell, Wifi, Car, Building2, Wind } from "lucide-react";

const amenities = [
  { icon: Dumbbell, label: "Gym", desc: "State-of-the-art fitness center" },
  { icon: UtensilsCrossed, label: "Restaurant", desc: "Fine dining experience" },
  { icon: ConciergeBell, label: "Room Service", desc: "24/7 in-room dining" },
  { icon: Wifi, label: "WiFi", desc: "High-speed connectivity" },
  { icon: Car, label: "Parking", desc: "Secure valet parking" },
  { icon: Building2, label: "Banquet Hall", desc: "Grand event spaces" },
  { icon: Wind, label: "Air Conditioning", desc: "Climate controlled comfort" },
];

export default function AmenitiesSection() {
  return (
    <section id="amenities" data-testid="amenities-section" className="py-24 md:py-32 bg-[#141414]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="overline mb-4">Facilities</p>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Luxury Amenities
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {amenities.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              data-testid={`amenity-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="group flex flex-col items-center text-center p-8 bg-[#0A0A0A] border border-[#262626] hover:border-[#D4AF37]/50 transition-all duration-500 cursor-default"
            >
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-[#D4AF37]/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
                <item.icon
                  size={32}
                  className="relative text-[#D4AF37] group-hover:scale-110 transition-transform duration-500"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-sm font-medium text-white mb-1">{item.label}</h3>
              <p className="text-xs text-neutral-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
