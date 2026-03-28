import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Search, Trash2, Pencil } from "lucide-react";

export default function BookingManagement() {
  const { adminApi } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editBooking, setEditBooking] = useState(null);
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", customer_email: "", room_number: 0, check_in: "", check_out: "", amount: 0, payment_status: "pending", status: "confirmed" });

  const fetchData = useCallback(async () => {
    try {
      const params = {};
      if (filterStatus && filterStatus !== "all") params.status = filterStatus;
      if (search) params.search = search;
      const [bRes, rRes] = await Promise.all([
        adminApi.get("/api/admin/bookings", { params }),
        adminApi.get("/api/admin/rooms")
      ]);
      setBookings(bRes.data);
      setRooms(rRes.data);
    } catch { toast.error("Failed to load data"); }
    setLoading(false);
  }, [adminApi, filterStatus, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditBooking(null);
    const availRoom = rooms.find(r => r.status === "available");
    setForm({ customer_name: "", customer_phone: "", customer_email: "", room_number: availRoom?.room_number || 101, check_in: new Date().toISOString().split("T")[0], check_out: new Date(Date.now() + 86400000).toISOString().split("T")[0], amount: availRoom?.price || 4500, payment_status: "pending", status: "confirmed" });
    setModalOpen(true);
  };

  const openEdit = (b) => {
    setEditBooking(b);
    setForm({ customer_name: b.customer_name, customer_phone: b.customer_phone, customer_email: b.customer_email, room_number: b.room_number, check_in: b.check_in, check_out: b.check_out, amount: b.amount || 0, payment_status: b.payment_status || "pending", status: b.status });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.customer_name || !form.customer_email) { toast.error("Name and email required"); return; }
    try {
      if (editBooking) {
        await adminApi.put(`/api/admin/bookings/${editBooking.id}`, form);
        toast.success("Booking updated");
      } else {
        await adminApi.post("/api/admin/bookings", form);
        toast.success("Booking created");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.detail || "Failed to save"); }
  };

  const handleDelete = async (b) => {
    if (!window.confirm("Delete this booking?")) return;
    try {
      await adminApi.delete(`/api/admin/bookings/${b.id}`);
      toast.success("Booking deleted");
      fetchData();
    } catch { toast.error("Failed to delete"); }
  };

  const statusBadge = (s) => {
    const cls = s === "confirmed" ? "bg-emerald-500/10 text-emerald-400" : s === "cancelled" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400";
    return <span className={`text-[10px] px-2 py-1 uppercase tracking-widest ${cls}`}>{s}</span>;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div data-testid="booking-management" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl text-white font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>Booking Management</h1>
          <p className="text-sm text-neutral-500 mt-1">{bookings.length} bookings</p>
        </div>
        <button data-testid="add-booking-btn" onClick={openCreate} className="flex items-center gap-2 bg-[#D4AF37] text-black px-5 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-[#FDE047] transition-all">
          <Plus size={14} /> New Booking
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input data-testid="booking-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full bg-[#141414] border border-[#1a1a1a] text-white pl-9 pr-4 py-2 text-sm focus:border-[#D4AF37] focus:outline-none" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 bg-[#141414] border-[#1a1a1a] text-white text-sm h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="bg-[#141414] border-[#262626] text-white">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-[#141414] border border-[#1a1a1a] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a1a1a]">
              {["Booking ID", "Customer", "Room", "Check-in", "Check-out", "Amount", "Payment", "Status", "Actions"].map(h => (
                <th key={h} className="text-left text-[10px] text-neutral-500 uppercase tracking-widest px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} data-testid={`booking-row-${b.id}`} className="border-b border-[#1a1a1a] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-neutral-400 text-xs">{b.booking_id || "—"}</td>
                <td className="px-4 py-3">
                  <p className="text-white text-sm">{b.customer_name}</p>
                  <p className="text-neutral-500 text-xs">{b.customer_email}</p>
                </td>
                <td className="px-4 py-3 text-white">{b.room_number}</td>
                <td className="px-4 py-3 text-neutral-400">{b.check_in}</td>
                <td className="px-4 py-3 text-neutral-400">{b.check_out}</td>
                <td className="px-4 py-3 text-[#D4AF37]">{(b.amount || 0).toLocaleString()}</td>
                <td className="px-4 py-3">{statusBadge(b.payment_status || "pending")}</td>
                <td className="px-4 py-3">{statusBadge(b.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button data-testid={`edit-booking-${b.id}`} onClick={() => openEdit(b)} className="p-1.5 text-neutral-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"><Pencil size={14} /></button>
                    <button data-testid={`delete-booking-${b.id}`} onClick={() => handleDelete(b)} className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && <p className="text-center text-neutral-500 py-8 text-sm">No bookings found</p>}
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg bg-[#141414] border-[#262626] text-white" data-testid="booking-form-modal">
          <DialogHeader>
            <DialogTitle className="text-white">{editBooking ? "Edit Booking" : "New Booking"}</DialogTitle>
            <DialogDescription className="text-neutral-500">Fill in booking details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 block">Customer Name</label>
                <input data-testid="booking-form-name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="w-full bg-[#0A0A0A] border border-[#262626] text-white px-3 py-2 text-sm focus:border-[#D4AF37] focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 block">Phone</label>
                <input data-testid="booking-form-phone" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className="w-full bg-[#0A0A0A] border border-[#262626] text-white px-3 py-2 text-sm focus:border-[#D4AF37] focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 block">Email</label>
              <input data-testid="booking-form-email" type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} className="w-full bg-[#0A0A0A] border border-[#262626] text-white px-3 py-2 text-sm focus:border-[#D4AF37] focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 block">Room</label>
                <Select value={String(form.room_number)} onValueChange={(v) => { const rm = rooms.find(r => r.room_number === parseInt(v)); setForm({ ...form, room_number: parseInt(v), amount: rm?.price || form.amount }); }}>
                  <SelectTrigger className="bg-[#0A0A0A] border-[#262626] text-white h-9"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#262626] text-white max-h-48">
                    {rooms.filter(r => r.status === "available" || r.room_number === form.room_number).map(r => (
                      <SelectItem key={r.room_number} value={String(r.room_number)}>Room {r.room_number} ({r.category})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 block">Amount (INR)</label>
                <input data-testid="booking-form-amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} className="w-full bg-[#0A0A0A] border border-[#262626] text-white px-3 py-2 text-sm focus:border-[#D4AF37] focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 block">Check-in</label>
                <input data-testid="booking-form-checkin" type="date" value={form.check_in} onChange={(e) => setForm({ ...form, check_in: e.target.value })} className="w-full bg-[#0A0A0A] border border-[#262626] text-white px-3 py-2 text-sm focus:border-[#D4AF37] focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 block">Check-out</label>
                <input data-testid="booking-form-checkout" type="date" value={form.check_out} onChange={(e) => setForm({ ...form, check_out: e.target.value })} className="w-full bg-[#0A0A0A] border border-[#262626] text-white px-3 py-2 text-sm focus:border-[#D4AF37] focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 block">Payment Status</label>
                <Select value={form.payment_status} onValueChange={(v) => setForm({ ...form, payment_status: v })}>
                  <SelectTrigger className="bg-[#0A0A0A] border-[#262626] text-white h-9"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#262626] text-white">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 block">Booking Status</label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="bg-[#0A0A0A] border-[#262626] text-white h-9"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#262626] text-white">
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <button data-testid="booking-form-save" onClick={handleSave} className="w-full bg-[#D4AF37] text-black py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#FDE047] transition-all mt-4">
            {editBooking ? "Update Booking" : "Create Booking"}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
