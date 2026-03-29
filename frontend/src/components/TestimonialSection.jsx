import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Rajesh Sharma",
    role: "Business Traveler",
    rating: 5,
    text: "Absolutely stunning hotel! The rooms are spacious, the staff is incredibly courteous, and the location is perfect. Best Western Imperio truly lives up to its name.",
  },
  {
    name: "Priya Gupta",
    role: "Family Vacation",
    rating: 5,
    text: "We had an amazing family stay. The banquet hall was perfect for our event, and the restaurant served delicious food. Highly recommend for anyone visiting Hisar.",
  },
  {
    name: "Amit Verma",
    role: "Weekend Getaway",
    rating: 4,
    text: "Great experience overall. Clean rooms, excellent amenities, and the staff went above and beyond. The executive suite was particularly impressive.",
  },
  {
    name: "Sneha Patel",
    role: "Corporate Event",
    rating: 5,
    text: "Hosted our corporate conference here and it was seamless. Professional setup, great catering, and the team handled everything perfectly. Will definitely return.",
  },
  {
    name: "Vikram Singh",
    role: "Solo Traveler",
    rating: 4,
    text: "Perfect for a business trip. Fast WiFi, comfortable bed, and the restaurant is top-notch. The location near the bypass makes it very convenient.",
  },
];

function StarRating({ rating }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= rating ? "star-filled fill-[#D4AF37]" : "star-empty"}
        />
      ))}
    </div>
  );
}

export default function TestimonialSection() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = () => {
    setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section data-testid="testimonial-section" className="py-24 md:py-32 bg-[#141414]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="overline mb-4">Testimonials</p>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Guest Reviews
          </h2>
        </motion.div>

        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              data-testid={`testimonial-card-${current}`}
              className="glass-light p-8 md:p-12 text-center"
            >
              <StarRating rating={testimonials[current].rating} />
              <p className="text-base md:text-lg text-neutral-300 leading-relaxed mt-6 mb-8 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                "{testimonials[current].text}"
              </p>
              <p className="text-white font-medium text-sm">{testimonials[current].name}</p>
              <p className="text-neutral-500 text-xs mt-1">{testimonials[current].role}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              data-testid="testimonial-prev-btn"
              onClick={prev}
              className="p-2 border border-[#262626] hover:border-[#D4AF37] transition-colors"
            >
              <ChevronLeft size={18} className="text-white" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  data-testid={`testimonial-dot-${i}`}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 transition-all duration-300 ${i === current ? "bg-[#D4AF37] w-6" : "bg-neutral-600"}`}
                />
              ))}
            </div>

            <button
              data-testid="testimonial-next-btn"
              onClick={next}
              className="p-2 border border-[#262626] hover:border-[#D4AF37] transition-colors"
            >
              <ChevronRight size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
