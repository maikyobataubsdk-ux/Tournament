import React, { useEffect, useState } from "react";
import { Navbar, Footer } from "@/components/Layout";
import { Trophy, Search } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [mode, setMode] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAPI("/tournaments");
        setTournaments(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = tournaments.filter((t) => {
    if (mode !== "ALL" && t.mode !== mode) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white">
      <Navbar />

      <main className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1f293d] pb-8 mb-10">
          <div>
            <div className="text-[#ff5500] font-bold text-xs uppercase tracking-widest mb-1">COMPETITIVE ARENA</div>
            <h1 className="text-4xl font-black uppercase italic tracking-tight">Free Fire MAX Tournaments</h1>
            <p className="text-xs text-gray-400 mt-2">All tournaments are 100% free entry. Register via the Booyahesports Android app.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#121722] border border-[#1f293d] rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#ff5500]"
              />
            </div>

            <div className="flex bg-[#121722] border border-[#1f293d] p-1 rounded-xl text-xs font-semibold">
              {["ALL", "Solo", "Duo", "Squad"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-lg transition ${mode === m ? "bg-[#ff5500] text-white font-bold" : "text-gray-400 hover:text-white"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-[#121722] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#121722] border border-[#1f293d] rounded-2xl p-12 text-center text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-500" />
            <p className="font-semibold text-lg text-white">No tournaments matching criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="bg-[#121722] border border-[#1f293d] hover:border-[#ff5500]/50 rounded-2xl overflow-hidden transition flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="bg-[#ff5500]/10 text-[#ff5500] border border-[#ff5500]/30 px-2.5 py-0.5 rounded font-bold uppercase">
                      {t.mode}
                    </span>
                    <span className="text-gray-400 font-medium">Map: {t.map}</span>
                  </div>
                  <h3 className="font-bold text-lg text-white">{t.title}</h3>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{t.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
