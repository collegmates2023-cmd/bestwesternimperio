import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

const categories = ["All", "Hotel", "Rooms", "Restaurant", "Reception"];

const galleryImages = [
  {
    src: "https://customer-assets.emergentagent.com/job_imperio-luxury/artifacts/ooypb31c_bc1f036e726111e799540a4cef95d023.jpg",
    alt: "Hotel Exterior",
    category: "Hotel",
    height: "h-80"
  },
  {
    src: "https://customer-assets.emergentagent.com/job_imperio-luxury/artifacts/980zdopb_c0ce331a7c5311e894780266fbcf4d94.jpg",
    alt: "Deluxe Room",
    category: "Rooms",
    height: "h-72"
  },
  {
    src: "https://customer-assets.emergentagent.com/job_imperio-luxury/artifacts/m3kgfm24_6d1ea774726111e7b345025f77df004f.jpg",
    alt: "Restaurant & Banquet Hall",
    category: "Restaurant",
    height: "h-80"
  },
  {
    src: "https://customer-assets.emergentagent.com/job_imperio-luxury/artifacts/nmgytssa_f8e3795ee2ee11eba40e0242ac110004.jfif.jpg",
    alt: "Reception Area",
    category: "Reception",
    height: "h-64"
  },
  {
    src: "https://customer-assets.emergentagent.com/job_imperio-luxury/artifacts/n7wlzppe_4c596542726111e78394025f77df004f.jpg",
    alt: "Lobby & Art Decor",
    category: "Reception",
    height: "h-80"
  },
];

export default function GallerySection() {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredImages = activeCategory === "All"
    ? galleryImages
    : galleryImages.filter((img) => img.category === activeCategory);

  const openLightbox = (index) => {
    // Find the actual index in the full array for lightbox navigation
    const actualIndex = galleryImages.indexOf(filteredImages[index]);
    setLightboxIndex(actualIndex);
  };
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = () => setLightboxIndex((prev) => (prev + 1) % galleryImages.length);
  const prevImage = () => setLightboxIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  return (
    <section id="gallery" data-testid="gallery-section" className="py-24 md:py-32 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="overline mb-4">Visual Journey</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Gallery
          </h2>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              data-testid={`gallery-filter-${cat.toLowerCase()}`}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 text-xs uppercase tracking-widest transition-all duration-300 border ${
                activeCategory === cat
                  ? "bg-[#D4AF37] text-black border-[#D4AF37] font-semibold"
                  : "bg-transparent text-neutral-400 border-[#262626] hover:border-[#D4AF37]/50 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="masonry-grid">
          {filteredImages.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="masonry-item group cursor-pointer"
              onClick={() => openLightbox(i)}
              data-testid={`gallery-image-${i}`}
            >
              <div className="relative overflow-hidden">
                <img
                  src={img.src}
                  alt={img.alt}
                  className={`w-full ${img.height} object-cover group-hover:scale-105 transition-transform duration-700`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex flex-col items-start justify-end p-4">
                  <span className="text-[#D4AF37] text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 mb-1">
                    {img.category}
                  </span>
                  <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0">
                    {img.alt}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && closeLightbox()}>
        <DialogContent
          data-testid="gallery-lightbox"
          className="max-w-4xl bg-black/95 border-[#262626] p-2"
        >
          <VisuallyHidden.Root>
            <DialogTitle>Gallery Image</DialogTitle>
            <DialogDescription>View gallery image</DialogDescription>
          </VisuallyHidden.Root>
          {lightboxIndex !== null && (
            <div className="relative">
              <img
                src={galleryImages[lightboxIndex].src}
                alt={galleryImages[lightboxIndex].alt}
                className="w-full max-h-[80vh] object-contain"
              />
              <button
                data-testid="lightbox-prev"
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 p-2 hover:bg-black/80 transition-colors"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
              <button
                data-testid="lightbox-next"
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 p-2 hover:bg-black/80 transition-colors"
              >
                <ChevronRight size={24} className="text-white" />
              </button>
              <p className="text-center text-neutral-400 text-sm mt-3">
                {galleryImages[lightboxIndex].alt} ({lightboxIndex + 1}/{galleryImages.length})
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
