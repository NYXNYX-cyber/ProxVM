"use client";

import Link from "next/link";
import {
  Zap, Shield, Globe, Server, Check, ArrowRight,
  Cpu, MemoryStick, HardDrive, LayoutGrid, Terminal, Lock, Star, ChevronDown, RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const plans = [
    { name: "LOW", price: "4.99", vcpu: "1", ram: "4 GB", disk: "20 GB", popular: false, save: "50%" },
    { name: "MEDIUM", price: "8.99", vcpu: "2", ram: "8 GB", disk: "50 GB", popular: true, save: "60%" },
    { name: "HIGH", price: "12.99", vcpu: "4", ram: "16 GB", disk: "80 GB", popular: false, save: "55%" },
    { name: "NYX", price: "25.99", vcpu: "8", ram: "32 GB", disk: "100 GB", popular: false, save: "40%" },
  ];

  const trustBadges = [
    { name: "Google", rating: "4.8/5", stars: 5 },
    { name: "Trustpilot", rating: "4.9/5", stars: 5 },
    { name: "HostAdvice", rating: "4.7/5", stars: 5 },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-indigo-500/30">

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-32 overflow-hidden border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider mb-4 block">
              Up to 70% off AI-managed VPS Hosting
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8">
              Server VPS Murah<span className="text-indigo-600"> Indonesia</span>
            </h1>
            <ul className="space-y-4 mb-10">
              {["INTEL XEON processors", "Free weekly backups", "Lokasi Datacenter Indonesia"].map((t, i) => (
                <li key={i} className="flex items-center gap-3 text-lg font-medium opacity-80">
                  <Check className="text-indigo-600" size={20} /> {t}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Link href="/auth/register" className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-all text-center">
                Claim deal
              </Link>
            </div>
            <p className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] font-medium">
              <Shield size={16} /> 30-day money-back guarantee
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="relative hidden lg:block">
            <div className="aspect-square bg-indigo-600/5 rounded-full absolute -inset-10 animate-pulse" />
            <img
              src="https://dihostingin.com/wp-content/uploads/2024/10/pngtree-server-virtualization-futuristic-technology-png-image_12485034.webp"
              alt="Hardware"
              className="relative z-10 w-full dark:opacity-80"
            />
          </motion.div>
        </div>
      </section>

      {/* PRICING SECTION - HOSTINGER STYLE */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-16">Make a move with our biggest deals</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((p, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                className={`relative flex flex-col p-8 rounded-3xl border ${p.popular ? 'border-indigo-600 ring-1 ring-indigo-600' : 'border-[var(--border)]'} bg-[var(--card)] transition-all`}
              >
                {p.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-6 py-1.5 rounded-full shadow-lg">
                    MOST POPULAR
                  </div>
                )}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl">{p.name}</h3>
                  <span className="bg-indigo-600/10 text-indigo-600 text-[10px] font-black px-2 py-1 rounded-md">SAVE {p.save}</span>
                </div>
                <div className="mb-8 text-left">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold opacity-60 text-indigo-600">$</span>
                    <span className="text-5xl font-extrabold">{p.price}</span>
                    <span className="text-[var(--muted-foreground)] text-sm font-bold">/mo</span>
                  </div>
                </div>

                <Link href="/auth/register" className={`w-full py-4 rounded-xl font-bold text-sm text-center mb-8 transition-all ${p.popular ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-[var(--muted)] hover:bg-indigo-600/10 hover:text-indigo-600 border border-[var(--border)]'}`}>
                  Choose plan
                </Link>

                <ul className="space-y-4 text-left border-t border-[var(--border)] pt-8">
                  <li className="flex items-center gap-3 text-xs font-semibold opacity-80">
                    <Check className="text-indigo-600" size={16} /> {p.vcpu} vCPU Cores
                  </li>
                  <li className="flex items-center gap-3 text-xs font-semibold opacity-80">
                    <Check className="text-indigo-600" size={16} /> {p.ram} RAM
                  </li>
                  <li className="flex items-center gap-3 text-xs font-semibold opacity-80">
                    <Check className="text-indigo-600" size={16} /> {p.disk} NVMe SSD space
                  </li>
                  <li className="flex items-center gap-3 text-xs font-semibold opacity-80">
                    <Check className="text-indigo-600" size={16} /> 100 Mbps bandwidth
                  </li>
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID - HOSTINGER HARDWARE STYLE */}
      <section className="py-24 bg-[var(--muted)]/20 border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-20">Secure, speedy, reliable VPS hosting</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[var(--card)] p-10 rounded-[2.5rem] border border-[var(--border)] text-left flex flex-col justify-between h-full min-h-[400px]">
              <div>
                <img src="https://cf-images.us-east-1.prod.boltdns.net/v1/static/734546229001/1eaee222-de19-4414-9e0f-5c5fb8219bbf/7a398af1-b1df-49e4-b1d0-d07d99b3fa8e/800x450/match/image.jpg" className="w-32 mb-8 grayscale dark:invert" />
                <h3 className="text-2xl font-extrabold mb-4 leading-tight">INTEL XEON processors</h3>
                <p className="text-[var(--muted-foreground)] font-medium text-sm leading-relaxed">All of our VPS are equipped with top technology to handle high-traffic and data-intensive projects.</p>
              </div>
            </div>

            <div className="flex flex-col gap-8 h-full">
              <div className="bg-[var(--card)] p-8 rounded-[2.5rem] border border-[var(--border)] text-left flex items-start gap-6 flex-1">
                <div className="p-4 bg-indigo-600/10 rounded-2xl text-indigo-600 shrink-0"><Zap size={32} /></div>
                <div>
                  <h4 className="text-xl font-extrabold mb-2">100 Mbps network speed</h4>
                  <p className="text-[var(--muted-foreground)] text-xs font-medium leading-relaxed">Get lag-free hosting and lightning-fast performance with network speed included in all plans.</p>
                </div>
              </div>
              <div className="bg-[var(--card)] p-8 rounded-[2.5rem] border border-[var(--border)] text-left flex items-start gap-6 flex-1">
                <div className="p-4 bg-indigo-600/10 rounded-2xl text-indigo-600 shrink-0"><Lock size={32} /></div>
                <div>
                  <h4 className="text-xl font-extrabold mb-2">Managed security</h4>
                  <p className="text-[var(--muted-foreground)] text-xs font-medium leading-relaxed">Automatic DDoS filtering, custom firewalls, and isolated LXC containers for maximum protection.</p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--card)] p-10 rounded-[2.5rem] border border-[var(--border)] text-left relative overflow-hidden group h-full flex flex-col">
              <div className="relative z-10">
                <div className="p-4 bg-indigo-600/10 rounded-2xl text-indigo-600 inline-block mb-8"><Shield size={32} /></div>
                <h3 className="text-2xl font-extrabold mb-4 leading-tight">Free weekly backups and free snapshot</h3>
                <p className="text-[var(--muted-foreground)] font-medium text-sm leading-relaxed">Keep your data safe at all times and use manual snapshots to revert if something goes wrong.</p>
              </div>
              <RefreshCw className="absolute -bottom-10 -right-10 w-48 h-48 opacity-[0.03] group-hover:rotate-90 transition-transform duration-1000" />
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-32">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="bg-indigo-600 p-16 md:p-24 rounded-[3.5rem] shadow-2xl shadow-indigo-500/20 text-white">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8 leading-none">
              30-day money-back guarantee
            </h2>
            <p className="text-indigo-100 text-lg mb-12 font-medium opacity-80">Try it risk-free with our 30-day money-back guarantee. See our refund policy for details.</p>
            <Link href="/auth/register" className="inline-block bg-white text-indigo-600 px-12 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl">
              Get started
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 border-t border-[var(--border)] bg-[var(--muted)]/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-2.5 font-bold text-2xl tracking-tight">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Server className="w-6 h-6 text-white" />
            </div>
            <span>Nyx<span className="text-indigo-600">Hosting</span></span>
          </div>
          <div className="flex gap-10 text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-widest">
            <Link href="#" className="hover:text-indigo-600 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-indigo-600 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-indigo-600 transition-colors">Refunds</Link>
          </div>
          <p className="text-[var(--muted-foreground)] text-xs font-medium">© 2026 NyxHosting. Empowering LXC technology.</p>
        </div>
      </footer>
    </div>
  );
}
