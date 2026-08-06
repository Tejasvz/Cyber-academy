import React, { useState } from 'react';
import { X, ShieldAlert, Crosshair, CheckCircle, Zap, Terminal } from 'lucide-react';
import type { Mission } from '../../types';
import { sound } from '../../utils/audioSynth';

interface MissionBriefingModalProps {
  mission: Mission;
  onClose: () => void;
  onExecuteOverride: () => void;
}

export const MissionBriefingModal: React.FC<MissionBriefingModalProps> = ({
  mission,
  onClose,
  onExecuteOverride,
}) => {
  const [overrideExecuted, setOverrideExecuted] = useState(false);

  const handleExecute = () => {
    sound.playAureliaPulse();
    setOverrideExecuted(true);
    onExecuteOverride();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030816]/85 backdrop-blur-md select-none">
      <div className="glass-panel-purple border-[#a855f7] rounded-lg w-full max-w-2xl max-h-[85vh] flex flex-col shadow-neon-purple overflow-hidden">
        {/* Header */}
        <div className="panel-header-purple px-5 py-3 flex justify-between items-center border-b border-[#a855f7]/30">
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-[#a855f7]" />
            <span className="text-[#a855f7] font-bold text-sm tracking-widest font-mono-cyber">
              MISSION BRIEFING // {mission.id}
            </span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-[#a855f7] hover:text-[#f87171] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5 font-mono-cyber">
          {/* Mission Header Box */}
          <div className="p-4 bg-[#0b1633]/80 border border-[#22d3ee]/30 rounded flex justify-between items-start gap-4">
            <div>
              <span className="text-[10px] text-[#22d3ee] tracking-widest uppercase font-bold">
                TACTICAL OPERATION
              </span>
              <h2 className="text-xl font-bold text-[#22d3ee] text-glow-cyan">
                {mission.title}
              </h2>
              <p className="text-xs text-[#94a3b8] mt-0.5">{mission.subtitle}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#94a3b8]">THREAT LEVEL</span>
              <div className="text-xs font-bold text-[#f87171] bg-[#f87171]/10 px-2.5 py-1 rounded border border-[#f87171]/40 mt-1 inline-block">
                {mission.threatLevel}
              </div>
            </div>
          </div>

          {/* Description & Intel */}
          <div className="space-y-2">
            <h3 className="text-xs text-[#a855f7] uppercase font-bold tracking-wider">
              SITUATION & INTEL
            </h3>
            <p className="text-xs text-[#e2e8f0]/90 leading-relaxed bg-[#0c1324]/50 p-3 rounded border border-[#a855f7]/20">
              {mission.briefingText}
            </p>
          </div>

          {/* Objectives List */}
          <div className="space-y-2">
            <h3 className="text-xs text-[#22d3ee] uppercase font-bold tracking-wider">
              PRIMARY OBJECTIVES
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 p-2 bg-[#0c1324]/60 border border-[#22d3ee]/20 rounded">
                <CheckCircle className="w-4 h-4 text-[#4ade80]" />
                <span className="text-[#e2e8f0]">Identify Substation Firewall Node</span>
                <span className="ml-auto text-[10px] text-[#4ade80] font-bold">COMPLETE</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 bg-[#0c1324]/60 border border-[#22d3ee]/40 rounded">
                <Zap className="w-4 h-4 text-[#22d3ee] animate-pulse" />
                <span className="text-[#22d3ee] font-bold">Execute Substation Firewall Bypass (Port 443)</span>
                <span className="ml-auto text-[10px] text-[#22d3ee]">IN PROGRESS ({mission.progress}%)</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 bg-[#0c1324]/60 border border-[#94a3b8]/20 rounded">
                <ShieldAlert className="w-4 h-4 text-[#94a3b8]" />
                <span className="text-[#94a3b8]">Restore Core Power to Sector Zero Main Grid</span>
                <span className="ml-auto text-[10px] text-[#94a3b8]">PENDING</span>
              </div>
            </div>
          </div>

          {/* Reward & XP */}
          <div className="flex justify-between items-center p-3 border border-[#a855f7]/30 bg-[#a855f7]/10 rounded">
            <span className="text-xs text-[#a855f7] font-bold">REWARD UPON COMPLETION</span>
            <span className="text-sm text-[#22d3ee] font-bold text-glow-cyan">
              +{mission.rewardXP} XP & TRUST LEVEL +5%
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#a855f7]/30 bg-[#0c1324]/90 flex justify-between items-center">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 text-xs font-mono-cyber border border-[#94a3b8]/40 text-[#94a3b8] rounded hover:text-[#e2e8f0] transition"
          >
            CLOSE BRIEFING
          </button>

          <button
            onClick={handleExecute}
            disabled={overrideExecuted}
            className={`btn-cyber px-6 py-2 rounded text-xs font-mono-cyber font-bold tracking-wider flex items-center gap-2 ${
              overrideExecuted ? 'opacity-50 cursor-not-allowed text-[#4ade80]' : 'text-[#a855f7]'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>{overrideExecuted ? 'OVERRIDE EXECUTED (100%)' : 'EXECUTE OVERRIDE PROTOCOL'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
