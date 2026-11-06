import React from "react";
import Link from "next/link";
import { Download } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0b0e14]/90 backdrop-blur-md border-b border-[#1f293d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Booyahesports" className="h-12 w-auto object-contain" />
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-wider text-white uppercase italic">
              Booyah<span className="text-[#ff5500]">esports</span>
            </span>
            <span className="text-[10px] text-gray-400 font-semibold tracking-widest">BOOYAHESPORTS.IN</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="/" className="hover:text-[#ff5500] transition">Home</Link>
          <Link href="/tournaments" className="hover:text-[#ff5500] transition">Tournaments</Link>
          <Link href="/leaderboard" className="hover:text-[#ff5500] transition">Leaderboard</Link>
          <Link href="/results" className="hover:text-[#ff5500] transition">Results</Link>
          <Link href="/about" className="hover:text-[#ff5500] transition">About Us</Link>
          <Link href="/contact" className="hover:text-[#ff5500] transition">Contact</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/download"
            className="flex items-center gap-2 bg-gradient-to-r from-[#ff5500] to-[#ff2200] hover:from-[#ff661a] hover:to-[#ff3300] text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-[#ff5500]/25 transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            Download APK
          </Link>
          <Link
            href="/admin"
            className="text-xs text-gray-400 hover:text-white border border-[#1f293d] px-3 py-2 rounded transition"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </nav>
  );
};

export const Footer = () => {
  return (
    <footer className="bg-[#080a0f] border-t border-[#1f293d] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Booyahesports" className="h-10 w-auto" />
              <span className="text-lg font-black tracking-wider text-white uppercase italic">
                Booyah<span className="text-[#ff5500]">esports</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              India's premier 100% free-entry competitive tournament platform for Free Fire MAX players. Compete, prove your skills, and earn esports recognition.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/tournaments" className="hover:text-[#ff5500] transition">Active Tournaments</Link></li>
              <li><Link href="/leaderboard" className="hover:text-[#ff5500] transition">Global Standings</Link></li>
              <li><Link href="/results" className="hover:text-[#ff5500] transition">Match Results</Link></li>
              <li><Link href="/download" className="hover:text-[#ff5500] transition">Android App Download</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Legal & Policy</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/privacy" className="hover:text-[#ff5500] transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#ff5500] transition">Terms & Conditions</Link></li>
              <li><Link href="/terms#fairplay" className="hover:text-[#ff5500] transition">Fair Play & Anti-Cheat</Link></li>
              <li><Link href="/contact" className="hover:text-[#ff5500] transition">Support & Grievances</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Disclaimer</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Booyahesports is an independent esports community tournament platform and is not affiliated with, endorsed, or sponsored by Garena or Free Fire MAX. All Free Fire trademarks are properties of Garena. Booyahesports is strictly a free-entry, non-gambling skill platform.
            </p>
          </div>
        </div>

        <div className="border-t border-[#1f293d] mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Booyahesports.in. All Rights Reserved.</p>
          <p>Crafted for Champions 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
};
