import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import api from "@/utils/apiRequest";
import DatePickerComponent from "./DatePickerComponent";
import BookingForm from "./BookingForm";

const statusColors = {
  available: "border-emerald-500/60 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
  booked: "border-red-500/40 bg-red-500/10 text-red-400 cursor-not-allowed opacity-60",
  selected: "border-[#D4AF37] bg-[#D4AF37] text-black",
  maintenance: "border-neutral-600 bg-neutral-800 text-neutral-600 cursor-not-allowed opacity-40",
};

export default function FloorBooking() {
  const [floors, setFloors] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingDates, setBookingDates] = useState(null);

  // Fetch floors
  useEffect(() => {
    const fetchFloors = async () => {
      try {
        const res = await api.get("/api/floors");
        setFloors(res.floors);
      } catch {
        // fallback data
        const fallback = [];
        for (let f = 1; f <= 3; f++) {
          const rooms = [];
          for (let i = 1; i <= 10; i++) {
            const num = f * 100 + i;
            rooms.push({
              number: num,
              status: ["available", "available", "booked", "maintenance"][num % 4],
              type: i <= 3 ? "Executive" : "Deluxe",
              price: i <= 3 ? 6500 : 4500,
              side: i <= 5 ? "left" : "right",
              id: String(num),
            });
          }
          fallback.push({ floor: f, label: `Floor ${f}`, rooms });
        }
        setFloors(fallback);
      }
    };

    fetchFloors();
  }, []);

  const handleRoomClick = (room) => {
    if (room.status !== "available") return;

    setSelectedRoom({
      id: room.id,
      room_number: room.number,
      category: room.type,
      price: room.price,
      amenities: ["WiFi", "AC", "TV"],
      floor: Math.floor(room.number / 100),
      status: room.status,
    });

    setShowBookingForm(true);
  };

  const getStatus = (room) => {
    if (selectedRoom?.room_number === room.number) return "selected";
    return room.status;
  };

  return (
    <section className="py-24 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl text-white">Book Your Room</h2>
        </div>

        {/* Date Picker */}
        <DatePickerComponent onDatesSelected={setBookingDates} />

        {bookingDates && (
          <Tabs defaultValue="1">
            <TabsList className="flex justify-center mb-8">
              {floors.map((f) => (
                <TabsTrigger key={f.floor} value={String(f.floor)}>
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TooltipProvider>
              {floors.map((floor) => (
                <TabsContent key={floor.floor} value={String(floor.floor)}>
                  <div className="bg-[#141414] p-6">

                    {/* Left Rooms */}
                    <div className="grid grid-cols-5 gap-3 mb-4">
                      {floor.rooms.filter(r => r.side === "left").map((room) => (
                        <Tooltip key={room.number}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleRoomClick(room)}
                              className={`p-4 border ${statusColors[getStatus(room)]}`}
                            >
                              {room.number}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            ₹{room.price}/night
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>

                    {/* Corridor */}
                    <div className="text-center text-gray-500 my-4">Corridor</div>

                    {/* Right Rooms */}
                    <div className="grid grid-cols-5 gap-3">
                      {floor.rooms.filter(r => r.side === "right").map((room) => (
                        <Tooltip key={room.number}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleRoomClick(room)}
                              className={`p-4 border ${statusColors[getStatus(room)]}`}
                            >
                              {room.number}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            ₹{room.price}/night
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>

                  </div>
                </TabsContent>
              ))}
            </TooltipProvider>
          </Tabs>
        )}
      </div>

      {/* Booking Form */}
      {showBookingForm && selectedRoom && bookingDates && (
        <BookingForm
          room={selectedRoom}
          checkIn={bookingDates.checkIn}
          checkOut={bookingDates.checkOut}
          onClose={() => setShowBookingForm(false)}
        />
      )}
    </section>
  );
}