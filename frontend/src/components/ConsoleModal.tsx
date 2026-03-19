"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { AttachAddon } from "@xterm/addon-attach";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { X, Maximize2, Minimize2, RefreshCw, Smartphone, Monitor } from "lucide-react";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";

interface ConsoleModalProps {
  instanceId: string;
  onClose: () => void;
}

export default function ConsoleModal({ instanceId, onClose }: ConsoleModalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [status, setStatus] = useState("Connecting...");
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      theme: { 
        background: "#09090b", 
        foreground: "#ffffff",
        selectionBackground: "rgba(99, 102, 241, 0.3)"
      },
      fontSize: 13,
      fontFamily: "Menlo, Monaco, 'Courier New', monospace",
      letterSpacing: 0.5,
      allowProposedApi: true
    });

    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();
    
    term.writeln("Connecting to NyxHosting Console...");

    const token = Cookies.get("token");
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.hostname}:4000/console?token=${token}&instanceId=${instanceId}`;

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setStatus("Connected");
      term.writeln("Synchronized. Welcome to LXC Console.");
      const attachAddon = new AttachAddon(socket);
      term.loadAddon(attachAddon);
      term.focus();
      fitAddon.fit();
    };

    socket.onclose = () => {
      setStatus("Disconnected");
      term.writeln("\r\nDisconnected from terminal.");
    };
    
    socket.onerror = () => {
      setStatus("Error");
      term.writeln("\r\nConnection error.");
    };

    // Handle window resize
    const handleResize = () => fitAddon.fit();
    window.addEventListener("resize", handleResize);

    return () => {
      socket.close();
      term.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [instanceId]);

  // Refit when fullscreen changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fitAddonRef.current) fitAddonRef.current.fit();
    }, 100);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[200] flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-4 md:p-10'}`}
    >
      <div 
        className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md" 
        onClick={isFullscreen ? undefined : onClose} 
      />
      
      <motion.div 
        layout
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className={`relative bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col transition-all duration-300
          ${isFullscreen 
            ? 'w-full h-full rounded-0' 
            : 'w-full max-w-6xl h-full max-h-[700px] rounded-[2rem]'
          } overflow-hidden`}
      >
        {/* Header Console */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-zinc-900/80 border-b border-zinc-800 backdrop-blur-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`w-2 h-2 rounded-full ${ 
              status === 'Connected' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse' : 
              status === 'Error' ? 'bg-red-500' : 'bg-amber-500'
            }`} />
            <h3 className="text-xs sm:text-sm font-black text-zinc-100 uppercase tracking-widest flex items-center gap-2">
              <Monitor size={14} className="hidden sm:inline" /> Console Session
            </h3>
            <span className="hidden sm:inline px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] font-bold text-zinc-400">
              ID: {instanceId.substring(0, 8)}...
            </span>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <button 
              onClick={() => fitAddonRef.current?.fit()}
              title="Resync Screen"
              className="p-2 hover:bg-zinc-800 rounded-xl transition-all text-zinc-400 hover:text-indigo-400"
            >
              <RefreshCw size={18} />
            </button>
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-zinc-800 rounded-xl transition-all text-zinc-400 hover:text-white"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-red-500/20 rounded-xl transition-all text-zinc-400 hover:text-red-500"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Terminal Area */}
        <div className="flex-1 bg-zinc-950 p-2 sm:p-4 overflow-hidden relative">
          <div 
            ref={terminalRef} 
            className="w-full h-full"
            style={{ 
              fontFamily: "Menlo, Monaco, 'Courier New', monospace",
            }}
          />
          
          {/* Mobile Helper (Hint) */}
          <div className="absolute bottom-6 right-6 sm:hidden pointer-events-none opacity-40">
            <Smartphone size={24} className="text-white" />
          </div>
        </div>
        
        {/* Footer info (Desktop only) */}
        {!isFullscreen && (
          <div className="hidden sm:flex px-6 py-2 bg-zinc-900/30 border-t border-zinc-800 justify-between items-center">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-tight">NyxHosting SSH Jumper Protocol v1.6</p>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500">
                <Monitor size={10} /> 1080p compatible
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
