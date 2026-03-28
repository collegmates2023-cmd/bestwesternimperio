import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { BedDouble, UtensilsCrossed, Users, Sparkles } from "lucide-react";

const ABOUT_IMG = "https://images.pexels.com/photos/3124079/pexels-photo-3124079.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

const highlights = [
  { icon: BedDouble, label: "27 Premium Rooms", desc: "Luxurious comfort" },
  { icon: Users, label: "Banquet & Event Space", desc: "Grand celebrations" },
  { icon: UtensilsCrossed, label: "In-house Restaurant", desc: "Fine dining" },
  { icon: Sparkles, label: "Comfortable Luxury Stay", desc: "Premium experience" },
];

function AnimatedSection({ children, className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function AboutSection() {
  return (
    <section id="about" data-testid="about-section" className="py-24 md:py-32 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <AnimatedSection>
            <div className="relative img-zoom">
              <img
                src={ABOUT_IMG}
                alt="Luxury Hotel Lobby"
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 border border-[#D4AF37]/20" />
              {/* Floating stat */}
              <div className="absolute -bottom-6 -right-4 md:right-6 bg-[#D4AF37] text-black p-6">
                <span className="text-3xl font-semibold block" style={{ fontFamily: "'Playfair Display', serif" }}>27</span>
                <span className="text-xs uppercase tracking-widest">Luxury Rooms</span>
              </div>
            </div>
          </AnimatedSection>

          {/* Content */}
          <AnimatedSection>
            <p className="overline mb-4">Welcome</p>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-white mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              About the Hotel
            </h2>
            <p className="text-base md:text-lg font-light text-neutral-400 leading-relaxed mb-10">
              A premium hotel located at Bye Pass, Raipur Road, Hisar offering 27 luxury rooms,
              modern amenities, banquet halls, and fine dining experience. We pride ourselves on
              delivering an unforgettable stay that blends traditional hospitality with modern luxury.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {highlights.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  data-testid={`about-highlight-${i}`}
                  className="group flex items-start gap-4 p-4 border border-[#262626] hover:border-[#D4AF37]/50 transition-colors duration-500"
                >
                  <div className="p-2 bg-[#D4AF37]/10 group-hover:bg-[#D4AF37]/20 transition-colors">
                    <item.icon size={20} className="text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-neutral-500 mt-1">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
