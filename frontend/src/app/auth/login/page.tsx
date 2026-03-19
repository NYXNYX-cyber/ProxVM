"use client";

import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn, Loader2 } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", form);
      Cookies.set("token", res.data.token);
      router.push("/dashboard");
    } catch (e) { 
      alert("Login Failed. Please check your credentials."); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-6 min-h-[calc(100vh-4rem)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <form onSubmit={submit} className="nyx-card p-10 space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white uppercase">Welcome back</h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">Enter your credentials to access your dashboard.</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full bg-[var(--muted)] border border-[var(--border)] p-4 rounded-xl text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" 
                onChange={e => setForm({...form, email: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Password</label>
              <input 
                type="password" 
                required
                className="w-full bg-[var(--muted)] border border-[var(--border)] p-4 rounded-xl text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" 
                onChange={e => setForm({...form, password: e.target.value})} 
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-indigo-600 hover:opacity-90 text-white py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><LogIn size={18} /> Sign In</>}
          </button>
          
          <p className="text-center text-xs text-zinc-500 font-medium">
            Don't have an account? <Link href="/auth/register" className="text-indigo-600 font-bold hover:underline">Create one</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
