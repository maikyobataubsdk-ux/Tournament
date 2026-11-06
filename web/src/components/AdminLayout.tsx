import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { getAdminToken, clearAdminToken } from "@/lib/api";
import {
  LayoutDashboard,
  Users,
  Trophy,
  Swords,
  Radio,
  FileCheck,
  Award,
  AlertOctagon,
  Bell,
  Megaphone,
  Download,
  Settings,
  Shield,
  Database,
  ScrollText,
  LifeBuoy,
  LogOut,
  ExternalLink
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = getAdminToken();
    if (!token && router.pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [router.pathname]);

  const handleLogout = () => {
    clearAdminToken();
    router.push("/admin/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Players", href: "/admin/players", icon: Users },
    { label: "Tournaments", href: "/admin/tournaments", icon: Trophy },
    { label: "Matches & Rooms", href: "/admin/matches", icon: Swords },
    { label: "Results & Scoring", href: "/admin/results", icon: FileCheck },
    { label: "Disputes", href: "/admin/disputes", icon: AlertOctagon },
    { label: "APK Releases", href: "/admin/releases", icon: Download },
    { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { label: "Support Tickets", href: "/admin/tickets", icon: LifeBuoy },
    { label: "Database & Backups", href: "/admin/database", icon: Database },
    { label: "Audit Logs", href: "/admin/audit", icon: ScrollText },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d111a] border-r border-[#1a2333] flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
        <div>
          <div className="p-6 border-b border-[#1a2333] flex items-center gap-3">
            <img src="/logo.png" alt="Booyah Esports" className="w-10 h-10 object-contain" />
            <div>
              <div className="font-black text-sm uppercase tracking-wider text-white">Booyah Esports</div>
              <div className="text-[10px] text-[#ff5500] font-bold uppercase tracking-widest">Admin Control</div>
            </div>
          </div>

          <div className="p-4 space-y-1">
            <div className="text-[10px] font-bold text-gray-500 uppercase px-3 py-2 tracking-wider">Management</div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? "bg-[#ff5500] text-white shadow-lg shadow-[#ff5500]/25"
                      : "text-gray-400 hover:text-white hover:bg-[#161d2d]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-[#1a2333] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-gray-400 hover:text-white px-3 py-2 rounded-lg bg-[#121724] border border-[#1a2333] transition"
          >
            <span>Live Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <div className="text-[10px] text-gray-500 text-center pt-1 font-mono">Booyahesports.in v1.0.0</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#0a0e17] border-b border-[#1a2333] px-8 flex items-center justify-between sticky top-0 z-40">
          <h1 className="text-lg font-black uppercase italic tracking-tight text-white">{title}</h1>
          <div className="flex items-center gap-4 text-xs">
            <span className="bg-[#ff5500]/10 border border-[#ff5500]/30 text-[#ff5500] px-3 py-1 rounded-full font-bold">
              SUPER ADMIN
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#121826] hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-[#1a2333] transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="p-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
