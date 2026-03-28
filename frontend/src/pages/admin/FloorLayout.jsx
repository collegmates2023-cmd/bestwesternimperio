import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const statusColors = {
  available: "border-emerald-500/60 bg-emerald-500/10 text-emerald-400",
  booked: "border-red-500/40 bg-red-500/10 text-red-400",
  maintenance: "border-neutral-600 bg-neutral-800 text-neutral-500",
};

export default function FloorLayout() {
  const { adminApi } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    try {
      const { data } = await adminApi.get("/api/admin/rooms");
      setRooms(data);
    } catch { toast.error("Failed to load rooms"); }
    setLoading(false);
  }, [adminApi]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const updateStatus = async (room, newStatus) => {
    try {
      await adminApi.put(`/api/admin/rooms/${room.id}/status`, { status: newStatus });
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: newStatus } : r));
      toast.success(`Room ${room.room_number} set to ${newStatus}`);
    } catch { toast.error("Failed to update status"); }
  };

  const floors = [1, 2, 3];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div data-testid="floor-layout-admin" className="space-y-6">
      <div>
        <h1 className="text-2xl text-white font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>Floor Layout Control</h1>
        <p className="text-sm text-neutral-500 mt-1">Update room statuses in real-time. Changes sync to the public booking page.</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6">
        {[{ color: "bg-emerald-500/40", label: "Available" }, { color: "bg-red-500/40", label: "Booked" }, { color: "bg-neutral-700", label: "Maintenance" }].map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs text-neutral-400">
            <span className={`w-4 h-4 ${item.color}`} />
            {item.label}
          </div>
        ))}
      </div>

      <Tabs defaultValue="1" className="w-full">
        <TabsList className="bg-[#141414] border border-[#1a1a1a]">
          {floors.map((f) => (
            <TabsTrigger key={f} value={String(f)} data-testid={`admin-floor-tab-${f}`} className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black text-white px-6 text-sm tracking-widest uppercase">
              Floor {f}
            </TabsTrigger>
          ))}
        </TabsList>

        {floors.map((floor) => {
          const floorRooms = rooms.filter(r => r.floor === floor);
          const leftRooms = floorRooms.filter(r => r.side === "left").sort((a, b) => a.room_number - b.room_number);
          const rightRooms = floorRooms.filter(r => r.side === "right").sort((a, b) => a.room_number - b.room_number);

          return (
            <TabsContent key={floor} value={String(floor)}>
              <div className="bg-[#141414] border border-[#1a1a1a] p-6">
                {/* Left side */}
                <div className="grid grid-cols-5 gap-3 mb-4">
                  {leftRooms.map((room) => (
                    <RoomCell key={room.id} room={room} onStatusChange={updateStatus} />
                  ))}
                </div>

                {/* Corridor */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-[2px]" style={{ background: "repeating-linear-gradient(90deg, #262626 0px, #262626 10px, transparent 10px, transparent 20px)" }} />
                  <span className="text-xs text-neutral-600 tracking-[0.3em] uppercase whitespace-nowrap">Corridor</span>
                  <div className="flex-1 h-[2px]" style={{ background: "repeating-linear-gradient(90deg, #262626 0px, #262626 10px, transparent 10px, transparent 20px)" }} />
                </div>

                {/* Right side */}
                <div className="grid grid-cols-5 gap-3">
                  {rightRooms.map((room) => (
                    <RoomCell key={room.id} room={room} onStatusChange={updateStatus} />
                  ))}
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function RoomCell({ room, onStatusChange }) {
  return (
    <div data-testid={`admin-room-${room.room_number}`} className={`aspect-square border flex flex-col items-center justify-center p-2 transition-all ${statusColors[room.status]}`}>
      <span className="font-semibold text-sm">{room.room_number}</span>
      <span className="text-[9px] opacity-70">{room.category}</span>
      <span className="text-[9px] text-[#D4AF37] mt-0.5">{room.price?.toLocaleString()}</span>
      <Select value={room.status} onValueChange={(v) => onStatusChange(room, v)}>
        <SelectTrigger data-testid={`admin-room-status-${room.room_number}`} className="mt-1 h-6 text-[9px] bg-transparent border-white/20 text-current px-1 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#141414] border-[#262626] text-white">
          <SelectItem value="available" className="text-xs">Available</SelectItem>
          <SelectItem value="booked" className="text-xs">Booked</SelectItem>
          <SelectItem value="maintenance" className="text-xs">Maintenance</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
