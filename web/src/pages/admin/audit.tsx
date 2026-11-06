import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { ScrollText, ShieldCheck } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function AdminAudit() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await fetchAPI("/admin/audit-logs");
        setLogs(data || []);
      } catch (e) {
        console.error(e);
      }
    }
    loadLogs();
  }, []);

  return (
    <AdminLayout title="System Security & Operations Audit Logs">
      <div className="space-y-6">
        <p className="text-xs text-gray-400">
          Immutable audit trail for sensitive administrative operations, account suspensions, score approvals, and database backups.
        </p>

        <div className="bg-[#0e131f] border border-[#1a2333] rounded-2xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Recorded Events</h3>
          {logs.length === 0 ? (
            <div className="text-xs text-gray-500 py-12 text-center">No audit logs recorded yet</div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="bg-[#121826] border border-[#1a2333] p-4 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#ff5500] font-mono">{log.action}</span>
                    <p className="text-gray-300 text-xs mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono shrink-0 ml-4">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
