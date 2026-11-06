import React, { useEffect, useState } from "react";
import { Navbar, Footer } from "@/components/Layout";
import { CheckCircle2, Trophy } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAPI("/results");
        setResults(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white">
      <Navbar />

      <main className="pt-32 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#1f293d] pb-8 mb-8">
          <div className="inline-flex items-center gap-2 bg-[#ff5500]/10 border border-[#ff5500]/30 px-3 py-1 rounded-full text-xs font-semibold text-[#ff5500] mb-3">
            <CheckCircle2 className="w-4 h-4" />
            <span>Official Records</span>
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tight">Verified Match Results</h1>
          <p className="text-xs text-gray-400 mt-2">Every match score is verified and stamped by Booyahesports tournament referees.</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-[#121722] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="bg-[#121722] border border-[#1f293d] rounded-2xl p-12 text-center text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-500" />
            <p className="font-semibold text-lg text-white">No published results yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((r) => (
              <div key={r.id} className="bg-[#121722] border border-[#1f293d] p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-yellow-400">#{r.position} Finish</span>
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold">VERIFIED</span>
                  </div>
                  <h4 className="font-bold text-base text-white">{r.participant_name}</h4>
                  <div className="text-xs text-gray-400 mt-1">
                    Kills: <span className="text-white font-bold">{r.eliminations}</span> • Placement Pts: <span className="text-white font-bold">{r.placement_points}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-[#ff5500]">{r.total_points}</div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Total Points</div>
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
