import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wifi, Wind, Coffee, Tv, Bath, BedDouble, Maximize2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import api from "@/utils/apiRequest";

const amenityIcons = {
  "King Bed": BedDouble,
  "WiFi": Wifi,
  "AC": Wind,
  "Mini Bar": Coffee,
  "Smart TV": Tv,
  "Rain Shower": Bath,
  "Bathtub": Bath,
  "Room Service": Coffee,
};

export default function RoomsSection() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get('/api/rooms');
        setRooms(res.rooms);
      } catch {
        setRooms([
          {
            id: "deluxe", name: "Deluxe Room", price: 4500,
            description: "Spacious deluxe room with modern amenities.",
            amenities: ["King Bed", "WiFi", "AC", "Mini Bar", "Smart TV", "Rain Shower"],
            images: ["https://customer-assets.emergentagent.com/job_imperio-luxury/artifacts/980zdopb_c0ce331a7c5311e894780266fbcf4d94.jpg"],
            size: "350 sq ft"
          },
          {
            id: "executive", name: "Executive Room", price: 6500,
            description: "Premium executive suite with separate living area.",
            amenities: ["King Bed", "WiFi", "AC", "Mini Bar", "Smart TV", "Bathtub", "Lounge Area"],
            images: ["https://customer-assets.emergentagent.com/job_imperio-luxury/artifacts/980zdopb_c0ce331a7c5311e894780266fbcf4d94.jpg"],
            size: "500 sq ft"
          }
        ]);
      }
    };
    fetchRooms();
  }, []);

  const openModal = (room) => {
    setSelectedRoom(room);
    setImageIndex(0);
  };

  const nextImage = () => {
    if (selectedRoom) setImageIndex((prev) => (prev + 1) % selectedRoom.images.length);
  };

  const prevImage = () => {
    if (selectedRoom) setImageIndex((prev) => (prev - 1 + selectedRoom.images.length) % selectedRoom.images.length);
  };

  return (
    <section id="rooms" data-testid="rooms-section" className="py-24 md:py-32 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="overline mb-4">Accommodation</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Our Rooms
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {rooms.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              data-testid={`room-card-${room.id}`}
              className="group bg-[#141414] border border-[#262626] hover:border-[#D4AF37]/50 transition-all duration-500 cursor-pointer"
              onClick={() => openModal(room)}
            >
              <div className="relative overflow-hidden h-72">
                <img
                  src={room.images[0]}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-[#D4AF37] text-black px-4 py-2 text-xs uppercase tracking-widest font-semibold">
                  From {room.price.toLocaleString()}/night
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-medium text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {room.name}
                  </h3>
                  <span className="text-xs text-neutral-500 flex items-center gap-1">
                    <Maximize2 size={12} /> {room.size}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                  {room.amenities.slice(0, 5).map((a) => {
                    const Icon = amenityIcons[a] || Wifi;
                    return (
                      <span key={a} className="flex items-center gap-1.5 text-xs text-neutral-400">
                        <Icon size={12} className="text-[#D4AF37]" /> {a}
                      </span>
                    );
                  })}
                </div>

                <button
                  data-testid={`view-details-${room.id}`}
                  className="text-[#D4AF37] text-xs uppercase tracking-widest hover:text-[#FDE047] transition-colors"
                >
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Room Detail Modal */}
      <Dialog open={!!selectedRoom} onOpenChange={(open) => !open && setSelectedRoom(null)}>
        <DialogContent
          data-testid="room-detail-modal"
          className="max-w-2xl bg-[#141414] border-[#262626] text-white p-0 overflow-hidden"
        >
          <div className="relative h-72 md:h-80">
            {selectedRoom && (
              <>
                <img
                  src={selectedRoom.images[imageIndex]}
                  alt={selectedRoom.name}
                  className="w-full h-full object-cover"
                />
                {selectedRoom.images.length > 1 && (
                  <>
                    <button
                      data-testid="room-modal-prev-img"
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 p-2 hover:bg-black/80 transition-colors"
                    >
                      <ChevronLeft size={20} className="text-white" />
                    </button>
                    <button
                      data-testid="room-modal-next-img"
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 p-2 hover:bg-black/80 transition-colors"
                    >
                      <ChevronRight size={20} className="text-white" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                      {selectedRoom.images.map((_, idx) => (
                        <span
                          key={idx}
                          className={`w-2 h-2 rounded-full transition-colors ${idx === imageIndex ? "bg-[#D4AF37]" : "bg-white/40"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <div className="p-6">
            <DialogHeader>
              <DialogTitle
                className="text-2xl text-white mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {selectedRoom?.name}
              </DialogTitle>
              <DialogDescription className="text-neutral-400">
                {selectedRoom?.size} | Starting from {selectedRoom?.price?.toLocaleString()} per night
              </DialogDescription>
            </DialogHeader>

            <p className="text-sm text-neutral-400 leading-relaxed mt-4 mb-6">
              {selectedRoom?.description}
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              {selectedRoom?.amenities.map((a) => {
                const Icon = amenityIcons[a] || Wifi;
                return (
                  <span key={a} className="flex items-center gap-2 text-xs text-neutral-300 bg-[#1A1A1A] px-3 py-2 border border-[#262626]">
                    <Icon size={14} className="text-[#D4AF37]" /> {a}
                  </span>
                );
              })}
            </div>

            <button
              data-testid="room-modal-book-btn"
              onClick={() => {
                setSelectedRoom(null);
                const el = document.querySelector("#booking");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full bg-[#D4AF37] text-black py-4 text-sm uppercase tracking-widest font-semibold hover:bg-[#FDE047] transition-all duration-300"
            >
              Book Now
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
