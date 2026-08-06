import React, { useState } from 'react';
import { X, Eye, Download } from 'lucide-react';
import type { IntelItem } from '../../types';
import { sound } from '../../utils/audioSynth';

interface IntelDatabaseModalProps {
  intelList: IntelItem[];
  initialSelected?: IntelItem;
  onClose: () => void;
}

export const IntelDatabaseModal: React.FC<IntelDatabaseModalProps> = ({
  intelList,
  initialSelected,
  onClose,
}) => {
  const [selectedIntel, setSelectedIntel] = useState<IntelItem>(
    initialSelected || intelList[0] || {
      id: 'i1',
      number: 1,
      title: 'POWER GRID SCHEMATICS',
      subtitle: 'Sector Zero / Substation Node',
      date: '27.07.2025',
      classification: 'RESTRICTED',
      content: 'PRIMARY POWER NODE 4B MAP:\n- Node Input: 1.21 GW Quantum Feed\n- Main Vulnerability: Substation firewall port 443 listener.\n- Recommended Action: Execute cipher handshake bypass sequence to override main relays.',
    }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030816]/85 backdrop-blur-md select-none">
      <div className="glass-panel border-[#22d3ee] rounded-lg w-full max-w-4xl h-[80vh] flex flex-col shadow-neon-cyan overflow-hidden">
        {/* Header */}
        <div className="panel-header px-5 py-3 flex justify-between items-center border-b border-[#22d3ee]/30">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#22d3ee]" />
            <span className="text-[#22d3ee] font-bold text-sm tracking-widest font-mono-cyber">
              INTEL DATABASE ARCHIVE // CLASSIFIED
            </span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-[#22d3ee] hover:text-[#f87171] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area - Split Sidebar + Viewer */}
        <div className="flex-1 flex overflow-hidden font-mono-cyber">
          {/* Left Intel List */}
          <div className="w-1/3 border-r border-[#22d3ee]/20 bg-[#0c1324]/60 p-3 overflow-y-auto space-y-2">
            <div className="text-[10px] text-[#22d3ee] font-bold tracking-widest uppercase mb-2">
              DECRYPTED FILES ({intelList.length})
            </div>
            {intelList.map((item) => {
              const isSelected = selectedIntel.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedIntel(item);
                  }}
                  className={`p-2.5 rounded border transition cursor-pointer ${
                    isSelected
                      ? 'border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee] shadow-neon-cyan'
                      : 'border-[#22d3ee]/20 bg-[#0b1633]/50 text-[#94a3b8] hover:border-[#22d3ee]/50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded border border-current">
                      #{item.number} {item.classification}
                    </span>
                    <span className="text-[8px] opacity-70">{item.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#e2e8f0] truncate">{item.title}</h4>
                  <p className="text-[10px] opacity-80 truncate">{item.subtitle}</p>
                </div>
              );
            })}
          </div>

          {/* Right Intel Viewer */}
          <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 bg-[#030816]/60">
            <div className="flex justify-between items-start border-b border-[#22d3ee]/20 pb-3">
              <div>
                <span className="text-[10px] text-[#a855f7] font-bold tracking-widest uppercase">
                  FILE #{selectedIntel.number} // {selectedIntel.classification}
                </span>
                <h2 className="text-lg font-bold text-[#22d3ee] text-glow-cyan mt-0.5">
                  {selectedIntel.title}
                </h2>
                <p className="text-xs text-[#94a3b8]">{selectedIntel.subtitle}</p>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  alert(`Exporting classified file ${selectedIntel.title}...`);
                }}
                className="px-3 py-1.5 border border-[#22d3ee]/50 bg-[#22d3ee]/10 text-[#22d3ee] text-xs rounded hover:bg-[#22d3ee]/25 transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EXPORT INTEL</span>
              </button>
            </div>

            {/* Document Content */}
            <div className="p-4 bg-[#0c1324]/90 border border-[#22d3ee]/30 rounded text-xs leading-relaxed text-[#e2e8f0] whitespace-pre-line shadow-inner">
              {selectedIntel.content}
            </div>

            <div className="mt-auto pt-3 border-t border-[#22d3ee]/20 flex justify-between items-center text-[10px] text-[#94a3b8]">
              <span>AUTHENTICATION: AETHER PROTOCOL STAMP VERIFIED</span>
              <span>CLASSIFICATION RESTRICTION APPLIES</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-[#22d3ee]/30 bg-[#0c1324] flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-1.5 text-xs font-mono-cyber border border-[#22d3ee] text-[#22d3ee] bg-[#22d3ee]/10 rounded hover:bg-[#22d3ee]/25 transition"
          >
            CLOSE ARCHIVE
          </button>
        </div>
      </div>
    </div>
  );
};
