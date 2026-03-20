"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Server, Wallet, Trash2, ArrowLeft, Loader2, 
  Search, RefreshCw, Terminal as TerminalIcon, ShieldCheck
} from "lucide-react";
import ConsoleModal from "@/components/ConsoleModal";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [instances, setInstances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'users' | 'instances'>('users');
  const [search, setSearch] = useState("");
  const [consoleId, setConsoleId] = useState<string | null>(null);
  
  const router = useRouter();

  const fetchData = useCallback(async () => {
    const token = Cookies.get("token");
    const apiBase = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:4000`;
    try {
      const [uRes, iRes] = await Promise.all([
        axios.get(`${apiBase}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiBase}/api/admin/instances`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(uRes.data.users);
      setInstances(iRes.data.instances);
    } catch (e: any) {
      if (e.response?.status === 403) {
        alert("Access Denied: Admin only");
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateCredits = async (userId: string, current: number) => {
    const amount = prompt("Enter new credit amount:", current.toString());
    if (amount === null || isNaN(parseFloat(amount))) return;

    const apiBase = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:4000`;
    try {
      const token = Cookies.get("token");
      await axios.post(`${apiBase}/api/admin/credits/update`, 
        { userId, amount: parseFloat(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (e) {
      alert("Failed to update credits");
    }
  };

  const deleteUser = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}?`)) return;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:4000`;
    try {
      const token = Cookies.get("token");
      await axios.delete(`${apiBase}/api/admin/users/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.error || "Failed to delete user");
    }
  };

  const handleVPSAction = async (id: string, act: string) => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:4000`;
    try {
      const token = Cookies.get("token");
      await axios.post(`${apiBase}/api/vps/${id}/${act}`, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      fetchData();
    } catch (e) {
      alert("Action failed");
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Ubah role user ini menjadi ${newRole}?`)) return;

    const apiBase = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:4000`;
    try {
      const token = Cookies.get("token");
      await axios.post(`${apiBase}/api/admin/role/update`, 
        { userId, role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (e) {
      alert("Failed to update role");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-zinc-950">
      <Loader2 className="animate-spin text-indigo-500" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="text-indigo-500" size={28} />
              <h1 className="text-3xl font-black uppercase tracking-tighter">Admin Panel</h1>
            </div>
            <p className="text-zinc-500 font-medium">Global infrastructure management.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-bold hover:bg-zinc-800 transition-all">
              <ArrowLeft size={16} /> Back to User View
            </button>
            <button onClick={() => fetchData()} className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 p-1.5 bg-zinc-900 rounded-2xl w-fit border border-zinc-800">
          <button 
            onClick={() => setTab('users')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Users size={18} /> Users ({users.length})
          </button>
          <button 
            onClick={() => setTab('instances')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'instances' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Server size={18} /> All VPS ({instances.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder={`Search ${tab === 'users' ? 'by email or name' : 'by VMID or user email'}...`}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Content */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-sm">
          {tab === 'users' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-900 border-b border-zinc-800 text-[10px] uppercase font-black tracking-widest text-zinc-500">
                    <th className="px-8 py-5">User</th>
                    <th className="px-8 py-5">Balance</th>
                    <th className="px-8 py-5">VPS Count</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase())).map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="font-bold text-zinc-100">{u.name || "Unnamed"}</div>
                        <div className="text-xs text-zinc-500 font-medium">{u.email}</div>
                      </td>
                      <td className="px-8 py-6 font-black text-emerald-500">${u.credits.toFixed(2)}</td>
                      <td className="px-8 py-6 font-bold text-indigo-400">{u._count.instances} Active</td>
                      <td className="px-8 py-6">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => toggleRole(u.id, u.role)}
                            className={`p-2 rounded-xl transition-all ${u.role === 'ADMIN' ? 'bg-indigo-600/20 text-indigo-500 hover:bg-zinc-800 hover:text-zinc-400' : 'bg-zinc-800 text-zinc-400 hover:bg-indigo-500/20 hover:text-indigo-500'}`}
                            title={u.role === 'ADMIN' ? "Revoke Admin" : "Make Admin"}
                          >
                            <ShieldCheck size={18} />
                          </button>
                          <button 
                            onClick={() => updateCredits(u.id, u.credits)}
                            className="p-2 bg-zinc-800 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-500 rounded-xl transition-all"
                            title="Edit Billing"
                          >
                            <Wallet size={18} />
                          </button>
                          <button 
                            onClick={() => deleteUser(u.id, u.email)}
                            className="p-2 bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-500 rounded-xl transition-all"
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-900 border-b border-zinc-800 text-[10px] uppercase font-black tracking-widest text-zinc-500">
                    <th className="px-8 py-5">Instance</th>
                    <th className="px-8 py-5">Owner</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {instances.filter(i => i.vmid.toString().includes(search) || i.user.email.toLowerCase().includes(search.toLowerCase())).map((i) => (
                    <tr key={i.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="font-bold text-zinc-100 tracking-tight">VPS-{i.vmid}</div>
                        <div className="text-[10px] font-black uppercase text-indigo-500 mt-1">{i.product.name}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-xs font-bold text-zinc-400">{i.user.email}</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          i.status === 'running' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                        }`}>
                          {i.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => setConsoleId(i.id)}
                            className="p-2 bg-zinc-800 hover:bg-indigo-500/20 text-zinc-400 hover:text-indigo-400 rounded-xl transition-all"
                            title="Access Console"
                          >
                            <TerminalIcon size={18} />
                          </button>
                          <button 
                            onClick={() => handleVPSAction(i.id, i.status === 'running' ? 'stop' : 'start')}
                            className={`p-2 bg-zinc-800 rounded-xl transition-all ${
                              i.status === 'running' ? 'hover:bg-amber-500/20 text-zinc-400 hover:text-amber-500' : 'hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-500'
                            }`}
                          >
                            <RefreshCw size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {consoleId && <ConsoleModal instanceId={consoleId} onClose={() => setConsoleId(null)} />}
      </AnimatePresence>
    </div>
  );
}
