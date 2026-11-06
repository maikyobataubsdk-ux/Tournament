import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { LifeBuoy, CheckCircle2 } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function AdminTickets() {
  const [tickets, setTickets] = useState<any[]>([]);

  const loadTickets = async () => {
    try {
      const data = await fetchAPI("/admin/tickets");
      setTickets(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const resolveTicket = async (id: string) => {
    try {
      await fetchAPI(`/admin/tickets/${id}/resolve`, { method: "PATCH" });
      loadTickets();
    } catch (err: any) {
      alert(err.message || "Failed to resolve ticket");
    }
  };

  return (
    <AdminLayout title="Player Support & Recovery Tickets">
      <div className="space-y-6">
        <p className="text-xs text-gray-400">
          Review administrator-assisted account recovery tickets, player inquiries, and password reset requests.
        </p>

        <div className="bg-[#0e131f] border border-[#1a2333] rounded-2xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Support Inquiries</h3>
          {tickets.length === 0 ? (
            <div className="text-xs text-gray-500 py-12 text-center flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 text-green-400 mb-2" />
              <span>Inbox clean. No open player support tickets.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <div key={t.id} className="bg-[#121826] border border-[#1a2333] p-4 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">{t.user_email}</span> • <span className="text-yellow-400 font-mono">{t.type}</span>
                    <p className="text-gray-400 text-xs mt-1">{t.message}</p>
                    <span className="text-[10px] text-gray-500 font-mono mt-1 block">Status: {t.status}</span>
                  </div>
                  {t.status === "OPEN" && (
                    <button
                      onClick={() => resolveTicket(t.id)}
                      className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 font-bold transition"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
