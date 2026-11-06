import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Trophy, Plus, Trash2, Edit3, Download, Users } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("Solo");
  const [map, setMap] = useState("Bermuda");
  const [slots, setSlots] = useState(48);
  const [date, setDate] = useState("2025-06-01T18:00");
  const [loading, setLoading] = useState(false);

  const loadTournaments = async () => {
    try {
      const data = await fetchAPI("/tournaments");
      setTournaments(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchAPI("/tournaments", {
        method: "POST",
        body: JSON.stringify({
          title,
          description: "Competitive Free Fire MAX scrims.",
          mode,
          map,
          max_slots: Number(slots),
          tournament_date: date,
          registration_start: "2025-05-01T00:00",
          registration_deadline: date,
          status: "PUBLISHED",
        }),
      });
      alert("Tournament created successfully!");
      setShowCreate(false);
      setTitle("");
      loadTournaments();
    } catch (err: any) {
      alert(err.message || "Failed to create tournament");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = (id: string) => {
    window.open(`/api/v1/admin/tournaments/${id}/export`, "_blank");
  };

  return (
    <AdminLayout title="Tournament & Scrim Operations">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">Manage competitive brackets, slot sizes, and registration exports.</p>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 bg-[#ff5500] hover:bg-[#ff661a] text-white px-4 py-2 rounded-xl text-xs font-bold transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Tournament</span>
          </button>
        </div>

        {showCreate && (
          <div className="bg-[#0e131f] border border-[#ff5500]/30 p-6 rounded-2xl mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Create Tournament</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-400 block mb-1 font-medium">Tournament Title</label>
                <input
                  type="text"
                  required
                  placeholder="Booyah Weekend Cup Season 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-medium">Mode</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white"
                  >
                    <option value="Solo">Solo</option>
                    <option value="Duo">Duo</option>
                    <option value="Squad">Squad</option>
                    <option value="Clash Squad">Clash Squad</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-medium">Map</label>
                  <select
                    value={map}
                    onChange={(e) => setMap(e.target.value)}
                    className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white"
                  >
                    <option value="Bermuda">Bermuda</option>
                    <option value="Purgatory">Purgatory</option>
                    <option value="Kalahari">Kalahari</option>
                    <option value="Alpine">Alpine</option>
                    <option value="Nexterra">Nexterra</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-medium">Max Slots</label>
                  <input
                    type="number"
                    value={slots}
                    onChange={(e) => setSlots(Number(e.target.value))}
                    className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-medium">Match Date/Time</label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-xl bg-[#121826] text-gray-400 border border-[#1a2333]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#ff5500] hover:bg-[#ff661a] font-bold text-white transition disabled:opacity-50"
                >
                  {loading ? "Publishing..." : "Publish Tournament"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-[#0e131f] border border-[#1a2333] rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121826] text-gray-400 uppercase font-semibold border-b border-[#1a2333]">
              <tr>
                <th className="py-4 px-6">Tournament</th>
                <th className="py-4 px-6">Mode / Map</th>
                <th className="py-4 px-6">Slots</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2333]">
              {tournaments.map((t) => (
                <tr key={t.id} className="hover:bg-[#161d2d] transition">
                  <td className="py-4 px-6">
                    <div className="font-bold text-white text-sm">{t.title}</div>
                    <div className="text-gray-400 text-[11px]">{t.tournament_date}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[#ff5500] font-bold">{t.mode}</span> • <span className="text-gray-400">{t.map}</span>
                  </td>
                  <td className="py-4 px-6 text-gray-300 font-mono">
                    {t.registered_slots} / {t.max_slots}
                  </td>
                  <td className="py-4 px-6">
                    <span className="bg-green-500/10 text-green-400 border border-green-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => exportCSV(t.id)}
                      className="px-3 py-1 rounded bg-[#161d2d] hover:bg-[#1f283d] text-[#00ffcc] border border-[#1a2333] transition"
                    >
                      Export CSV
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
