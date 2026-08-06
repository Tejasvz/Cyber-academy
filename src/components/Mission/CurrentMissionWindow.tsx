import React from 'react';
import { Minus, Square, X, ArrowRight } from 'lucide-react';
import { sound } from '../../utils/audioSynth';

interface CurrentMissionWindowProps {
  onOpenBriefing: () => void;
  title?: string;
  subtitle?: string;
  objective?: string;
  progress?: number;
}

export const CurrentMissionWindow: React.FC<CurrentMissionWindowProps> = ({
  onOpenBriefing,
  title = 'OPERATION BLACK ECHO',
  subtitle = 'INVESTIGATE POWER FAILURE / IN SECTOR ZERO',
  objective = 'Override the substation firewall and restore power.',
  progress = 63,
}) => {
  const missionIconUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuA74o33ktE7osLtjiY9YFGyU1T-sUYacT4coyK66E-pJBA7-7dcukkw1MYUTGyhd9BURNAHWqbuSv-TIsEYtN6Vjq50Nl1Tv8ZNV_v-bMGHNA9CoGEjqozFcgd0udI6NrzYcY1Qi8Ho4Uv78QTmAybXr33S1D6-m6cfO1VFTL-GIypJXQ0kqTHRb50SUqjtY5DnUZ0jP-VRJdwaW9YJnexgUY08z_Y5XLWppj2ZepbhOKjJP4GExmgu";

  return (
    <div className="glass-panel-purple rounded-md flex flex-col select-none shadow-neon-purple/10">
      {/* Header */}
      <div className="panel-header-purple px-3.5 py-1.5 flex justify-between items-center rounded-t-md">
        <span className="text-[#a855f7] font-semibold text-xs tracking-wider font-mono-cyber">
          CURRENT MISSION
        </span>
        <div className="flex gap-2 text-[#a855f7]/60">
          <Minus className="w-3 h-3 cursor-pointer hover:text-[#a855f7]" onClick={() => sound.playClick()} />
          <Square className="w-3 h-3 cursor-pointer hover:text-[#a855f7]" onClick={() => sound.playClick()} />
          <X className="w-3 h-3 cursor-pointer hover:text-[#f87171]" onClick={() => sound.playClick()} />
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h2 className="text-[#22d3ee] text-sm sm:text-base font-bold mb-0.5 tracking-wide text-glow-cyan">
              {title}
            </h2>
            <p className="text-[#94a3b8] text-[11px] leading-tight font-mono-cyber uppercase">
              {subtitle}
            </p>
          </div>

          {/* Holographic Blueprint Preview Icon */}
          <div className="w-14 h-14 bg-[#22d3ee]/10 border border-[#22d3ee]/30 rounded flex items-center justify-center p-1 relative shrink-0 overflow-hidden">
            <img
              src={missionIconUrl}
              alt="Blueprint Schematic"
              className="w-full h-full object-contain opacity-80 mix-blend-screen"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* SVG Wireframe Fallback Overlay */}
            <svg viewBox="0 0 40 40" className="absolute inset-1 w-8 h-8 text-[#22d3ee] opacity-70">
              <polygon points="20,4 36,36 4,36" fill="none" stroke="#22d3ee" strokeWidth="1" />
              <polygon points="20,12 30,32 10,32" fill="none" stroke="#a855f7" strokeWidth="1" />
              <circle cx="20" cy="24" r="4" fill="#22d3ee" className="animate-ping" />
            </svg>
          </div>
        </div>

        <div>
          <h3 className="text-[#22d3ee]/80 text-[10px] font-mono-cyber tracking-wider uppercase mb-0.5">
            OBJECTIVE
          </h3>
          <p className="text-[#e2e8f0] text-xs leading-snug font-mono-cyber">
            {objective}
          </p>
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono-cyber text-[#a855f7] mb-1">
            <span>PROGRESS</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="h-1.5 bg-[#0b1633] w-full rounded-full overflow-hidden p-[1px]">
            <div className="h-full progress-bar-fill rounded-full shadow-[0_0_8px_#22d3ee]" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onOpenBriefing();
          }}
          className="w-full py-1.5 px-3 border border-[#a855f7]/50 bg-[#a855f7]/10 text-[#a855f7] hover:bg-[#a855f7]/25 transition flex justify-between items-center text-xs font-mono-cyber tracking-wider rounded-sm group mt-0.5"
        >
          <span>OPEN MISSION BRIEFING</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
