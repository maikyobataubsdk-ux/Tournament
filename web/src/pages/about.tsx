import React from "react";
import { Navbar, Footer } from "@/components/Layout";
import { Trophy, Users, ShieldCheck, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0b0e14] text-white">
      <Navbar />

      <main className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#1f293d] pb-8 mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-[#ff5500]/10 border border-[#ff5500]/30 px-3 py-1 rounded-full text-xs font-semibold text-[#ff5500] mb-3">
            <Heart className="w-4 h-4" />
            <span>Passionate Esports Community</span>
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tight">About Booyahesports</h1>
          <p className="text-xs text-gray-400 mt-2">Empowering grassroots Free Fire MAX players across India since 2025.</p>
        </div>

        <div className="space-y-8 text-xs text-gray-300 leading-relaxed">
          <section className="bg-[#121722] border border-[#1f293d] p-8 rounded-2xl space-y-4">
            <h2 className="text-xl font-bold text-white uppercase italic">Our Mission</h2>
            <p>
              Booyahesports was founded to provide aspiring competitive mobile gamers with an honest, transparent, and professionally managed esports tournament infrastructure.
            </p>
            <p>
              We believe pure skill and team coordination should be the only decider in esports. That is why Booyahesports is 100% free of charge, with zero paid entry fees and zero predatory microtransactions.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-[#121722] border border-[#1f293d] p-6 rounded-2xl">
              <Trophy className="w-8 h-8 mx-auto text-[#ff5500] mb-3" />
              <div className="font-bold text-base text-white">Competitive Integrity</div>
              <p className="text-[11px] text-gray-400 mt-1">Referees verify all match screens and enforce strict anti-cheat policies.</p>
            </div>
            <div className="bg-[#121722] border border-[#1f293d] p-6 rounded-2xl">
              <Users className="w-8 h-8 mx-auto text-[#ff5500] mb-3" />
              <div className="font-bold text-base text-white">Community First</div>
              <p className="text-[11px] text-gray-400 mt-1">Built by Free Fire players, for Free Fire players with fast support.</p>
            </div>
            <div className="bg-[#121722] border border-[#1f293d] p-6 rounded-2xl">
              <ShieldCheck className="w-8 h-8 mx-auto text-[#ff5500] mb-3" />
              <div className="font-bold text-base text-white">Automated Privacy</div>
              <p className="text-[11px] text-gray-400 mt-1">Room credentials and user profiles are guarded with strict encryption.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
