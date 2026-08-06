import React from 'react';
import { Minus, Square, X, Hexagon, Award, Triangle, Crosshair, Zap, Star, ArrowRight } from 'lucide-react';
import type { Operator } from '../../types';
import { sound } from '../../utils/audioSynth';

interface OperatorStatusWindowProps {
  operator: Operator;
  onOpenProfile: () => void;
}

export const OperatorStatusWindow: React.FC<OperatorStatusWindowProps> = ({
  operator,
  onOpenProfile,
}) => {
  return (
    <div className="glass-panel rounded-md flex flex-col select-none shadow-neon-cyan/10">
      {/* Header */}
      <div className="panel-header px-3.5 py-1.5 flex justify-between items-center rounded-t-md">
        <span className="text-[#22d3ee] font-semibold text-xs tracking-wider font-mono-cyber">
          OPERATOR STATUS
        </span>
        <div className="flex gap-2 text-[#22d3ee]/60">
          <Minus className="w-3 h-3 cursor-pointer hover:text-[#22d3ee]" onClick={() => sound.playClick()} />
          <Square className="w-3 h-3 cursor-pointer hover:text-[#22d3ee]" onClick={() => sound.playClick()} />
          <X className="w-3 h-3 cursor-pointer hover:text-[#f87171]" onClick={() => sound.playClick()} />
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col gap-3">
        {/* Operator Info Row */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-[#a855f7]/10 border border-[#a855f7]/50 rounded flex items-center justify-center relative shrink-0 shadow-neon-purple/20">
            <Hexagon className="w-8 h-8 text-[#a855f7] animate-pulse" />
            <span className="absolute text-[10px] font-bold text-[#22d3ee] font-mono-cyber">
              {operator.name ? operator.name[0].toUpperCase() : 'F'}
            </span>
          </div>

          <div className="flex flex-col gap-0.5 font-mono-cyber text-xs">
            <div className="text-[#22d3ee]">
              OPERATOR: <span className="text-[#e2e8f0] font-bold">{operator.name}</span>
            </div>
            <div className="text-[#4ade80] text-[11px]">
              Clearance: <span className="font-semibold">{operator.clearance}</span>
            </div>
            <div className="text-[#94a3b8] text-[11px]">
              Trust Level: <span className="text-[#22d3ee]">{operator.trustLevel}%</span>
            </div>
          </div>
        </div>

        {/* Level and XP Bar */}
        <div className="flex items-end gap-3 font-mono-cyber">
          <div className="text-center px-2 py-0.5 border border-[#a855f7]/30 bg-[#a855f7]/10 rounded">
            <div className="text-[#a855f7] text-[9px] font-bold tracking-wider">LEVEL</div>
            <div className="text-2xl text-[#a855f7] font-bold leading-none">{operator.level}</div>
          </div>

          <div className="flex-1 pb-0.5">
            <div className="flex justify-between text-[10px] text-[#94a3b8] mb-1">
              <span>XP</span>
              <span>
                {operator.xpCurrent.toLocaleString()} / {operator.xpNext.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 bg-[#0b1633] w-full rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#a855f7] rounded-full shadow-[0_0_8px_#a855f7]"
                style={{ width: `${Math.min(100, (operator.xpCurrent / (operator.xpNext || 1)) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div>
          <h3 className="text-[#22d3ee]/80 text-[10px] font-mono-cyber tracking-wider uppercase mb-1.5">
            BADGES
          </h3>
          <div className="flex gap-2 justify-between">
            <div className="w-9 h-9 border border-[#22d3ee]/30 rounded flex items-center justify-center text-[#22d3ee]/50 hover:border-[#22d3ee] hover:text-[#22d3ee] transition cursor-pointer" title="Cipher Master">
              <Award className="w-4.5 h-4.5" />
            </div>
            <div className="w-9 h-9 border border-[#a855f7]/30 rounded flex items-center justify-center text-[#a855f7]/50 hover:border-[#a855f7] hover:text-[#a855f7] transition cursor-pointer" title="Aether Initiate">
              <Triangle className="w-4.5 h-4.5" />
            </div>
            <div className="w-9 h-9 border border-[#22d3ee] rounded bg-[#22d3ee]/10 flex items-center justify-center text-[#22d3ee] shadow-neon-cyan cursor-pointer" title="Sector Zero Operative (Active)">
              <Crosshair className="w-4.5 h-4.5 text-glow-cyan" />
            </div>
            <div className="w-9 h-9 border border-[#a855f7]/30 rounded flex items-center justify-center text-[#a855f7]/50 hover:border-[#a855f7] hover:text-[#a855f7] transition cursor-pointer" title="Overclock Expert">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <div className="w-9 h-9 border border-[#a855f7]/30 rounded flex items-center justify-center text-[#a855f7]/50 hover:border-[#a855f7] hover:text-[#a855f7] transition cursor-pointer" title="Elite Handler">
              <Star className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>

        {/* View Profile Action */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenProfile();
          }}
          className="text-[#22d3ee] hover:text-[#e2e8f0] transition flex items-center justify-end gap-1.5 text-xs font-mono-cyber mt-0.5 w-full text-right group"
        >
          <span>VIEW PROFILE</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
