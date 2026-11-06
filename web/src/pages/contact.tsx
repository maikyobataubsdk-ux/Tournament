import React, { useState } from "react";
import { Navbar, Footer } from "@/components/Layout";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;
    setLoading(true);
    try {
      await fetchAPI("/auth/reset-request", {
        method: "POST",
        body: JSON.stringify({ email }),
      }).catch(() => null);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white">
      <Navbar />

      <main className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#1f293d] pb-8 mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-[#ff5500]/10 border border-[#ff5500]/30 px-3 py-1 rounded-full text-xs font-semibold text-[#ff5500] mb-3">
            <Mail className="w-4 h-4" />
            <span>24/7 Player Assistance</span>
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tight">Contact & Support</h1>
          <p className="text-xs text-gray-400 mt-2">Have questions about upcoming tournaments, account recovery, or scrim coordination?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#121722] border border-[#1f293d] p-8 rounded-2xl space-y-6">
            <h2 className="text-xl font-bold uppercase italic text-white">Direct Communication</h2>
            <div className="space-y-4 text-xs text-gray-300">
              <div>
                <span className="text-gray-500 font-bold block mb-1">Official Domain</span>
                <span className="text-white font-mono text-sm">Booyahesports.in</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block mb-1">Support Email</span>
                <a href="mailto:support@booyahesports.in" className="text-[#ff5500] font-mono text-sm hover:underline">
                  support@booyahesports.in
                </a>
              </div>
            </div>
          </div>

          <div className="bg-[#121722] border border-[#1f293d] p-8 rounded-2xl">
            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
                <h3 className="font-bold text-lg text-white">Message Dispatched</h3>
                <p className="text-xs text-gray-400">Our tournament administration team will review your inquiry and reply via email.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-bold uppercase italic text-white mb-2">Send a Message</h2>
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5 font-medium">Your Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="player@example.com"
                    className="w-full bg-[#0b0e14] border border-[#1f293d] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#ff5500]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5 font-medium">Inquiry / Subject</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry, Free Fire UID, or feedback..."
                    className="w-full bg-[#0b0e14] border border-[#1f293d] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#ff5500]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#ff5500] hover:bg-[#ff661a] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {loading ? "Sending..." : "Submit Inquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
