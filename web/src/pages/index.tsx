import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar, Footer } from "@/components/Layout";
import { Trophy, Download, ShieldCheck, Flame, Users, ChevronRight } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function HomePage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [tourneys, notes] = await Promise.all([
          fetchAPI("/tournaments").catch(() => []),
          fetchAPI("/announcements").catch(() => []),
        ]);
        setTournaments(tourneys || []);
        setAnnouncements(notes || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white">
      <Navbar />

      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden border-b border-[#1f293d]/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,85,0,0.18),rgba(255,255,255,0))] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#ff5500]/10 border border-[#ff5500]/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#ff5500]">
                <Flame className="w-4 h-4" />
                <span>India's #1 Free Fire MAX Tournament Arena</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-none italic">
                Battle For Glory. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5500] via-[#ff7733] to-[#f59e0b]">
                  Claim The Booyah.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-gray-300 max-w-xl mx-auto lg:mx-0">
                Register for 100% free competitive Free Fire MAX Solo, Duo & Squad scrims and championships. Automated room management, verified stats, and official leaderboards.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/download"
                  className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-[#ff5500] to-[#e64000] hover:from-[#ff661a] hover:to-[#ff3300] text-white px-8 py-4 rounded-xl font-black text-base shadow-xl shadow-[#ff5500]/30 active:scale-95 transition"
                >
                  <Download className="w-5 h-5" />
                  DOWNLOAD ANDROID APP
                </Link>
                <Link
                  href="/tournaments"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#121722] hover:bg-[#1a2233] border border-[#1f293d] px-8 py-4 rounded-xl font-bold text-base transition"
                >
                  View Tournaments
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#1f293d] text-center lg:text-left">
                <div>
                  <div className="text-2xl font-black text-white">100% FREE</div>
                  <div className="text-xs text-gray-400">Zero Entry Fee</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#ff5500]">ANTIDOTE</div>
                  <div className="text-xs text-gray-400">Strict Anti-Cheat</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">INSTANT</div>
                  <div className="text-xs text-gray-400">Room Details Gating</div>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="relative w-full max-w-md bg-gradient-to-b from-[#161c2b] to-[#0f131c] border border-[#232f48] rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#1f293d] pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Booyah Esports" className="w-10 h-10 object-contain" />
                    <div>
                      <div className="text-sm font-bold">Booyahesports Mobile</div>
                      <div className="text-[10px] text-green-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        v1.0.0 Ready to Play
                      </div>
                    </div>
                  </div>
                  <span className="text-xs bg-[#ff5500]/20 text-[#ff5500] px-2.5 py-1 rounded font-bold">FREE ENTRY</span>
                </div>

                <div className="space-y-3">
                  <div className="bg-[#0b0e14] p-4 rounded-xl border border-[#1f293d]/80">
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                      <span>Featured Scrim</span>
                      <span className="text-yellow-400 font-bold">SOLO BATTLE</span>
                    </div>
                    <div className="font-bold text-white text-base">Booyah Grand Open: Bermuda</div>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                      <span>Slots: 48 / 48</span>
                      <span>Map: Bermuda</span>
                    </div>
                  </div>

                  <div className="bg-[#0b0e14] p-4 rounded-xl border border-[#1f293d]/80">
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                      <span>Live Squad Cup</span>
                      <span className="text-green-400 font-bold">ROOM RELEASED</span>
                    </div>
                    <div className="font-bold text-white text-base">Elite Squad Clash: Purgatory</div>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                      <span>Slots: 12 Teams</span>
                      <span>Referee Verified</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <Link
                    href="/download"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#ff5500] hover:underline"
                  >
                    Download APK & Play Today →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {announcements.length > 0 && (
        <section className="bg-[#121722] border-b border-[#1f293d] py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 overflow-x-auto text-xs">
            <span className="bg-[#ff5500] text-black font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">ANNOUNCEMENT</span>
            <span className="text-gray-300 font-medium whitespace-nowrap">
              {announcements[0]?.title}: {announcements[0]?.content}
            </span>
          </div>
        </section>
      )}

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <div className="text-[#ff5500] font-bold text-xs uppercase tracking-widest mb-1">COMPETE & WIN</div>
            <h2 className="text-3xl font-black uppercase italic tracking-tight">Active Tournaments</h2>
          </div>
          <Link href="/tournaments" className="text-sm font-bold text-[#ff5500] hover:underline mt-4 sm:mt-0">
            View All Tournaments ({tournaments.length}) →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-[#121722] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="bg-[#121722] border border-[#1f293d] rounded-2xl p-12 text-center text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-500" />
            <p className="font-semibold text-lg text-white">No tournaments published yet</p>
            <p className="text-xs text-gray-400 mt-1">Check back soon or download the Android app for live alerts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tournaments.slice(0, 6).map((t) => (
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
                  <h3 className="font-bold text-lg text-white group-hover:text-[#ff5500] transition line-clamp-1">
                    {t.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{t.description}</p>

                  <div className="mt-4 pt-4 border-t border-[#1f293d] space-y-2 text-xs text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Slots</span>
                      <span className="font-semibold text-white">{t.registered_slots} / {t.max_slots}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className="text-green-400 font-bold uppercase">{t.status}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#0d111a] border-t border-[#1f293d] flex items-center justify-between">
                  <span className="text-xs font-bold text-white bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded">
                    FREE ENTRY
                  </span>
                  <Link
                    href={`/download`}
                    className="text-xs font-bold text-[#ff5500] hover:text-white flex items-center gap-1 transition"
                  >
                    Join via App →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
