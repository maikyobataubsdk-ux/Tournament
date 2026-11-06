import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("GENERAL");
  const [loading, setLoading] = useState(false);

  const loadAnnouncements = async () => {
    try {
      const data = await fetchAPI("/announcements");
      setAnnouncements(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchAPI("/announcements", {
        method: "POST",
        body: JSON.stringify({ title, content, type }),
      });
      alert("Announcement published!");
      setTitle("");
      setContent("");
      loadAnnouncements();
    } catch (err: any) {
      alert(err.message || "Failed to publish announcement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await fetchAPI(`/announcements/${id}`, { method: "DELETE" });
      loadAnnouncements();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  };

  return (
    <AdminLayout title="Announcements & In-App Banners">
      <div className="space-y-6">
        <div className="bg-[#0e131f] border border-[#1a2333] p-6 rounded-2xl max-w-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#ff5500]" /> Publish Broadcast Announcement
          </h3>
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="text-gray-400 block mb-1 font-medium">Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Scrims Registration Extended"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-gray-400 block mb-1 font-medium">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white"
              >
                <option value="GENERAL">General News</option>
                <option value="TOURNAMENT">Tournament Update</option>
                <option value="MAINTENANCE">Scheduled Maintenance</option>
                <option value="UPDATE">App Version Release</option>
              </select>
            </div>

            <div>
              <label className="text-gray-400 block mb-1 font-medium">Message Body</label>
              <textarea
                required
                rows={3}
                placeholder="Announcement message displayed to all players..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#ff5500] hover:bg-[#ff661a] font-bold text-white transition disabled:opacity-50"
            >
              {loading ? "Publishing..." : "Broadcast Announcement"}
            </button>
          </form>
        </div>

        <div className="bg-[#0e131f] border border-[#1a2333] rounded-2xl p-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Published Announcements</h4>
          {announcements.length === 0 ? (
            <div className="text-xs text-gray-500 py-8 text-center">No active announcements</div>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="bg-[#121826] border border-[#1a2333] p-4 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{a.title}</span>
                      <span className="bg-[#ff5500]/20 text-[#ff5500] text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                        {a.type}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">{a.content}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                  >
                    <Trash2 className="w-4 h-4" />
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
