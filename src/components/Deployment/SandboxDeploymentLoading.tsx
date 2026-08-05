import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, ShieldCheck, Terminal, Radio, CheckCircle2 } from 'lucide-react';

interface SandboxDeploymentLoadingProps {
  onComplete: () => void;
  targetSector?: string;
}

export const SandboxDeploymentLoading: React.FC<SandboxDeploymentLoadingProps> = ({
  onComplete,
  targetSector = 'SECTOR ZERO // GRID 01'
}) => {
  const [progress, setProgress] = useState(0);
  const [subsystems, setSubsystems] = useState([
    { name: 'Synaptic Matrix Tunneling', status: 'PENDING', progress: 0 },
    { name: 'Aether DNS Encryption Mesh', status: 'PENDING', progress: 0 },
    { name: 'Sector Zero Radar Link', status: 'PENDING', progress: 0 },
    { name: 'Tactical HUD Telemetry', status: 'PENDING', progress: 0 }
  ]);

  const [logs, setLogs] = useState<string[]>([
    '[INIT] Starting sandbox deployment sequence...',
    `[TARGET] Sector bound: ${targetSector}`
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 600);
          return 100;
        }

        const next = prev + 2;

        // Update subsystems status based on progress
        setSubsystems(subs =>
          subs.map((sub, idx) => {
            const subTarget = (idx + 1) * 25;
            if (next >= subTarget) {
              return { ...sub, status: 'ONLINE', progress: 100 };
            } else if (next > subTarget - 25) {
              const subProg = Math.min(100, Math.floor(((next - (subTarget - 25)) / 25) * 100));
              return { ...sub, status: 'INITIALIZING', progress: subProg };
            }
            return sub;
          })
        );

        if (next === 26) {
          setLogs(l => [...l, '[OK] Synaptic Matrix synchronized. Lock established.']);
        } else if (next === 52) {
          setLogs(l => [...l, '[OK] Aether DNS nodes verified. Cryptographic tunnel secure.']);
        } else if (next === 78) {
          setLogs(l => [...l, '[OK] Radar link active. Scanning threat vectors.']);
        } else if (next === 96) {
          setLogs(l => [...l, '[READY] Deployment complete. Initializing OS environment.']);
        }

        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete, targetSector]);

  return (
    <div className="fixed inset-0 z-50 bg-[#06090e] text-[#dfe2eb] font-mono flex flex-col items-center justify-center p-6 select-none">
      {/* Glitch overlay line */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,240,255,0.03)_51%)] bg-[length:100%_4px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-black/80 border border-cyan-500/40 rounded-xl p-8 shadow-[0_0_50px_rgba(0,240,255,0.2)] space-y-6 relative overflow-hidden backdrop-blur-xl"
      >
        {/* Top Header */}
        <div className="flex justify-between items-center border-b border-cyan-500/30 pb-4">
          <div className="flex items-center space-x-3">
            <Radio size={20} className="text-cyan-400 animate-pulse" />
            <div>
              <h2 className="text-lg font-bold text-cyan-300 tracking-wider">SANDBOX DEPLOYMENT SEQUENCE</h2>
              <p className="text-xs text-gray-400">{targetSector}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-cyan-400 font-mono">{progress}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-cyan-950/50 rounded-full h-3 p-0.5 border border-cyan-500/30 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-400 h-full rounded-full shadow-[0_0_15px_rgba(0,240,255,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Subsystem status list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {subsystems.map((sub, idx) => (
            <div
              key={idx}
              className="bg-cyan-950/30 border border-cyan-500/20 rounded-lg p-3 flex justify-between items-center text-xs"
            >
              <div className="flex items-center space-x-2">
                <Cpu size={14} className={sub.status === 'ONLINE' ? 'text-teal-400' : 'text-cyan-500/50'} />
                <span className="text-gray-300 font-semibold">{sub.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                {sub.status === 'ONLINE' ? (
                  <span className="text-teal-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> ONLINE
                  </span>
                ) : (
                  <span className="text-cyan-400">{sub.progress}%</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Diagnostic Logs Terminal */}
        <div className="bg-black/90 border border-cyan-500/30 rounded-lg p-3 h-32 overflow-y-auto text-xs space-y-1 font-mono">
          <div className="text-gray-500 border-b border-cyan-500/20 pb-1 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1"><Terminal size={12} /> DEPLOYMENT LOG</span>
            <span className="text-[10px] text-cyan-400">STREAM ACTIVE</span>
          </div>
          {logs.map((log, idx) => (
            <div key={idx} className="text-cyan-300/90 flex items-center space-x-2">
              <span className="text-cyan-500">&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>

        {/* Bottom Lock Status */}
        <div className="flex justify-between items-center text-xs text-gray-400 border-t border-cyan-500/20 pt-3">
          <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-cyan-400" /> SECURE SANDBOX ENCLAVE</span>
          <span className="animate-pulse text-cyan-400">CONNECTING...</span>
        </div>
      </motion.div>
    </div>
  );
};
