import React from 'react';
import { Minus, Square, X, FileCode, FileText, ArrowRight } from 'lucide-react';
import type { IntelItem } from '../../types';
import { sound } from '../../utils/audioSynth';

interface RecentIntelWindowProps {
  intelList: IntelItem[];
  onOpenIntelDatabase: (selectedItem?: IntelItem) => void;
}

export const RecentIntelWindow: React.FC<RecentIntelWindowProps> = ({
  intelList,
  onOpenIntelDatabase,
}) => {
  const schematicImgUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDFIOBila-P-RTyDZkQY_iFHChLFv826-uWjt75EGeWCbZduAMTv-LrgMJJXLF7Y_Xy5_gwaZXQuU68IUNwSxEhWAn5RNi7N0jh3YIaXNytEbdkrmYVnvAyNcUKX335vddooh4iD8a9_DOVhhX9_9Pi54C3wHu5eLrQhUjKK7YXUC09QRqupF7bmfX4_eD7BJQ4po9ByAPccxIeNhIFGduVoSTaQZNgtQjzFMSm369Lo267860BFQid";

  return (
    <div className="glass-panel rounded-md flex flex-col select-none shadow-neon-cyan/10">
      {/* Header */}
      <div className="panel-header px-3.5 py-1.5 flex justify-between items-center rounded-t-md">
        <span className="text-[#22d3ee] font-semibold text-xs tracking-wider font-mono-cyber">
          RECENT INTEL
        </span>
        <div className="flex gap-2 text-[#22d3ee]/60">
          <Minus className="w-3 h-3 cursor-pointer hover:text-[#22d3ee]" onClick={() => sound.playClick()} />
          <Square className="w-3 h-3 cursor-pointer hover:text-[#22d3ee]" onClick={() => sound.playClick()} />
          <X className="w-3 h-3 cursor-pointer hover:text-[#f87171]" onClick={() => sound.playClick()} />
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5 flex flex-col gap-2">
        {/* Card 1: Schematics */}
        <div
          onClick={() => {
            sound.playClick();
            onOpenIntelDatabase(intelList[0]);
          }}
          className="flex bg-[#0b1633]/60 border border-[#22d3ee]/20 rounded p-2 gap-2.5 items-center hover:border-[#22d3ee]/60 hover:bg-[#0b1633] transition cursor-pointer group"
        >
          <div className="w-11 h-9 bg-[#030816] border border-[#22d3ee]/30 rounded flex items-center justify-center relative shrink-0 overflow-hidden">
            <img
              src={schematicImgUrl}
              alt="Grid Schematic"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-60 mix-blend-screen group-hover:opacity-90 transition"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute right-1 top-0.5 text-[9px] text-[#22d3ee] font-mono-cyber font-bold">1</div>
          </div>
          <div className="flex-1 min-w-0 font-mono-cyber">
            <div className="text-[#22d3ee] font-bold text-[10px] uppercase truncate group-hover:text-glow-cyan">
              POWER GRID SCHEMATICS
            </div>
            <div className="text-[9px] text-[#94a3b8] truncate">Sector Zero / Substation Node</div>
            <div className="text-[8px] text-[#94a3b8]/70 mt-0.5">27.07.2025</div>
          </div>
        </div>

        {/* Card 2: Firewall Config */}
        <div
          onClick={() => {
            sound.playClick();
            onOpenIntelDatabase(intelList[1]);
          }}
          className="flex bg-[#0b1633]/60 border border-[#22d3ee]/20 rounded p-2 gap-2.5 items-center hover:border-[#22d3ee]/60 hover:bg-[#0b1633] transition cursor-pointer group"
        >
          <div className="w-11 h-9 bg-[#030816] border border-[#22d3ee]/30 rounded flex items-center justify-center relative shrink-0">
            <FileCode className="w-4 h-4 text-[#22d3ee]/70 group-hover:text-[#22d3ee]" />
            <div className="absolute right-1 top-0.5 text-[9px] text-[#22d3ee] font-mono-cyber font-bold">2</div>
          </div>
          <div className="flex-1 min-w-0 font-mono-cyber">
            <div className="text-[#22d3ee] font-bold text-[10px] uppercase truncate group-hover:text-glow-cyan">
              FIREWALL CONFIG LEAK
            </div>
            <div className="text-[9px] text-[#94a3b8] truncate">Possible exploit vector detected</div>
            <div className="text-[8px] text-[#94a3b8]/70 mt-0.5">27.07.2025</div>
          </div>
        </div>

        {/* Card 3: Memo */}
        <div
          onClick={() => {
            sound.playClick();
            onOpenIntelDatabase(intelList[2]);
          }}
          className="flex bg-[#0b1633]/60 border border-[#22d3ee]/20 rounded p-2 gap-2.5 items-center hover:border-[#22d3ee]/60 hover:bg-[#0b1633] transition cursor-pointer group"
        >
          <div className="w-11 h-9 bg-[#030816] border border-[#22d3ee]/30 rounded flex items-center justify-center relative shrink-0">
            <FileText className="w-4 h-4 text-[#22d3ee]/70 group-hover:text-[#22d3ee]" />
            <div className="absolute right-1 top-0.5 text-[9px] text-[#22d3ee] font-mono-cyber font-bold">3</div>
          </div>
          <div className="flex-1 min-w-0 font-mono-cyber">
            <div className="text-[#22d3ee] font-bold text-[10px] uppercase truncate group-hover:text-glow-cyan">
              AETHER INTERNAL MEMO
            </div>
            <div className="text-[9px] text-[#94a3b8] truncate">Regarding recent failures</div>
            <div className="text-[8px] text-[#94a3b8]/70 mt-0.5">27.07.2025</div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-3 py-1.5 border-t border-[#22d3ee]/20 flex justify-between items-center text-[10px] font-mono-cyber text-[#22d3ee]/80">
        <span
          onClick={() => {
            sound.playClick();
            onOpenIntelDatabase();
          }}
          className="cursor-pointer hover:text-[#22d3ee] transition uppercase font-semibold"
        >
          VIEW INTEL DATABASE
        </span>
        <ArrowRight className="w-3 h-3 cursor-pointer" onClick={() => onOpenIntelDatabase()} />
      </div>
    </div>
  );
};
