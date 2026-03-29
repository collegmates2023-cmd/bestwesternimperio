import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
<<<<<<< HEAD
import api from "@/config/api";
import DatePickerComponent from "./DatePickerComponent";
import BookingForm from "./BookingForm";
=======
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
>>>>>>> 13412ab8749f8fc6a70ea46c62b0613254000ca4

const statusColors = {
  available: "border-emerald-500/60 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
  booked: "border-red-500/40 bg-red-500/10 text-red-400 cursor-not-allowed opacity-60",
  selected: "border-[#D4AF37] bg-[#D4AF37] text-black",
  maintenance: "border-neutral-600 bg-neutral-800 text-neutral-600 cursor-not-allowed opacity-40",
};

export default function FloorBooking() {
  const [floors, setFloors] = useState([]);
<<<<<<< HEAD
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [bookingDates, setBookingDates] = useState(null);

  // Fetch floors on component mount
  useEffect(() => {
    const fetchFloors = async () => {
      try {
        const res = await api.get('/api/floors');
        setFloors(res.data.floors);
      } catch (err) {
        console.error("Error fetching floors:", err);
=======
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [detailRoom, setDetailRoom] = useState(null);

  useEffect(() => {
    const fetchFloors = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/floors`);
        setFloors(res.data.floors);
      } catch {
>>>>>>> 13412ab8749f8fc6a70ea46c62b0613254000ca4
        // fallback
        const fallback = [];
        for (let f = 1; f <= 3; f++) {
          const rooms = [];
          for (let i = 1; i <= 10; i++) {
            const num = f * 100 + i;
            const statuses = ["available", "available", "available", "booked", "maintenance"];
            rooms.push({
              number: num,
              status: statuses[num % 5],
              type: i <= 3 ? "Executive" : "Deluxe",
              price: i <= 3 ? 6500 : 4500,
              side: i <= 5 ? "left" : "right",
<<<<<<< HEAD
              id: String(num),
=======
>>>>>>> 13412ab8749f8fc6a70ea46c62b0613254000ca4
            });
          }
          fallback.push({ floor: f, label: `Floor ${f}`, rooms });
        }
        setFloors(fallback);
      }
    };
    fetchFloors();
  }, []);

<<<<<<< HEAD
  // Update check-in/check-out when booking data changes
  useEffect(() => {
    if (bookingDates) {
      setCheckIn(bookingDates.checkIn);
      setCheckOut(bookingDates.checkOut);
    }
  }, [bookingDates]);

  const handleDatesSelected = (dates) => {
    setBookingDates(dates);
  };

  const handleRoomSelected = (room) => {
    const formattedRoom = {
      id: room.id || String(room.room_number),
      room_number: room.room_number,
      category: room.category || "Standard",
      price: room.price,
      amenities: room.amenities || ["WiFi", "AC", "TV", "mini Bar"],
      floor: room.floor,
      status: room.status,
    };
    setSelectedRoom(formattedRoom);
    setShowBookingForm(true);
  };

  const handleBookingSubmit = (booking) => {
    setShowBookingForm(false);
    setSelectedRoom(null);
    // Refetch floors to update availability
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const toggleRoom = (room) => {
    if (room.status === "booked" || room.status === "maintenance") return;
    // Single room booking - select just this room
    setSelectedRoom({
      id: room.id || String(room.number),
      room_number: room.number,
      category: room.type,
      price: room.price,
      amenities: ["WiFi", "AC", "TV", "mini Bar"],
      floor: room.floor,
      status: room.status,
    });
    setShowBookingForm(true);
  };

  const getStatus = (room) => {
    if (selectedRoom && selectedRoom.room_number === room.number) return "selected";
    return room.status;
  }
=======
  const toggleRoom = (room) => {
    if (room.status === "booked" || room.status === "maintenance") return;
    setSelectedRooms((prev) =>
      prev.includes(room.number)
        ? prev.filter((n) => n !== room.number)
        : [...prev, room.number]
    );
  };

  const getStatus = (room) => {
    if (selectedRooms.includes(room.number)) return "selected";
    return room.status;
  };
>>>>>>> 13412ab8749f8fc6a70ea46c62b0613254000ca4

  return (
    <section id="booking" data-testid="floor-booking-section" className="py-24 md:py-32 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
<<<<<<< HEAD
          <p className="overline mb-4">Book Your Stay</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Reserve Your Perfect Room
          </h2>
        </motion.div>

        {/* Date Picker Section */}
        <div className="mb-10">
          <DatePickerComponent onDatesSelected={handleDatesSelected} />
        </div>

        {/* Show FloorLayout only if dates are selected */}
        {bookingDates && (
          <>
            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
              {[
                { color: "bg-emerald-500/40", label: "Available" },
                { color: "bg-red-500/40", label: "Booked" },
                { color: "bg-[#D4AF37]", label: "Selected" },
                { color: "bg-neutral-700", label: "Maintenance" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className={`w-4 h-4 ${item.color}`} />
                  {item.label}
                </div>
              ))}
            </div>

            <Tabs defaultValue="1" className="w-full">
              <TabsList className="bg-[#141414] border border-[#262626] mx-auto flex w-fit mb-8">
                {floors.map((f) => (
                  <TabsTrigger
                    key={f.floor}
                    value={String(f.floor)}
                    data-testid={`floor-tab-${f.floor}`}
                    className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black text-white px-6 py-2 text-sm tracking-widest uppercase"
                  >
                    {f.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TooltipProvider delayDuration={200}>
                {floors.map((floor) => (
                  <TabsContent key={floor.floor} value={String(floor.floor)}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      className="bg-[#141414] border border-[#262626] p-6 md:p-8"
                    >
                      {/* Left side rooms */}
                      <div className="grid grid-cols-5 gap-3 md:gap-4 mb-4">
                        {floor.rooms.filter((r) => r.side === "left").map((room) => (
                          <Tooltip key={room.number}>
                            <TooltipTrigger asChild>
                              <motion.button
                                data-testid={`room-${room.number}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleRoom(room)}
                                className={`aspect-square flex flex-col items-center justify-center border text-xs md:text-sm font-medium transition-all duration-300 room-seat-glow ${statusColors[getStatus(room)]}`}
                              >
                                <span className="font-semibold">{room.number}</span>
                                <span className="text-[8px] md:text-[10px] opacity-70 mt-0.5">{room.type}</span>
                              </motion.button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1A1A1A] border-[#262626] text-white">
                              <p className="font-medium">{room.type} Room {room.number}</p>
                              <p className="text-[#D4AF37] text-xs">₹{room.price.toLocaleString()}/night</p>
                              <p className="text-neutral-500 text-xs capitalize">{room.status}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>

                      {/* Corridor */}
                      <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 corridor-line" />
                        <span className="text-xs text-neutral-600 tracking-[0.3em] uppercase whitespace-nowrap">Corridor</span>
                        <div className="flex-1 corridor-line" />
                      </div>

                      {/* Right side rooms */}
                      <div className="grid grid-cols-5 gap-3 md:gap-4">
                        {floor.rooms.filter((r) => r.side === "right").map((room) => (
                          <Tooltip key={room.number}>
                            <TooltipTrigger asChild>
                              <motion.button
                                data-testid={`room-${room.number}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleRoom(room)}
                                className={`aspect-square flex flex-col items-center justify-center border text-xs md:text-sm font-medium transition-all duration-300 room-seat-glow ${statusColors[getStatus(room)]}`}
                              >
                                <span className="font-semibold">{room.number}</span>
                                <span className="text-[8px] md:text-[10px] opacity-70 mt-0.5">{room.type}</span>
                              </motion.button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1A1A1A] border-[#262626] text-white">
                              <p className="font-medium">{room.type} Room {room.number}</p>
                              <p className="text-[#D4AF37] text-xs">₹{room.price.toLocaleString()}/night</p>
                              <p className="text-neutral-500 text-xs capitalize">{room.status}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </motion.div>

                    {/* Selected summary */}
                    {selectedRoom && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 bg-[#141414] border border-[#D4AF37]/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-sm text-neutral-400">Selected Room:</p>
                          <p className="text-white font-medium mt-1">
                            Room #{selectedRoom.room_number} - {selectedRoom.category}
                          </p>
                        </div>
                        <button
                          data-testid="proceed-booking-btn"
                          onClick={() => setShowBookingForm(true)}
                          className="bg-[#D4AF37] text-black px-8 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#FDE047] transition-all duration-300"
                        >
                          Proceed to Book
                        </button>
                      </motion.div>
                    )}
                  </TabsContent>
                ))}
              </TooltipProvider>
            </Tabs>
          </>
        )}

        {!bookingDates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-neutral-400 text-lg">Please select your check-in and check-out dates to view available rooms</p>
          </motion.div>
        )}
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedRoom && bookingDates && (
        <BookingForm
          room={selectedRoom}
          checkIn={bookingDates.checkIn}
          checkOut={bookingDates.checkOut}
          onBookingSubmit={handleBookingSubmit}
          onClose={() => setShowBookingForm(false)}
        />
      )}
=======
          <p className="overline mb-4">Select Your Room</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Floor Plan Booking
          </h2>
        </motion.div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
          {[
            { color: "bg-emerald-500/40", label: "Available" },
            { color: "bg-red-500/40", label: "Booked" },
            { color: "bg-[#D4AF37]", label: "Selected" },
            { color: "bg-neutral-700", label: "Maintenance" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs text-neutral-400">
              <span className={`w-4 h-4 ${item.color}`} />
              {item.label}
            </div>
          ))}
        </div>

        <Tabs defaultValue="1" className="w-full">
          <TabsList className="bg-[#141414] border border-[#262626] mx-auto flex w-fit mb-8">
            {floors.map((f) => (
              <TabsTrigger
                key={f.floor}
                value={String(f.floor)}
                data-testid={`floor-tab-${f.floor}`}
                className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black text-white px-6 py-2 text-sm tracking-widest uppercase"
              >
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TooltipProvider delayDuration={200}>
            {floors.map((floor) => (
              <TabsContent key={floor.floor} value={String(floor.floor)}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="bg-[#141414] border border-[#262626] p-6 md:p-8"
                >
                  {/* Left side rooms */}
                  <div className="grid grid-cols-5 gap-3 md:gap-4 mb-4">
                    {floor.rooms.filter((r) => r.side === "left").map((room) => (
                      <Tooltip key={room.number}>
                        <TooltipTrigger asChild>
                          <motion.button
                            data-testid={`room-${room.number}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleRoom(room)}
                            onDoubleClick={() => room.status === "available" && setDetailRoom(room)}
                            className={`aspect-square flex flex-col items-center justify-center border text-xs md:text-sm font-medium transition-all duration-300 room-seat-glow ${statusColors[getStatus(room)]}`}
                          >
                            <span className="font-semibold">{room.number}</span>
                            <span className="text-[8px] md:text-[10px] opacity-70 mt-0.5">{room.type}</span>
                          </motion.button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1A1A1A] border-[#262626] text-white">
                          <p className="font-medium">{room.type} Room {room.number}</p>
                          <p className="text-[#D4AF37] text-xs">{room.price.toLocaleString()}/night</p>
                          <p className="text-neutral-500 text-xs capitalize">{room.status}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>

                  {/* Corridor */}
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 corridor-line" />
                    <span className="text-xs text-neutral-600 tracking-[0.3em] uppercase whitespace-nowrap">Corridor</span>
                    <div className="flex-1 corridor-line" />
                  </div>

                  {/* Right side rooms */}
                  <div className="grid grid-cols-5 gap-3 md:gap-4">
                    {floor.rooms.filter((r) => r.side === "right").map((room) => (
                      <Tooltip key={room.number}>
                        <TooltipTrigger asChild>
                          <motion.button
                            data-testid={`room-${room.number}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleRoom(room)}
                            onDoubleClick={() => room.status === "available" && setDetailRoom(room)}
                            className={`aspect-square flex flex-col items-center justify-center border text-xs md:text-sm font-medium transition-all duration-300 room-seat-glow ${statusColors[getStatus(room)]}`}
                          >
                            <span className="font-semibold">{room.number}</span>
                            <span className="text-[8px] md:text-[10px] opacity-70 mt-0.5">{room.type}</span>
                          </motion.button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1A1A1A] border-[#262626] text-white">
                          <p className="font-medium">{room.type} Room {room.number}</p>
                          <p className="text-[#D4AF37] text-xs">{room.price.toLocaleString()}/night</p>
                          <p className="text-neutral-500 text-xs capitalize">{room.status}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </motion.div>

                {/* Selected summary */}
                {selectedRooms.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 bg-[#141414] border border-[#D4AF37]/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm text-neutral-400">Selected Rooms:</p>
                      <p className="text-white font-medium mt-1">
                        {selectedRooms.sort().join(", ")}
                      </p>
                    </div>
                    <button
                      data-testid="proceed-booking-btn"
                      className="bg-[#D4AF37] text-black px-8 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#FDE047] transition-all duration-300"
                    >
                      Proceed to Book ({selectedRooms.length} {selectedRooms.length === 1 ? "room" : "rooms"})
                    </button>
                  </motion.div>
                )}
              </TabsContent>
            ))}
          </TooltipProvider>
        </Tabs>
      </div>

      {/* Room detail popup */}
      <Dialog open={!!detailRoom} onOpenChange={(open) => !open && setDetailRoom(null)}>
        <DialogContent className="bg-[#141414] border-[#262626] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Room {detailRoom?.number}
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              {detailRoom?.type} Room
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Price per night</span>
              <span className="text-[#D4AF37] font-semibold">{detailRoom?.price?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Status</span>
              <span className="text-emerald-400 capitalize">{detailRoom?.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Floor</span>
              <span className="text-white">{detailRoom ? Math.floor(detailRoom.number / 100) : ""}</span>
            </div>
          </div>
          <button
            data-testid="room-popup-select-btn"
            onClick={() => {
              if (detailRoom) toggleRoom(detailRoom);
              setDetailRoom(null);
            }}
            className="w-full mt-4 bg-[#D4AF37] text-black py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#FDE047] transition-all duration-300"
          >
            {selectedRooms.includes(detailRoom?.number) ? "Deselect Room" : "Select Room"}
          </button>
        </DialogContent>
      </Dialog>
>>>>>>> 13412ab8749f8fc6a70ea46c62b0613254000ca4
    </section>
  );
}
