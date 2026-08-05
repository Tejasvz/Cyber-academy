import React from 'react';
import { Target, ShieldAlert, Users, Play, CheckSquare, ChevronRight } from 'lucide-react';

interface MissionBriefingModalProps {
  onLaunchMission?: () => void;
}

export const MissionBriefingModal: React.FC<MissionBriefingModalProps> = ({ onLaunchMission }) => {
  return (
    <div className="w-full h-full bg-[#0a0e14]/95 text-[#dfe2eb] font-mono flex flex-col justify-between p-4 rounded-lg select-none">
      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-cyan-500/30 pb-3">
        <div className="flex items-center space-x-3">
          <Target size={20} className="text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold text-cyan-300 tracking-wider">OPERATION BRIEFING // BLACK ECHO</h2>
            <p className="text-[11px] text-gray-400">TACTICAL DISPATCH DIRECTIVE</p>
          </div>
        </div>

        <span className="bg-red-950/60 border border-red-500 text-red-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
          PRIORITY 1 // THREAT HIGH
        </span>
      </div>

      {/* Briefing Body */}
      <div className="flex-1 overflow-y-auto my-3 space-y-4 pr-2 text-xs">
        {/* Overview Box */}
        <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-4 space-y-2">
          <h3 className="text-cyan-300 font-bold tracking-wider text-xs">SITUATION OVERVIEW</h3>
          <p className="text-gray-400 leading-relaxed">
            Aether Protocol sweep scripts have isolated Sector Zero's secondary memory grid. A rogue Syndicate frequency is broadcasting encrypted payload data. You must infiltrate the node, map the DNS records, and sever the unauthorized telemetry link before the system triggers an emergency core wipe.
          </p>
        </div>

        {/* Objectives */}
        <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-4 space-y-3">
          <h3 className="text-cyan-300 font-bold tracking-wider text-xs flex items-center gap-1.5">
            <CheckSquare size={14} /> PRIMARY & SECONDARY OBJECTIVES
          </h3>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-teal-300">
              <ChevronRight size={14} className="text-cyan-400" />
              <span>Inspect cleartext credential leaks in the legacy HTTP power grid.</span>
            </div>
            <div className="flex items-center space-x-2 text-teal-300">
              <ChevronRight size={14} className="text-cyan-400" />
              <span>Query DNS records to isolate Syndicate rogue beacons.</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <ChevronRight size={14} className="text-gray-600" />
              <span>[OPTIONAL] Decrypt memory fragment tape logs for Aurelia core backup.</span>
            </div>
          </div>
        </div>

        {/* Recommended Operatives */}
        <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-4 space-y-3">
          <h3 className="text-cyan-300 font-bold tracking-wider text-xs flex items-center gap-1.5">
            <Users size={14} /> RECOMMENDED SQUAD LOADOUT
          </h3>

          <div className="flex space-x-3">
            <div className="flex items-center space-x-2 bg-cyan-950/40 border border-cyan-500/30 rounded p-2">
              <img src="/assets/portraits/aurelia.png" alt="Aurelia" className="w-8 h-8 rounded-full border border-cyan-400" />
              <div>
                <span className="text-cyan-300 font-bold text-[11px]">AURELIA</span>
                <p className="text-[10px] text-gray-400">Tactical AI Support</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-cyan-950/40 border border-cyan-500/30 rounded p-2">
              <img src="/assets/portraits/kaelen.png" alt="Kaelen" className="w-8 h-8 rounded-full border border-cyan-400" />
              <div>
                <span className="text-cyan-300 font-bold text-[11px]">KAELEN</span>
                <p className="text-[10px] text-gray-400">Infiltration Specialist</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-between items-center border-t border-cyan-500/20 pt-3">
        <span className="text-[11px] text-gray-500 flex items-center gap-1">
          <ShieldAlert size={14} className="text-cyan-400" /> DEPLOYMENT READY
        </span>

        <button
          onClick={onLaunchMission}
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-400 text-black font-bold rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.8)] transition flex items-center space-x-2 text-xs"
        >
          <Play size={16} />
          <span className="uppercase tracking-wider">LAUNCH OPERATION</span>
        </button>
      </div>
    </div>
  );
};
