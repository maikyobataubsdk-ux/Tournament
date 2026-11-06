import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Swords, Key, ShieldCheck, Send } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function AdminMatches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [roomId, setRoomId] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [releaseNow, setReleaseNow] = useState(true);

  const loadMatches = async () => {
    try {
      const data = await fetchAPI("/matches");
      setMatches(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;
    try {
      await fetchAPI(`/matches/${selectedMatch}/room-credentials`, {
        method: "PATCH",
        body: JSON.stringify({
          room_id: roomId,
          room_password: roomPassword,
          release_now: releaseNow,
        }),
      });
      alert("Room credentials updated & released to registered participants!");
      setSelectedMatch(null);
      setRoomId("");
      setRoomPassword("");
      loadMatches();
    } catch (err: any) {
      alert(err.message || "Failed to update room details");
    }
  };

  return (
    <AdminLayout title="Match & Custom Room Host Portal">
      <div className="space-y-6">
        <p className="text-xs text-gray-400">
          Enter Free Fire MAX Custom Room ID and Password. Credentials will be securely broadcasted exclusively to confirmed participants.
        </p>

        {selectedMatch && (
          <div className="bg-[#0e131f] border border-[#ff5500]/40 p-6 rounded-2xl mb-6 max-w-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#ff5500]" /> Enter Custom Room Credentials
            </h3>
            <form onSubmit={handleUpdateRoom} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-400 block mb-1 font-medium">Free Fire Custom Room ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7821940"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-medium">Room Password</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1234"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                  className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white font-mono text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-gray-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={releaseNow}
                  onChange={(e) => setReleaseNow(e.target.checked)}
                  className="rounded text-[#ff5500]"
                />
                <span className="font-semibold text-white">Release immediately to registered participants</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMatch(null)}
                  className="px-4 py-2 rounded-xl bg-[#121826] text-gray-400 border border-[#1a2333]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ff5500] hover:bg-[#ff661a] font-bold text-white transition"
                >
                  Broadcast Room Details
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-[#0e131f] border border-[#1a2333] rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121826] text-gray-400 uppercase font-semibold border-b border-[#1a2333]">
              <tr>
                <th className="py-4 px-6">Match ID</th>
                <th className="py-4 px-6">Match # / Map</th>
                <th className="py-4 px-6">Scheduled Time</th>
                <th className="py-4 px-6">Room Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2333]">
              {matches.map((m) => (
                <tr key={m.id} className="hover:bg-[#161d2d] transition">
                  <td className="py-4 px-6 font-mono text-gray-400">{m.id}</td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-white">Match #{m.match_number}</span> • <span className="text-gray-400">{m.map}</span>
                  </td>
                  <td className="py-4 px-6 text-gray-300 font-mono">{m.scheduled_at}</td>
                  <td className="py-4 px-6">
                    {m.is_room_published ? (
                      <span className="bg-green-500/10 text-green-400 border border-green-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        Published
                      </span>
                    ) : (
                      <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        Unreleased
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => {
                        setSelectedMatch(m.id);
                        setRoomId(m.room_id || "");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#ff5500] hover:bg-[#ff661a] text-white font-bold transition"
                    >
                      Set Room Credentials
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
