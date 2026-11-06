import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Download, Upload, CheckCircle2, FileCode, Shield } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function AdminReleases() {
  const [releases, setReleases] = useState<any[]>([]);
  const [versionName, setVersionName] = useState("1.0.1");
  const [versionCode, setVersionCode] = useState("2");
  const [minVersion, setMinVersion] = useState("1");
  const [notes, setNotes] = useState("");
  const [mandatory, setMandatory] = useState(false);
  const [publishNow, setPublishNow] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadReleases = async () => {
    try {
      const data = await fetchAPI("/app/releases");
      setReleases(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadReleases();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please select an APK file");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("version_name", versionName);
      formData.append("version_code", versionCode);
      formData.append("minimum_supported_version", minVersion);
      formData.append("mandatory", String(mandatory));
      formData.append("release_notes", notes);
      formData.append("publish_now", String(publishNow));

      const res = await fetch("/api/v1/app/releases/upload", {
        method: "POST",
        headers: { Authorization: "Bearer demo" },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      alert("APK release uploaded and published successfully!");
      setFile(null);
      setNotes("");
      loadReleases();
    } catch (err: any) {
      alert(err.message || "Failed to upload APK");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout title="APK Release & Auto-Update Manager">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="bg-[#0e131f] border border-[#1a2333] p-6 rounded-2xl h-fit">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#ff5500]" /> Publish New APK
          </h3>
          <form onSubmit={handleUpload} className="space-y-4 text-xs">
            <div>
              <label className="text-gray-400 block mb-1 font-medium">Select .apk File</label>
              <input
                type="file"
                accept=".apk"
                required
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-gray-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 block mb-1 font-medium">Version Name</label>
                <input
                  type="text"
                  required
                  placeholder="1.0.2"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1 font-medium">Version Code</label>
                <input
                  type="number"
                  required
                  placeholder="3"
                  value={versionCode}
                  onChange={(e) => setVersionCode(e.target.value)}
                  className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-400 block mb-1 font-medium">Release Notes</label>
              <textarea
                required
                rows={3}
                placeholder="What changed in this update?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mandatory}
                  onChange={(e) => setMandatory(e.target.checked)}
                  className="rounded text-[#ff5500]"
                />
                <span>Mandatory Update</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={publishNow}
                  onChange={(e) => setPublishNow(e.target.checked)}
                  className="rounded text-[#ff5500]"
                />
                <span>Publish Immediately</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 rounded-xl bg-[#ff5500] hover:bg-[#ff661a] font-bold text-white uppercase tracking-wider transition active:scale-95 disabled:opacity-50"
            >
              {uploading ? "Uploading & Calculating SHA-256..." : "Publish Release"}
            </button>
          </form>
        </div>

        {/* Release History */}
        <div className="lg:col-span-2 bg-[#0e131f] border border-[#1a2333] p-6 rounded-2xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Published Release History</h3>
          {releases.length === 0 ? (
            <div className="text-xs text-gray-500 py-12 text-center">No releases published yet</div>
          ) : (
            <div className="space-y-4">
              {releases.map((r) => (
                <div key={r.id} className="bg-[#121826] border border-[#1a2333] p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-white">v{r.version_name}</span>
                      <span className="bg-[#1a2333] text-gray-400 px-2 py-0.5 rounded font-mono text-[10px]">
                        Build {r.version_code}
                      </span>
                      {r.mandatory && (
                        <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold">
                          MANDATORY
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">{r.published_at?.split("T")[0]}</span>
                  </div>

                  <p className="text-gray-300 font-mono text-[11px] bg-[#0a0e17] p-2.5 rounded-lg border border-[#1a2333]">
                    {r.release_notes}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono pt-1">
                    <span className="truncate max-w-sm">SHA-256: {r.sha256}</span>
                    <a href={r.download_url} download className="text-[#ff5500] hover:underline font-bold">
                      Download APK →
                    </a>
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
