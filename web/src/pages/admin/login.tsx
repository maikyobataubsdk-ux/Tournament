import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Lock, Mail, ArrowRight, ShieldAlert } from "lucide-react";
import { fetchAPI, setAdminToken } from "@/lib/api";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@booyahesports.in");
  const [password, setPassword] = useState("12345678");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length !== 8 || !/^\d+$/.test(password)) {
      setError("Admin password must be exactly 8 numeric digits.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAPI("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (res && res.access_token) {
        if (!res.user?.is_admin) {
          throw new Error("Access denied: You do not hold an administrator role.");
        }
        setAdminToken(res.access_token);
        router.push("/admin");
      }
    } catch (err: any) {
      setError(err.message || "Invalid administrative credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center p-4">
      <Head>
        <title>Admin Portal Login | Booyahesports</title>
      </Head>

      <div className="max-w-md w-full bg-[#0d111a] border border-[#1a2333] rounded-3xl p-8 sm:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Booyah Esports" className="w-16 h-16 object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-black uppercase italic tracking-tight text-white">
            Booyah<span className="text-[#ff5500]">esports</span> Admin
          </h1>
          <p className="text-xs text-gray-400 mt-1">Authorized Tournament Personnel & Referees Only</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div>
            <label className="text-gray-400 block mb-1.5 font-medium">Administrator Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@booyahesports.in"
                className="w-full bg-[#121826] border border-[#1a2333] rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#ff5500]"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-400 block mb-1.5 font-medium">8-Digit Numeric Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                maxLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="12345678"
                className="w-full bg-[#121826] border border-[#1a2333] rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#ff5500]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#ff5500] hover:bg-[#ff661a] font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#ff5500]/25 transition active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Enter Admin Portal"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#1a2333] text-center text-[11px] text-gray-500">
          Default Super Admin: <code className="text-gray-400">admin@booyahesports.in</code> / <code className="text-gray-400">12345678</code>
        </div>
      </div>
    </div>
  );
}
