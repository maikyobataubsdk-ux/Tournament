import React, { useEffect, useState } from "react";
import { Navbar, Footer } from "@/components/Layout";
import { Trophy, Medal } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function LeaderboardPage() {
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAPI("/leaderboard/global");
        setStandings(data || []);
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
        <div className="border-b border-[#1f293d] pb-8 mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-[#ff5500]/10 border border-[#ff5500]/30 px-3 py-1 rounded-full text-xs font-semibold text-[#ff5500] mb-3">
            <Trophy className="w-4 h-4" />
            <span>Official Rankings</span>
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tight">Global Leaderboard</h1>
          <p className="text-xs text-gray-400 mt-2">Rankings are calculated dynamically from verified referee match results.</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-[#121722] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : standings.length === 0 ? (
          <div className="bg-[#121722] border border-[#1f293d] rounded-2xl p-12 text-center text-gray-400">
            <Medal className="w-12 h-12 mx-auto mb-3 text-gray-500" />
            <p className="font-semibold text-lg text-white">No ranked players yet</p>
          </div>
        ) : (
          <div className="bg-[#121722] border border-[#1f293d] rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e121a] text-gray-400 uppercase font-semibold border-b border-[#1f293d]">
                <tr>
                  <th className="py-4 px-6">Rank</th>
                  <th className="py-4 px-6">Player</th>
                  <th className="py-4 px-6">Free Fire Name</th>
                  <th className="py-4 px-6 text-center">Matches</th>
                  <th className="py-4 px-6 text-center">Kills</th>
                  <th className="py-4 px-6 text-center">Booyahs</th>
                  <th className="py-4 px-6 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f293d]/50">
                {standings.map((p) => (
                  <tr key={p.player_id || p.rank} className="hover:bg-[#161c2b] transition">
                    <td className="py-4 px-6 font-black text-sm">#{p.rank}</td>
                    <td className="py-4 px-6 font-bold text-white text-sm">{p.player_name}</td>
                    <td className="py-4 px-6 text-gray-300 font-mono">{p.free_fire_nickname || "-"}</td>
                    <td className="py-4 px-6 text-center text-gray-300">{p.matches_played}</td>
                    <td className="py-4 px-6 text-center text-red-400 font-bold">{p.eliminations}</td>
                    <td className="py-4 px-6 text-center text-yellow-400 font-bold">{p.wins}</td>
                    <td className="py-4 px-6 text-right font-black text-sm text-[#ff5500]">{p.total_points} PTS</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
