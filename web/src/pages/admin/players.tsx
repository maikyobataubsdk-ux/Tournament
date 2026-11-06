import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Users, Shield, UserX, UserCheck, KeyRound, Search, Ban } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function AdminPlayers() {
  const [players, setPlayers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadPlayers = async () => {
    try {
      const data = await fetchAPI(`/admin/players?search=${search}`, {
        headers: { Authorization: "Bearer demo" },
      }).catch(() => []);
      setPlayers(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, [search]);

  const toggleSuspend = async (userId: string, isSuspended: boolean) => {
    const action = isSuspended ? "unsuspend" : "suspend";
    await fetchAPI(`/admin/players/${userId}/${action}`, {
      method: "POST",
      headers: { Authorization: "Bearer demo" },
    }).catch(() => null);
    loadPlayers();
  };

  const forceReset = async (userId: string) => {
    const newPwd = prompt("Enter new 8-digit numeric password for this player:", "88888888");
    if (!newPwd || newPwd.length !== 8 || !/^\d+$/.test(newPwd)) {
      alert("Password must contain exactly 8 numeric digits");
      return;
    }
    await fetchAPI(`/admin/players/${userId}/reset-password`, {
      method: "POST",
      body: JSON.stringify({ new_password: newPwd }),
      headers: { Authorization: "Bearer demo" },
    }).catch((err) => alert(err.message));
    alert("Password reset successfully. Active sessions revoked.");
    loadPlayers();
  };

  return (
    <AdminLayout title="Player & Account Moderation">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search by email, name, or FF UID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0e131f] border border-[#1a2333] rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#ff5500]"
            />
          </div>
          <span className="text-xs text-gray-400">Total Registered Players: {players.length}</span>
        </div>

        <div className="bg-[#0e131f] border border-[#1a2333] rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121826] text-gray-400 uppercase font-semibold border-b border-[#1a2333]">
              <tr>
                <th className="py-4 px-6">Player / Email</th>
                <th className="py-4 px-6">Free Fire UID</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Joined Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2333]">
              {players.map((p) => (
                <tr key={p.id} className="hover:bg-[#161d2d] transition">
                  <td className="py-4 px-6">
                    <div className="font-bold text-white text-sm">{p.profile?.player_name || "Player"}</div>
                    <div className="text-gray-400 font-mono text-[11px]">{p.email}</div>
                  </td>
                  <td className="py-4 px-6 font-mono text-gray-300">
                    {p.profile?.free_fire_uid || <span className="text-gray-600 italic">Not set</span>}
                  </td>
                  <td className="py-4 px-6">
                    {p.is_suspended ? (
                      <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        Suspended
                      </span>
                    ) : (
                      <span className="bg-green-500/10 text-green-400 border border-green-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-gray-400 text-[11px]">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : "-"}
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => forceReset(p.id)}
                      className="px-2.5 py-1 rounded bg-[#161d2d] hover:bg-[#1f283d] text-yellow-400 border border-[#1a2333] transition"
                      title="Force Password Reset"
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={() => toggleSuspend(p.id, p.is_suspended)}
                      className={`px-2.5 py-1 rounded border transition ${
                        p.is_suspended
                          ? "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                      }`}
                    >
                      {p.is_suspended ? "Unsuspend" : "Suspend"}
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
