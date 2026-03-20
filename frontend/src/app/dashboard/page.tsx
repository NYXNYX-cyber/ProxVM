"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Server, Loader2, Play, Square, HardDrive, Cpu, 
  MemoryStick, Plus, X, RefreshCw, Trash2, ShieldAlert, Terminal as TerminalIcon
} from "lucide-react";
import ConsoleModal from "@/components/ConsoleModal";

const LXCStats = ({ id, onNotFound, onStatusUpdate }: { id: string, onNotFound: () => void, onStatusUpdate: (status: string) => void }) => {
  const [data, setData] = useState<any>(null);

  const sync = useCallback(async () => {
    try {
      const token = Cookies.get("token");
      const apiBase = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:4000`;
      const res = await axios.get(`${apiBase}/api/vps/${id}/status?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data.status);
      if (res.data.status?.status) {
        onStatusUpdate(res.data.status.status);
      }
    } catch (err: any) {
      if (err.response?.status === 404) onNotFound();
    }
  }, [id, onNotFound, onStatusUpdate]);

  useEffect(() => {
    sync();
    const t = setInterval(sync, 5000);
    return () => clearInterval(t);
  }, [sync]);

  if (!data) return <div className="h-20 flex items-center justify-center opacity-20 text-xs font-medium tracking-tight">Syncing...</div>;
  
  const isRunning = data.status === 'running';
  const cpu = (data.cpu * 100).toFixed(1);
  const ram = (data.mem / (1024**3)).toFixed(1);
  const max = (data.maxmem / (1024**3)).toFixed(0);

  return (
    <div className="mt-6 space-y-4 pt-4 border-t border-[var(--border)]">
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-bold text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1.5"><Cpu size={12} /> CPU</span>
          <span className={isRunning ? "text-indigo-500" : ""}>{cpu}%</span>
        </div>
        <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: isRunning ? `${cpu}%` : "0%" }} 
            className="h-full bg-indigo-500 transition-all duration-500" 
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-bold text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1.5"><MemoryStick size={12} /> RAM</span>
          <span className={isRunning ? "text-emerald-500" : ""}>{ram} / {max} GB</span>
        </div>
        <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: isRunning ? `${(data.mem/data.maxmem)*100}%` : "0%" }} 
            className="h-full bg-emerald-500 transition-all duration-500" 
          />
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [consoleId, setConsoleId] = useState<string | null>(null);
  const router = useRouter();

  const fetchList = useCallback(async () => {
    const token = Cookies.get("token");
    if (!token) return router.push("/auth/login");
    const apiBase = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:4000`;
    try {
      const res = await axios.get(`${apiBase}/api/vps/instances?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setList(res.data.instances);
    } catch (e) {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const handleStatusUpdate = useCallback((id: string, newStatus: string) => {
    setList(prev => prev.map(item => 
      (item.id === id && item.status !== newStatus) 
        ? { ...item, status: newStatus } 
        : item
    ));
  }, []);

  const handleAction = async (id: string, act: string, vmid?: string) => {
    const token = Cookies.get("token");
    const apiBase = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:4000`;
    try {
      if (act === 'delete' || act === 'destroy') {
        const expectedName = `VPS-${vmid}`;
        const userInput = prompt(`PERINGATAN: Tindakan ini permanen.\nKetik "${expectedName}" untuk mengonfirmasi penghapusan:`);
        if (userInput !== expectedName) {
          if (userInput !== null) alert("Konfirmasi gagal. Nama tidak sesuai.");
          return;
        }
      }

      if (act === 'delete' || act === 'destroy') {
        const url = act === 'delete' ? `${apiBase}/api/vps/${id}` : `${apiBase}/api/vps/${id}/destroy`;
        
        if (act === 'delete') {
          await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
        } else {
          // FIX: Untuk POST, argumen kedua adalah body ({}), ketiga baru headers
          await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
        }
        
        setList(prev => prev.filter(i => i.id !== id));
      } else {
        await axios.post(`${apiBase}/api/vps/${id}/${act}`, {}, { headers: { Authorization: `Bearer ${token}` } });
        fetchList();
      }
    } catch (e: any) {
      if (e.response?.status === 404) {
        setList(prev => prev.filter(i => i.id !== id));
      } else {
        alert("Action failed. Please try again.");
      }
    }
  };

  const deploy = async (plan: any) => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:4000`;
    try {
      const token = Cookies.get("token");
      await axios.post(`${apiBase}/api/vps/create`, plan, { headers: { Authorization: `Bearer ${token}` } });
      setShowModal(false);
      fetchList();
      window.dispatchEvent(new Event('balance-update'));
    } catch (e: any) {
      alert(e.response?.data?.error || "Deployment failed");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Workspace</h1>
          <p className="text-[var(--muted-foreground)] mt-1">Manage and monitor your cloud infrastructure.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchList()} 
            className="p-2.5 rounded-xl bg-[var(--muted)] hover:opacity-80 transition-all border border-[var(--border)]"
          >
            <RefreshCw size={20} className="text-[var(--muted-foreground)]" />
          </button>
          <button 
            onClick={() => setShowModal(true)} 
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all"
          >
            <Plus size={18} /> New Instance
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="py-24 text-center bg-[var(--muted)]/30 border-2 border-dashed border-[var(--border)] rounded-[2rem]"
        >
          <div className="inline-flex p-4 rounded-full bg-[var(--muted)] mb-6 text-[var(--muted-foreground)]">
            <Server size={32} />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">No active instances</h3>
          <p className="text-[var(--muted-foreground)] mt-2 max-w-xs mx-auto">Get started by deploying your first high-performance container.</p>
          <button 
            onClick={() => setShowModal(true)} 
            className="mt-8 text-indigo-600 font-bold hover:underline"
          >
            Deploy Instance Now
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {list.map((i) => (
              <motion.div
                key={i.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="nyx-card p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 text-indigo-600">
                        <Server size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg leading-tight">VPS-{i.vmid}</h3>
                        <p className="text-xs text-[var(--muted-foreground)] font-medium mt-0.5">{i.ipv4 || "DHCP Assigned"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        i.status === 'running' 
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                          : i.status === 'stopped'
                            ? 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse'
                      }`}>
                        {i.status}
                      </span>
                    </div>
                  </div>
                  
                  <LXCStats 
                    id={i.id} 
                    onNotFound={() => setList(prev => prev.filter(x => x.id !== i.id))} 
                    onStatusUpdate={(status) => handleStatusUpdate(i.id, status)}
                  />
                </div>

                <div className="mt-8 space-y-3">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleAction(i.id, 'start', i.vmid)} 
                      disabled={i.status === 'running'}
                      className="flex-1 bg-[var(--muted)] dark:bg-zinc-800 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-zinc-800"
                    >
                      Start
                    </button>
                    <button 
                      onClick={() => handleAction(i.id, 'stop', i.vmid)} 
                      disabled={i.status !== 'running'}
                      className="flex-1 bg-[var(--muted)] dark:bg-zinc-800 py-2.5 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-zinc-800"
                    >
                      Stop
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setConsoleId(i.id)} 
                      disabled={i.status !== 'running'}
                      className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-all disabled:opacity-30"
                    >
                      <TerminalIcon size={14} /> Console
                    </button>
                    <button 
                      onClick={() => handleAction(i.id, 'destroy', i.vmid)} 
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold uppercase text-red-500 hover:bg-red-500/10 transition-all border border-red-500/10 hover:border-red-500/30"
                    >
                      <Trash2 size={14} /> Destroy
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal Console */}
      <AnimatePresence>
        {consoleId && (
          <ConsoleModal instanceId={consoleId} onClose={() => setConsoleId(null)} />
        )}
      </AnimatePresence>

      {/* Modal Rebuilt */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] p-10 rounded-[2rem] shadow-2xl"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-[var(--muted-foreground)] hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold tracking-tight mb-8">Deploy Instance</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { planName: 'LOW', price: 4.99, ram: '1GB', cpu: '1 Core', disk: '20GB' },
                  { planName: 'MEDIUM', price: 8.99, ram: '4GB', cpu: '2 Cores', disk: '50GB' }
                ].map((p) => (
                  <div 
                    key={p.planName} 
                    onClick={() => deploy(p)}
                    className="p-6 bg-[var(--muted)]/50 border border-[var(--border)] rounded-2xl cursor-pointer hover:border-indigo-500 hover:bg-[var(--card)] transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-lg group-hover:text-indigo-600 transition-colors">{p.planName}</h4>
                      <span className="text-indigo-600 font-bold">${p.price}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--muted-foreground)] uppercase">
                        <Cpu size={12} /> {p.cpu}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--muted-foreground)] uppercase">
                        <MemoryStick size={12} /> {p.ram}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--muted-foreground)] uppercase">
                        <HardDrive size={12} /> {p.disk} SSD
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
