import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, LayoutGrid, List } from "lucide-react";

const defaultRoom = { room_number: 0, floor: 1, category: "Deluxe", price: 4500, status: "available", description: "", amenities: ["WiFi", "AC", "Smart TV"], images: ["https://customer-assets.emergentagent.com/job_imperio-luxury/artifacts/980zdopb_c0ce331a7c5311e894780266fbcf4d94.jpg"], side: "left" };

export default function RoomManagement() {
  const { adminApi } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table");
  const [filterFloor, setFilterFloor] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [form, setForm] = useState({ ...defaultRoom });

  const fetchRooms = useCallback(async () => {
    try {
      const params = {};
      if (filterFloor) params.floor = filterFloor;
      if (filterCategory) params.category = filterCategory;
      if (filterStatus) params.status = filterStatus;
      if (search) params.search = search;
      const { data } = await adminApi.get("/api/admin/rooms", { params });
      setRooms(data);
    } catch { toast.error("Failed to load rooms"); }
    setLoading(false);
  }, [adminApi, filterFloor, filterCategory, filterStatus, search]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const openCreate = () => { setEditRoom(null); setForm({ ...defaultRoom, room_number: Math.max(...rooms.map(r => r.room_number), 100) + 1 }); setModalOpen(true); };
  const openEdit = (room) => { setEditRoom(room); setForm({ room_number: room.room_number, floor: room.floor, category: room.category, price: room.price, status: room.status, description: room.description || "", amenities: room.amenities || [], images: room.images || [], side: room.side || "left" }); setModalOpen(true); };

  const handleSave = async () => {
    try {
      if (editRoom) {
        await adminApi.put(`/api/admin/rooms/${editRoom.id}`, form);
        toast.success("Room updated");
      } else {
        await adminApi.post("/api/admin/rooms", form);
        toast.success("Room created");
      }
      setModalOpen(false);
      fetchRooms();
    } catch (err) { toast.error(err.response?.data?.detail || "Failed to save"); }
  };

  const handleDelete = async (room) => {
    if (!window.confirm(`Delete room ${room.room_number}?`)) return;
    try {
      await adminApi.delete(`/api/admin/rooms/${room.id}`);
      toast.success("Room deleted");
      fetchRooms();
    } catch { toast.error("Failed to delete"); }
  };

  const statusBadge = (s) => {
    const cls = s === "available" ? "bg-emerald-500/10 text-emerald-400" : s === "booked" ? "bg-red-500/10 text-red-400" : "bg-neutral-500/10 text-neutral-400";
    return <span className={`text-[10px] px-2 py-1 uppercase tracking-widest ${cls}`}>{s}</span>;
  };

  return (
    <div data-testid="room-management" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl text-white font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>Room Management</h1>
          <p className="text-sm text-neutral-500 mt-1">{rooms.length} rooms total</p>
        </div>
        <button data-testid="add-room-btn" onClick={openCreate} className="flex items-center gap-2 bg-[#D4AF37] text-black px-5 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-[#FDE047] transition-all">
          <Plus size={14} /> Add Room
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input data-testid="room-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search room number..." className="w-full bg-[#141414] border border-[#1a1a1a] text-white pl-9 pr-4 py-2 text-sm focus:border-[#D4AF37] focus:outline-none" />
        </div>
        <Select value={filterFloor} onValueChange={setFilterFloor}>
          <SelectTrigger data-testid="filter-floor" className="w-32 bg-[#141414] border-[#1a1a1a] text-white text-sm h-9"><SelectValue placeholder="Floor" /></SelectTrigger>
          <SelectContent className="bg-[#141414] border-[#262626] text-white">
            <SelectItem value="all">All Floors</SelectItem>
            <SelectItem value="1">Floor 1</SelectItem>
            <SelectItem value="2">Floor 2</SelectItem>
            <SelectItem value="3">Floor 3</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger data-testid="filter-category" className="w-36 bg-[#141414] border-[#1a1a1a] text-white text-sm h-9"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent className="bg-[#141414] border-[#262626] text-white">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Deluxe">Deluxe</SelectItem>
            <SelectItem value="Executive">Executive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger data-testid="filter-status" className="w-36 bg-[#141414] border-[#1a1a1a] text-white text-sm h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="bg-[#141414] border-[#262626] text-white">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="booked">Booked</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border border-[#1a1a1a]">
          <button data-testid="view-table" onClick={() => setViewMode("table")} className={`p-2 ${viewMode === "table" ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "text-neutral-500"}`}><List size={16} /></button>
          <button data-testid="view-grid" onClick={() => setViewMode("grid")} className={`p-2 ${viewMode === "grid" ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "text-neutral-500"}`}><LayoutGrid size={16} /></button>
        </div>
      </div>

      {/* Table view */}
      {viewMode === "table" ? (
        <div className="bg-[#141414] border border-[#1a1a1a] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {["Room", "Floor", "Category", "Price", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left text-[10px] text-neutral-500 uppercase tracking-widest px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} data-testid={`room-row-${room.room_number}`} className="border-b border-[#1a1a1a] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{room.room_number}</td>
                  <td className="px-4 py-3 text-neutral-400">Floor {room.floor}</td>
                  <td className="px-4 py-3 text-neutral-400">{room.category}</td>
                  <td className="px-4 py-3 text-[#D4AF37]">{room.price?.toLocaleString()}</td>
                  <td className="px-4 py-3">{statusBadge(room.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button data-testid={`edit-room-${room.room_number}`} onClick={() => openEdit(room)} className="p-1.5 text-neutral-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"><Pencil size={14} /></button>
                      <button data-testid={`delete-room-${room.room_number}`} onClick={() => handleDelete(room)} className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rooms.length === 0 && <p className="text-center text-neutral-500 py-8 text-sm">No rooms found</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <div key={room.id} data-testid={`room-card-grid-${room.room_number}`} className="bg-[#141414] border border-[#1a1a1a] hover:border-[#262626] transition-colors">
              {room.images?.[0] && <img src={room.images[0]} alt={`Room ${room.room_number}`} className="w-full h-36 object-cover" />}
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Room {room.room_number}</span>
                  {statusBadge(room.status)}
                </div>
                <p className="text-xs text-neutral-500">Floor {room.floor} | {room.category}</p>
                <p className="text-[#D4AF37] text-sm font-medium">{room.price?.toLocaleString()}/night</p>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => openEdit(room)} className="flex-1 text-center py-1.5 text-xs border border-[#262626] text-neutral-400 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors">Edit</button>
                  <button onClick={() => handleDelete(room)} className="flex-1 text-center py-1.5 text-xs border border-[#262626] text-neutral-400 hover:text-red-400 hover:border-red-500 transition-colors">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg bg-[#141414] border-[#262626] text-white" data-testid="room-form-modal">
          <DialogHeader>
            <DialogTitle className="text-white">{editRoom ? "Edit Room" : "Add Room"}</DialogTitle>
            <DialogDescription className="text-neutral-500">Fill in the room details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 block">Room Number</label>
                <input data-testid="room-form-number" type="number" value={form.room_number} onChange={(e) => setForm({ ...form, room_number: parseInt(e.target.value) || 0 })} className="w-full bg-[#0A0A0A] border border-[#262626] text-white px-3 py-2 text-sm focus:border-[#D4AF37] focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 block">Floor</label>
                <Select value={String(form.floor)} onValueChange={(v) => setForm({ ...form, floor: parseInt(v) })}>
                  <SelectTrigger className="bg-[#0A0A0A] border-[#262626] text-white h-9"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#262626] text-white">
                    <SelectItem value="1">Floor 1</SelectItem>
                    <SelectItem value="2">Floor 2</SelectItem>
                    <SelectItem value="3">Floor 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 block">Category</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v, price: v === "Executive" ? 6500 : 4500 })}>
                  <SelectTrigger className="bg-[#0A0A0A] border-[#262626] text-white h-9"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#262626] text-white">
                    <SelectItem value="Deluxe">Deluxe</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 block">Price/Night (INR)</label>
                <input data-testid="room-form-price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="w-full bg-[#0A0A0A] border border-[#262626] text-white px-3 py-2 text-sm focus:border-[#D4AF37] focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 block">Status</label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="bg-[#0A0A0A] border-[#262626] text-white h-9"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#262626] text-white">
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 block">Side</label>
                <Select value={form.side} onValueChange={(v) => setForm({ ...form, side: v })}>
                  <SelectTrigger className="bg-[#0A0A0A] border-[#262626] text-white h-9"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#262626] text-white">
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 block">Description</label>
              <textarea data-testid="room-form-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full bg-[#0A0A0A] border border-[#262626] text-white px-3 py-2 text-sm focus:border-[#D4AF37] focus:outline-none resize-none" />
            </div>
          </div>
          <button data-testid="room-form-save" onClick={handleSave} className="w-full bg-[#D4AF37] text-black py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#FDE047] transition-all mt-4">
            {editRoom ? "Update Room" : "Create Room"}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
