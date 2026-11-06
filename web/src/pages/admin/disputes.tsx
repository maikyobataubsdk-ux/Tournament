import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AlertOctagon, CheckCircle2, XCircle } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<any[]>([]);

  const loadDisputes = async () => {
    try {
      const data = await fetchAPI("/admin/metrics");
      setDisputes(data?.recent_disputes || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  return (
    <AdminLayout title="Match Disputes & Referee Grievances">
      <div className="space-y-6">
        <p className="text-xs text-gray-400">
          Review player-submitted screenshot evidence, claims of third-party modifications, and placement challenges.
        </p>

        <div className="bg-[#0e131f] border border-[#1a2333] rounded-2xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Open Disputes</h3>
          {disputes.length === 0 ? (
            <div className="text-xs text-gray-500 py-12 text-center flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 text-green-400 mb-2" />
              <span>Zero unresolved disputes. All matches running cleanly!</span>
            </div>
          ) : (
            <div className="space-y-3">
              {disputes.map((d) => (
                <div key={d.id} className="bg-[#121826] border border-[#1a2333] p-4 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-red-400">{d.id}</span> • <span className="text-gray-400">Match: {d.match_id}</span>
                    <p className="text-white mt-1">{d.reason}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 font-bold transition">
                      Resolve
                    </button>
                    <button className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 font-bold transition">
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
