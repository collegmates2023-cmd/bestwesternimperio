import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BedDouble, CalendarCheck, DollarSign, Wrench, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Dashboard() {
  const { adminApi } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminApi.get("/api/admin/dashboard");
        setData(res.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
      setLoading(false);
    };
    fetchDashboard();
  }, [adminApi]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map(r => (
          <div key={r} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-28 bg-[#141414] border border-[#1a1a1a] animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    { label: "Total Rooms", value: data?.total_rooms || 0, icon: BedDouble, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Available", value: data?.available || 0, icon: BedDouble, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Booked", value: data?.booked || 0, icon: CalendarCheck, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Maintenance", value: data?.maintenance || 0, icon: Wrench, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Revenue", value: `${(data?.total_revenue || 0).toLocaleString()}`, icon: DollarSign, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10", prefix: "INR " },
  ];

  return (
    <div data-testid="admin-dashboard" className="space-y-8">
      <div>
        <h1 className="text-2xl text-white font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Welcome back, Admin</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label} data-testid={`stat-${s.label.toLowerCase().replace(/\s+/g, '-')}`} className="bg-[#141414] border border-[#1a1a1a] p-5 hover:border-[#262626] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest">{s.label}</span>
              <div className={`p-1.5 ${s.bg} rounded-sm`}>
                <s.icon size={14} className={s.color} />
              </div>
            </div>
            <p className="text-2xl font-semibold text-white">{s.prefix || ""}{s.value}</p>
          </div>
        ))}
      </div>

      {/* Chart + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-[#141414] border border-[#1a1a1a] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm text-white font-medium flex items-center gap-2">
              <TrendingUp size={16} className="text-[#D4AF37]" /> Booking Trends
            </h3>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Last 7 Days</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.trends || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="date" tick={{ fill: '#737373', fontSize: 11 }} axisLine={{ stroke: '#1a1a1a' }} />
              <YAxis tick={{ fill: '#737373', fontSize: 11 }} axisLine={{ stroke: '#1a1a1a' }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#141414', border: '1px solid #262626', color: '#fff', fontSize: 12 }} />
              <Bar dataKey="bookings" fill="#D4AF37" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent bookings */}
        <div className="bg-[#141414] border border-[#1a1a1a] p-6">
          <h3 className="text-sm text-white font-medium mb-4">Recent Bookings</h3>
          {data?.recent_bookings?.length > 0 ? (
            <div className="space-y-3">
              {data.recent_bookings.map((b, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
                  <div>
                    <p className="text-sm text-white">{b.customer_name}</p>
                    <p className="text-[10px] text-neutral-500">Room {b.room_number}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 uppercase tracking-widest ${
                    b.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400" :
                    b.status === "cancelled" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                  }`}>{b.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-sm">No bookings yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
