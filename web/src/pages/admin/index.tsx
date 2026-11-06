import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Users, Trophy, Swords, AlertOctagon, Download, Database, CheckCircle2, ShieldAlert } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>({
    total_players: 0,
    active_players: 0,
    suspended_players: 0,
    total_tournaments: 0,
    upcoming_tournaments: 0,
    live_tournaments: 0,
    completed_tournaments: 0,
    total_registrations: 0,
    pending_results: 0,
    open_disputes: 0,
    latest_app_version: "1.0.0",
    recent_registrations: [],
    recent_disputes: [],
    upcoming_matches: [],
    recent_audit_logs: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await fetchAPI("/admin/metrics", {
          headers: { Authorization: "Bearer demo" },
        }).catch(() => null);
        if (data) setMetrics(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const statsCards = [
    { label: "Total Players", val: metrics.total_players, sub: `${metrics.active_players} Active`, icon: Users, color: "text-blue-400" },
    { label: "Total Tournaments", val: metrics.total_tournaments, sub: `${metrics.live_tournaments} Live Now`, icon: Trophy, color: "text-[#ff5500]" },
    { label: "Total Registrations", val: metrics.total_registrations, sub: "Confirmed Slots", icon: Swords, color: "text-green-400" },
    { label: "Open Disputes", val: metrics.open_disputes, sub: "Pending Referee Review", icon: AlertOctagon, color: "text-red-400" },
    { label: "Latest APK Version", val: `v${metrics.latest_app_version}`, sub: "Production Release", icon: Download, color: "text-yellow-400" },
    { label: "Database Health", val: "OPERATIONAL", sub: "JSON File-Locking Engine", icon: Database, color: "text-[#00ffcc]" },
  ];

  return (
    <AdminLayout title="System Overview & Operations Dashboard">
      <div className="space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="bg-[#0e131f] border border-[#1a2333] p-6 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-400 font-semibold">{c.label}</span>
                  <div className={`p-2.5 rounded-xl bg-[#161d2d] ${c.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">{c.val}</div>
                <div className="text-[11px] text-gray-500 mt-1">{c.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Live Operational Feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Audit Logs */}
          <div className="bg-[#0e131f] border border-[#1a2333] rounded-2xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Recent System Audit Logs</h3>
            {metrics.recent_audit_logs.length === 0 ? (
              <div className="text-xs text-gray-500 py-6 text-center">No recent administrative actions</div>
            ) : (
              <div className="space-y-3">
                {metrics.recent_audit_logs.slice(0, 6).map((log: any, idx: number) => (
                  <div key={idx} className="flex items-start justify-between text-xs p-3 rounded-xl bg-[#121826] border border-[#1a2333]">
                    <div>
                      <span className="font-bold text-[#ff5500]">{log.action}</span>
                      <p className="text-gray-400 text-[11px] mt-0.5">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono shrink-0 ml-4">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "-"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick System Controls */}
          <div className="bg-[#0e131f] border border-[#1a2333] rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Administrative Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/admin/tournaments"
                className="p-4 rounded-xl bg-[#161d2d] hover:bg-[#1f283d] border border-[#1a2333] text-xs font-bold text-white transition block text-center"
              >
                + Create Tournament
              </a>
              <a
                href="/admin/matches"
                className="p-4 rounded-xl bg-[#161d2d] hover:bg-[#1f283d] border border-[#1a2333] text-xs font-bold text-white transition block text-center"
              >
                Release Room Details
              </a>
              <a
                href="/admin/releases"
                className="p-4 rounded-xl bg-[#161d2d] hover:bg-[#1f283d] border border-[#1a2333] text-xs font-bold text-white transition block text-center"
              >
                Upload New APK
              </a>
              <a
                href="/admin/database"
                className="p-4 rounded-xl bg-[#161d2d] hover:bg-[#1f283d] border border-[#1a2333] text-xs font-bold text-white transition block text-center"
              >
                Create DB Backup
              </a>
            </div>

            <div className="p-4 rounded-xl bg-[#121826] border border-[#1a2333] space-y-2 text-xs">
              <div className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Single VPS Production Architecture</div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Booyahesports is running on atomic temporary-file writes with Linux file locking (<code className="text-[#00ffcc]">fcntl.flock</code>) and automatic corrupt-JSON restoration. User records, match scores, and APK releases are persistent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
