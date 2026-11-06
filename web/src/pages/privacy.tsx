import React from "react";
import { Navbar, Footer } from "@/components/Layout";
import { ShieldCheck, AlertCircle } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0b0e14] text-white">
      <Navbar />

      <main className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#1f293d] pb-8 mb-8">
          <div className="inline-flex items-center gap-2 bg-[#ff5500]/10 border border-[#ff5500]/30 px-3 py-1 rounded-full text-xs font-semibold text-[#ff5500] mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>Booyahesports Trust & Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-gray-400 mt-2">Last Updated: May 2025 • Domain: Booyahesports.in</p>
        </div>

        <div className="space-y-8 text-xs text-gray-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">1. Introduction & Scope</h2>
            <p>
              Booyahesports operates the website <strong>Booyahesports.in</strong> and the Booyahesports Android mobile application. This Privacy Policy describes how we collect, store, handle, and protect user information in connection with our free-entry Free Fire MAX competitive esports tournaments.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              <li>
                <strong>Account Credentials:</strong> Email address (used solely as an unverified login identifier) and an 8-digit numeric password. Passwords are permanently hashed using Argon2id/bcrypt and are never stored or logged in plain text.
              </li>
              <li>
                <strong>Free Fire In-Game Information:</strong> Free Fire Player UID and In-game Nickname, provided by you to enable tournament slot verification and custom room referee scoring.
              </li>
              <li>
                <strong>Platform Gameplay Data:</strong> Match attendance, check-in status, placement finishes, eliminations, and screenshot evidence submitted for match verification or dispute resolution.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">3. What We Never Ask Or Collect</h2>
            <div className="bg-[#121722] border border-[#ff5500]/30 p-4 rounded-xl space-y-2 text-gray-300">
              <p className="font-bold text-[#ff5500] flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Crucial Security Commitment:
              </p>
              <p>
                We <strong>NEVER</strong> ask for your Free Fire account password, Google login, Facebook credentials, or payment/banking information. Booyahesports is 100% free-to-play with zero real-money wallets.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
