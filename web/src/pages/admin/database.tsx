import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Database, Download, RefreshCw, HardDrive, CheckCircle2 } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function AdminDatabase() {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBackups = async () => {
    try {
      const data = await fetchAPI("/admin/backups", {
        headers: { Authorization: "Bearer demo" },
      });
      setBackups(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const triggerBackup = async () => {
    setLoading(true);
    try {
      await fetchAPI("/admin/backups/create?tag=manual", {
        method: "POST",
        headers: { Authorization: "Bearer demo" },
      });
      alert("Database snapshot created successfully!");
      loadBackups();
    } catch (err: any) {
      alert(err.message || "Backup failed");
    } finally {
      setLoading(false);
    }
  };

  const restoreSnapshot = async (filename: string) => {
    if (!confirm(`Warning: Restoring backup ${filename} will replace all active database state. Proceed?`)) {
      return;
    }
    try {
      await fetchAPI(`/admin/backups/restore?filename=${filename}`, {
        method: "POST",
        headers: { Authorization: "Bearer demo" },
      });
      alert("Database restored successfully!");
    } catch (err: any) {
      alert(err.message || "Restore failed");
    }
  };

  return (
    <AdminLayout title="JSON Database & Backup Engine">
      <div className="space-y-6">
        <div className="bg-[#0e131f] border border-[#1a2333] p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-white text-base">Atomic JSON Database Engine</h3>
            <p className="text-xs text-gray-400">
              Primary database file: <code className="text-[#00ffcc]">/app/data/database.json</code> with POSIX Linux file-locking.
            </p>
          </div>
          <button
            onClick={triggerBackup}
            disabled={loading}
            className="flex items-center gap-2 bg-[#ff5500] hover:bg-[#ff661a] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase transition active:scale-95 disabled:opacity-50"
          >
            <Database className="w-4 h-4" />
            {loading ? "Creating Snapshot..." : "Create Backup Now"}
          </button>
        </div>

        <div className="bg-[#0e131f] border border-[#1a2333] rounded-2xl p-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Available Backups ({backups.length})</h4>
          {backups.length === 0 ? (
            <div className="text-xs text-gray-500 py-8 text-center">No snapshot backups found</div>
          ) : (
            <div className="space-y-3">
              {backups.map((b) => (
                <div key={b.filename} className="bg-[#121826] border border-[#1a2333] p-4 rounded-xl flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-white font-mono">{b.filename}</div>
                    <div className="text-gray-400 text-[11px]">
                      Size: {(b.size_bytes / 1024).toFixed(1)} KB • Snapshot Created: {new Date(b.created_at).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => restoreSnapshot(b.filename)}
                    className="px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20 font-bold transition"
                  >
                    Restore Snapshot
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
