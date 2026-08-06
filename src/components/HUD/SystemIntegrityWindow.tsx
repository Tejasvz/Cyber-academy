import React from 'react';
import { Minus, X, ArrowRight } from 'lucide-react';
import type { SystemHealth } from '../../types';
import { sound } from '../../utils/audioSynth';

interface SystemIntegrityWindowProps {
  health: SystemHealth;
  onRunDiagnostics: () => void;
}

export const SystemIntegrityWindow: React.FC<SystemIntegrityWindowProps> = ({
  health,
  onRunDiagnostics,
}) => {
  return (
    <div className="glass-panel rounded-md flex flex-col select-none shadow-neon-cyan/10">
      {/* Header */}
      <div className="panel-header px-3.5 py-1.5 flex justify-between items-center rounded-t-md">
        <span className="text-[#22d3ee] font-semibold text-xs tracking-wider font-mono-cyber">
          SYSTEM INTEGRITY
        </span>
        <div className="flex gap-2 text-[#22d3ee]/60">
          <Minus className="w-3 h-3 cursor-pointer hover:text-[#22d3ee]" onClick={() => sound.playClick()} />
          <X className="w-3 h-3 cursor-pointer hover:text-[#f87171]" onClick={() => sound.playClick()} />
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col gap-3">
        {/* Circular Gauge */}
        <div className="flex justify-center my-1">
          <div
            className="relative w-20 h-20 radial-progress flex items-center justify-center shadow-neon-cyan"
            style={{ '--value': `${health.overall}%` } as React.CSSProperties}
          >
            <div className="absolute inset-0 border-2 border-[#22d3ee]/30 rounded-full border-dashed animate-spin-slow"></div>
            <div className="text-center relative z-10 font-mono-cyber">
              <div className="text-xl font-bold text-[#22d3ee] text-glow-cyan leading-none">
                {health.overall}%
              </div>
              <div className="text-[8px] text-[#22d3ee]/70 tracking-widest uppercase mt-0.5">
                OVERALL
              </div>
            </div>
          </div>
        </div>

        {/* 4 Horizontal Stat Bars */}
        <div className="flex flex-col gap-2.5 font-mono-cyber">
          {/* Core Systems */}
          <div>
            <div className="flex justify-between text-[10px] text-[#22d3ee] mb-0.5">
              <span>CORE SYSTEMS</span>
              <span className="font-bold">{health.coreSystems}%</span>
            </div>
            <div className="h-1 bg-[#0b1633] w-full rounded-full overflow-hidden">
              <div
                className="h-full bg-[#22d3ee] shadow-[0_0_5px_#22d3ee]"
                style={{ width: `${health.coreSystems}%` }}
              ></div>
            </div>
          </div>

          {/* Network Stability */}
          <div>
            <div className="flex justify-between text-[10px] text-[#a855f7] mb-0.5">
              <span>NETWORK STABILITY</span>
              <span className="font-bold">{health.networkStability}%</span>
            </div>
            <div className="h-1 bg-[#0b1633] w-full rounded-full overflow-hidden">
              <div
                className="h-full bg-[#a855f7] shadow-[0_0_5px_#a855f7]"
                style={{ width: `${health.networkStability}%` }}
              ></div>
            </div>
          </div>

          {/* AI Reliability */}
          <div>
            <div className="flex justify-between text-[10px] text-[#22d3ee] mb-0.5">
              <span>AI RELIABILITY</span>
              <span className="font-bold">{health.aiReliability}%</span>
            </div>
            <div className="h-1 bg-[#0b1633] w-full rounded-full overflow-hidden">
              <div
                className="h-full bg-[#22d3ee] shadow-[0_0_5px_#22d3ee]"
                style={{ width: `${health.aiReliability}%` }}
              ></div>
            </div>
          </div>

          {/* Secure Channel */}
          <div className="flex justify-between items-center text-[10px] pt-1 border-t border-[#22d3ee]/15">
            <span className="text-[#94a3b8]">SECURE CHANNEL</span>
            <div className="flex items-center gap-1.5 text-[#4ade80]">
              <span className="font-bold">{health.secureChannelActive ? 'ACTIVE' : 'INACTIVE'}</span>
              <div
                className={`w-2 h-2 rounded-full ${
                  health.secureChannelActive
                    ? 'bg-[#4ade80] shadow-[0_0_8px_#4ade80] animate-pulse'
                    : 'bg-[#f87171] shadow-[0_0_8px_#f87171]'
                }`}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-3 py-1.5 border-t border-[#22d3ee]/20 flex justify-between items-center text-[10px] font-mono-cyber text-[#22d3ee]/80">
        <span
          onClick={() => {
            sound.playDiagnosticScan();
            onRunDiagnostics();
          }}
          className="cursor-pointer hover:text-[#22d3ee] transition uppercase font-semibold"
        >
          RUN DIAGNOSTICS
        </span>
        <ArrowRight className="w-3 h-3 cursor-pointer" onClick={onRunDiagnostics} />
      </div>
    </div>
  );
};
