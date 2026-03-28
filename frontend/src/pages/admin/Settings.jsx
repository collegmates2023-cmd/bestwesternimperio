import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const { adminApi } = useAuth();
  const [settings, setSettings] = useState({ hotel_name: "", address: "", phone: "", email: "", logo_url: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await adminApi.get("/api/admin/settings");
        setSettings(data);
      } catch { /* use defaults */ }
      setLoading(false);
    };
    fetch();
  }, [adminApi]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.put("/api/admin/settings", settings);
      toast.success("Settings saved successfully");
    } catch { toast.error("Failed to save settings"); }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div data-testid="settings-page" className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl text-white font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage hotel information</p>
      </div>

      <div className="bg-[#141414] border border-[#1a1a1a] p-6 space-y-6">
        <h3 className="text-sm text-white font-medium">Hotel Details</h3>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 block">Hotel Name</label>
            <input
              data-testid="settings-hotel-name"
              value={settings.hotel_name}
              onChange={(e) => setSettings({ ...settings, hotel_name: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-[#262626] text-white px-4 py-3 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 block">Address</label>
            <textarea
              data-testid="settings-address"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              rows={2}
              className="w-full bg-[#0A0A0A] border border-[#262626] text-white px-4 py-3 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 block">Phone</label>
              <input
                data-testid="settings-phone"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full bg-[#0A0A0A] border border-[#262626] text-white px-4 py-3 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 block">Email</label>
              <input
                data-testid="settings-email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full bg-[#0A0A0A] border border-[#262626] text-white px-4 py-3 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 block">Logo URL</label>
            <input
              data-testid="settings-logo"
              value={settings.logo_url}
              onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
              placeholder="https://..."
              className="w-full bg-[#0A0A0A] border border-[#262626] text-white px-4 py-3 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors"
            />
          </div>
        </div>

        <button
          data-testid="settings-save-btn"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#D4AF37] text-black px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#FDE047] transition-all disabled:opacity-50"
        >
          <Save size={14} /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
