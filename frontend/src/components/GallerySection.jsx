import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

const galleryImages = [
  {
    src: "https://images.pexels.com/photos/3124079/pexels-photo-3124079.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    alt: "Hotel Lobby",
    height: "h-80"
  },
  {
    src: "https://images.pexels.com/photos/6466484/pexels-photo-6466484.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    alt: "Deluxe Room",
    height: "h-64"
  },
  {
    src: "https://images.unsplash.com/photo-1759223198981-661cadbbff36?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    alt: "Executive Suite",
    height: "h-72"
  },
  {
    src: "https://images.unsplash.com/photo-1707589338014-cb60c7e74471?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    alt: "Pool Area",
    height: "h-64"
  },
  {
    src: "https://images.unsplash.com/photo-1758448755969-8791367cf5c5?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    alt: "Premium Suite",
    height: "h-80"
  },
  {
    src: "https://images.unsplash.com/photo-1761039265583-9489b4246454?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    alt: "Room with Balcony",
    height: "h-64"
  },
  {
    src: "https://images.unsplash.com/photo-1483744724400-dd3bfb1b71ea?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    alt: "Poolside Dining",
    height: "h-72"
  },
  {
    src: "https://images.pexels.com/photos/10880468/pexels-photo-10880468.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    alt: "Hotel Night View",
    height: "h-80"
  },
  {
    src: "https://images.pexels.com/photos/3688261/pexels-photo-3688261.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    alt: "Twin Bedroom",
    height: "h-64"
  },
];

export default function GallerySection() {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (index) => setLightboxIndex(index);
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

        <div className="masonry-grid">
          {galleryImages.map((img, i) => (
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
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex items-end p-4">
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
