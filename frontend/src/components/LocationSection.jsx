import { motion } from "framer-motion";
import { MapPin, Plane, Train } from "lucide-react";

export default function LocationSection() {
  return (
    <section data-testid="location-section" className="py-24 md:py-32 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="overline mb-4">Find Us</p>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Location
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="h-[400px] border border-[#262626] overflow-hidden"
          >
            <iframe
              data-testid="google-map-iframe"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3488.6!2d75.72!3d29.15!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sBye+Pass+Raipur+Road+Hisar!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Hotel Location"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center gap-8"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#D4AF37]/10">
                <MapPin size={24} className="text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Address
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Bye Pass, Raipur Road,<br />
                  Hisar, Haryana, India
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#D4AF37]/10">
                <Plane size={24} className="text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Hisar Airport
                </h3>
                <p className="text-neutral-400 text-sm">Approximately 5 km away</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#D4AF37]/10">
                <Train size={24} className="text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Railway Station
                </h3>
                <p className="text-neutral-400 text-sm">Approximately 2 km away</p>
              </div>
            </div>

            <div className="mt-4 p-6 bg-[#141414] border border-[#262626]">
              <p className="overline mb-2">Getting Here</p>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Conveniently located on the Raipur Road bypass, Best Western Imperio is easily
                accessible from all major transit points in Hisar. Whether arriving by air or rail,
                our location ensures a quick and comfortable journey to your destination of luxury.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
