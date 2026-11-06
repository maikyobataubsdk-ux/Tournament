import React from "react";
import { Navbar, Footer } from "@/components/Layout";
import { Scale } from "lucide-react";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[#0b0e14] text-white">
      <Navbar />

      <main className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#1f293d] pb-8 mb-8">
          <div className="inline-flex items-center gap-2 bg-[#ff5500]/10 border border-[#ff5500]/30 px-3 py-1 rounded-full text-xs font-semibold text-[#ff5500] mb-3">
            <Scale className="w-4 h-4" />
            <span>Fair Play, Community Guidelines & Legal Terms</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tight">Terms and Conditions</h1>
          <p className="text-xs text-gray-400 mt-2">Domain: Booyahesports.in • Non-Commercial Esports Platform</p>
        </div>

        <div className="space-y-8 text-xs text-gray-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">1. Platform Nature & Non-Gambling Policy</h2>
            <p>
              Booyahesports is an independent, non-commercial esports tournament management platform designed strictly for competitive skill-based recreation.
            </p>
            <div className="bg-[#121722] border border-[#1f293d] p-4 rounded-xl text-[#00ffcc]">
              <strong>Strict Non-Cash Policy:</strong> Booyahesports does not charge entry fees, host paid tournaments, operate digital wallets, or facilitate real-money wagering or betting of any kind.
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">2. Independent Community Disclaimer</h2>
            <p>
              Booyahesports is operated as an independent gaming community. Free Fire and Free Fire MAX are registered trademarks of Garena International. Booyahesports is not affiliated with, endorsed by, or authorized by Garena.
            </p>
          </section>

          <section id="fairplay" className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">3. Fair Play & Anti-Cheat Policy</h2>
            <p>
              Hacks, modified game clients, emulators (unless explicitly stated), and unfair teaming are strictly prohibited and result in permanent platform bans.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
