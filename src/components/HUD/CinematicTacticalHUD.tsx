import React, { useState, useEffect } from 'react';
import { Crosshair, Shield, Battery, Radio, AlertTriangle, Activity } from 'lucide-react';

export const CinematicTacticalHUD: React.FC = () => {
  const shield = 88;
  const armor = 94;
  const [energy, setEnergy] = useState(100);
  const activeAlert = 'RADAR SWEEP: Sector 02 Signal Detected';

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => (prev > 20 ? prev - 1 : 100));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-[#04070c]/95 text-[#dfe2eb] font-mono flex flex-col justify-between p-4 rounded-lg select-none relative overflow-hidden">
      {/* Glitch overlay grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-black pointer-events-none" />

      {/* Top HUD Telemetry */}
      <div className="relative z-10 flex justify-between items-center border-b border-cyan-500/30 pb-3 bg-black/40 px-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Radio size={16} className="animate-pulse" />
            <span className="font-bold text-xs">TACTICAL HUD V2</span>
          </div>
          <span className="text-gray-500 text-xs">|</span>
          <span className="text-xs text-teal-300 font-bold">MODE: IN-GAME ENGAGEMENT</span>
        </div>

        {/* Dynamic Threat Alert Banner */}
        {activeAlert && (
          <div className="flex items-center space-x-2 bg-yellow-950/60 border border-yellow-500/50 text-yellow-300 text-xs px-3 py-1 rounded animate-pulse">
            <AlertTriangle size={14} />
            <span>{activeAlert}</span>
          </div>
        )}

        <div className="text-xs text-cyan-400 font-mono">DEFCON 2 // ENGAGED</div>
      </div>

      {/* Central Targeting Reticle View */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-4">
        {/* Reticle graphic */}
        <div className="relative w-64 h-64 border-2 border-cyan-500/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.15)]">
          <div className="w-48 h-48 border border-cyan-400/40 rounded-full border-dashed animate-[spin_10s_linear_infinite]" />
          <Crosshair size={36} className="text-cyan-400 animate-pulse absolute" />

          <div className="absolute top-2 text-[10px] text-cyan-400/70 uppercase tracking-widest font-bold">TARGET LOCK: ENGAGED</div>
          <div className="absolute bottom-2 text-[10px] text-teal-400 font-bold">DIST: 142.8m</div>
        </div>
      </div>

      {/* Bottom Gauges & Action Wheel */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-cyan-500/30 pt-3 bg-black/40 px-4 rounded-lg text-xs">
        {/* Shield */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-cyan-300 font-bold">
            <span className="flex items-center gap-1.5"><Shield size={14} /> SHIELD MATRIX</span>
            <span>{shield}%</span>
          </div>
          <div className="w-full bg-cyan-950/60 h-2 rounded overflow-hidden">
            <div className="bg-cyan-400 h-full transition-all" style={{ width: `${shield}%` }} />
          </div>
        </div>

        {/* Armor */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-teal-300 font-bold">
            <span className="flex items-center gap-1.5"><Activity size={14} /> HULL INTEGRITY</span>
            <span>{armor}%</span>
          </div>
          <div className="w-full bg-teal-950/60 h-2 rounded overflow-hidden">
            <div className="bg-teal-400 h-full transition-all" style={{ width: `${armor}%` }} />
          </div>
        </div>

        {/* Energy */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-indigo-300 font-bold">
            <span className="flex items-center gap-1.5"><Battery size={14} /> CYBER ENERGY</span>
            <span>{energy}%</span>
          </div>
          <div className="w-full bg-indigo-950/60 h-2 rounded overflow-hidden">
            <div className="bg-indigo-400 h-full transition-all" style={{ width: `${energy}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
