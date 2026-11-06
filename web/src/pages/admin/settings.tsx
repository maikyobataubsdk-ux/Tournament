import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Settings, Save, ShieldCheck } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({
    site_title: "Booyahesports",
    domain: "Booyahesports.in",
    contact_email: "support@booyahesports.in",
    banner_title: "Battle for Glory in Free Fire MAX",
    banner_subtitle: "India's Premier Free-Entry Tournament Platform. Play, Compete, Dominate.",
    registration_enabled: true,
    maintenance_mode: false,
    maintenance_message: "Booyahesports is currently undergoing scheduled maintenance. Please check back soon.",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const s = await fetchAPI("/admin/settings");
        if (s && s.site_title) setSettings(s);
      } catch (e) {
        console.error(e);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchAPI("/admin/settings", {
        method: "PATCH",
        headers: { Authorization: "Bearer demo" },
        body: JSON.stringify(settings),
      });
      alert("Platform settings updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Global Platform & CMS Settings">
      <div className="max-w-3xl bg-[#0e131f] border border-[#1a2333] p-8 rounded-2xl">
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Branding & Domain</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 block mb-1 font-medium">Platform Title</label>
                <input
                  type="text"
                  value={settings.site_title || ""}
                  onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                  className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1 font-medium">Domain Name</label>
                <input
                  type="text"
                  value={settings.domain || ""}
                  onChange={(e) => setSettings({ ...settings, domain: e.target.value })}
                  className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-400 block mb-1 font-medium">Official Contact Email</label>
              <input
                type="email"
                value={settings.contact_email || ""}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white font-mono"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#1a2333]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Homepage Hero Content</h3>
            <div>
              <label className="text-gray-400 block mb-1 font-medium">Hero Banner Title</label>
              <input
                type="text"
                value={settings.banner_title || ""}
                onChange={(e) => setSettings({ ...settings, banner_title: e.target.value })}
                className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="text-gray-400 block mb-1 font-medium">Hero Subtitle</label>
              <textarea
                rows={2}
                value={settings.banner_subtitle || ""}
                onChange={(e) => setSettings({ ...settings, banner_subtitle: e.target.value })}
                className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#1a2333]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Operational Toggles</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.registration_enabled}
                  onChange={(e) => setSettings({ ...settings, registration_enabled: e.target.checked })}
                  className="rounded text-[#ff5500]"
                />
                <span className="font-semibold text-white">Allow New Player Registrations</span>
              </label>
              <label className="flex items-center gap-3 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenance_mode}
                  onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                  className="rounded text-yellow-500"
                />
                <span className="font-semibold text-yellow-400">Enable Maintenance Mode</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#ff5500] hover:bg-[#ff661a] font-bold text-white uppercase tracking-wider transition active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving Changes..." : "Save Settings"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
