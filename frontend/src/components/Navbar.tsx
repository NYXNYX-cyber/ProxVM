"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import axios from "axios";
import { Server, Wallet, LogOut, LayoutDashboard } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = useCallback(async () => {
    const token = Cookies.get("token");
    if (!token) return setUser(null);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:4000`;
    try {
      const res = await axios.get(`${apiBase}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
    } catch (err) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    window.addEventListener('balance-update', fetchUser);
    return () => window.removeEventListener('balance-update', fetchUser);
  }, [fetchUser, pathname]);

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    router.push("/");
  };

  return (
    <nav className="h-16 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between transition-colors">
      <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
        <div className="p-2 bg-indigo-600 rounded-lg shadow-sm">
          <Server className="w-5 h-5 text-white" />
        </div>
        <span className="text-zinc-900 dark:text-white">Nyx<span className="text-indigo-600">Hosting</span></span>
      </Link>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[var(--muted)] rounded-full border border-[var(--border)] text-sm font-semibold">
              <Wallet className="w-4 h-4 text-emerald-500" />
              <span>${user.credits.toFixed(2)}</span>
            </div>
            <Link href="/dashboard" className="text-sm font-semibold hover:text-indigo-600 transition-colors flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> <span className="hidden md:inline">Dashboard</span>
            </Link>
          </>
        )}
        
        <div className="h-6 w-[1px] bg-[var(--border)] mx-1" />
        
        <ThemeToggle />

        {user ? (
          <button onClick={logout} className="p-2 text-[var(--muted-foreground)] hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        ) : (
          !pathname.includes('auth') && (
            <Link href="/auth/login" className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
              Login
            </Link>
          )
        )}
      </div>
    </nav>
  );
}
