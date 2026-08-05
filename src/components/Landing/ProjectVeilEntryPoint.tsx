import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShaderBackground, type ShaderPreset } from '../Shaders/ShaderBackground';
import { Play, Volume2, VolumeX, ShieldAlert, Cpu, Terminal as TerminalIcon, Sparkles } from 'lucide-react';

interface ProjectVeilEntryPointProps {
  onEnter: () => void;
}

export const ProjectVeilEntryPoint: React.FC<ProjectVeilEntryPointProps> = ({ onEnter }) => {
  const [muted, setMuted] = useState(false);
  const [currentShader, setCurrentShader] = useState<ShaderPreset>('grid');
  const [bootLog, setBootLog] = useState<string[]>([]);

  useEffect(() => {
    const logs = [
      '[SYSTEM] Initializing Aether Protocol v4.09...',
      '[SECURITY] Synaptic Encryption Key: Verified',
      '[NET] Sector Zero Gateway: Operational (Node 8080)',
      '[AI] Daemon Aurelia: Core Online',
      '[STATUS] Ready for Operator Uplink...'
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setBootLog(prev => [...prev, log]);
      }, (index + 1) * 400);
    });
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#0a0e14] text-[#dfe2eb] font-mono overflow-hidden flex flex-col justify-between p-6 select-none">
      {/* Background WebGL Shader */}
      <ShaderBackground preset={currentShader} />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-black/60 to-black pointer-events-none z-0" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex justify-between items-center border-b border-cyan-500/20 pb-4 backdrop-blur-md bg-black/30 px-6 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
          <span className="text-cyan-400 font-bold tracking-widest text-sm uppercase">PROJECT VEIL // SYST_ONLINE</span>
        </div>

        {/* Shader Switcher & Audio */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1 bg-cyan-950/40 border border-cyan-500/30 rounded px-2 py-1">
            <span className="text-gray-400">SHADER:</span>
            {(['grid', 'pulse', 'scanline', 'vortex'] as ShaderPreset[]).map(preset => (
              <button
                key={preset}
                onClick={() => setCurrentShader(preset)}
                className={`px-2 py-0.5 rounded transition ${currentShader === preset ? 'bg-cyan-500 text-black font-bold' : 'text-cyan-400 hover:bg-cyan-500/20'}`}
              >
                {preset.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => setMuted(!muted)}
            className="p-2 border border-cyan-500/30 rounded hover:bg-cyan-500/20 text-cyan-400 transition"
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* Center Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/40 rounded-full text-cyan-300 text-xs tracking-wider">
            <Sparkles size={14} className="text-cyan-400 animate-spin" />
            <span>CYBERNETIC INTERFACE V2.6 // CLASSIFIED ACCESS</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-200 to-indigo-400 drop-shadow-[0_0_25px_rgba(0,240,255,0.4)]">
            PROJECT VEIL
          </h1>

          <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base font-light leading-relaxed">
            Neural Cyber-Academy Operations Platform. Connect your synaptic link to inspect threat vectors, manage operative dossiers, and deploy tactical countermeasures.
          </p>

          {/* Enter System Action */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onEnter}
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-400 text-black font-bold rounded-lg shadow-[0_0_30px_rgba(0,240,255,0.5)] hover:shadow-[0_0_50px_rgba(0,240,255,0.8)] hover:scale-105 transition-all duration-300 flex items-center space-x-3"
            >
              <Play className="fill-black" size={20} />
              <span className="tracking-widest uppercase text-base">INITIALIZE SYSTEM</span>
            </button>
          </div>
        </motion.div>

        {/* Live Diagnostics Log Stream */}
        <div className="mt-12 w-full max-w-lg bg-black/60 border border-cyan-500/30 rounded-lg p-4 text-left font-mono text-xs space-y-1.5 backdrop-blur-md shadow-2xl">
          <div className="flex justify-between items-center text-cyan-400/70 border-b border-cyan-500/20 pb-2 mb-2">
            <span className="flex items-center gap-1.5"><TerminalIcon size={14} /> BOOT DIAGNOSTICS</span>
            <span className="text-[10px] uppercase">STATUS: OK</span>
          </div>
          {bootLog.map((log, idx) => (
            <div key={idx} className="text-cyan-300/80 tracking-wide flex items-center space-x-2">
              <span className="text-cyan-600">&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 border-t border-cyan-500/20 pt-4 backdrop-blur-md bg-black/30 px-6 rounded-lg gap-2">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1"><Cpu size={14} className="text-cyan-400" /> AETHER CORE 4.09</span>
          <span className="flex items-center gap-1"><ShieldAlert size={14} className="text-teal-400" /> DEFCON LEVEL: 2</span>
        </div>
        <div>
          <span>ANTIGRAVITY CYBERNETIC ENGINE © 2026</span>
        </div>
      </div>
    </div>
  );
};
