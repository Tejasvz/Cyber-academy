import React from 'react';
import { Minus, Square, X, Lock, Unlock } from 'lucide-react';
import { sound } from '../../utils/audioSynth';

interface SecureChannelWindowProps {
  secureChannelActive: boolean;
  onToggleSecureChannel: () => void;
}

export const SecureChannelWindow: React.FC<SecureChannelWindowProps> = ({
  secureChannelActive,
  onToggleSecureChannel,
}) => {
  return (
    <div className="glass-panel rounded-md flex flex-col select-none shadow-neon-cyan/10">
      {/* Header */}
      <div className="panel-header px-3.5 py-1.5 flex justify-between items-center rounded-t-md">
        <span className="text-[#22d3ee] font-semibold text-xs tracking-wider font-mono-cyber">
          SECURE CHANNEL
        </span>
        <div className="flex gap-2 text-[#22d3ee]/60">
          <Minus className="w-3 h-3 cursor-pointer hover:text-[#22d3ee]" onClick={() => sound.playClick()} />
          <Square className="w-3 h-3 cursor-pointer hover:text-[#22d3ee]" onClick={() => sound.playClick()} />
          <X className="w-3 h-3 cursor-pointer hover:text-[#f87171]" onClick={() => sound.playClick()} />
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 flex gap-3.5 items-center">
        {/* Large Encryption Emblem */}
        <div 
          onClick={onToggleSecureChannel}
          className={`w-14 h-14 rounded-full border flex items-center justify-center relative cursor-pointer shrink-0 transition ${
            secureChannelActive 
              ? 'border-[#22d3ee] shadow-neon-cyan' 
              : 'border-[#f87171] shadow-[0_0_15px_#f87171]'
          }`}
          title="Click to toggle Secure Channel"
        >
          <div className="absolute inset-1 border border-[#22d3ee]/40 rounded-full border-dashed animate-spin-slow"></div>
          {secureChannelActive ? (
            <Lock className="w-5 h-5 text-[#22d3ee] text-glow-cyan" />
          ) : (
            <Unlock className="w-5 h-5 text-[#f87171] animate-pulse" />
          )}
        </div>

        {/* Channel Details */}
        <div className="flex-1 flex flex-col gap-1.5 font-mono-cyber text-[10px]">
          <div className="flex justify-between items-center">
            <span className="text-[#22d3ee]/70">CHANNEL ID</span>
            <span className="text-[#e2e8f0] font-bold">AETHER-7G23-XQ9P</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#22d3ee]/70">ENCRYPTION</span>
            <span className="text-[#e2e8f0]">AES-256 / QUANTUM</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#22d3ee]/70">STATUS</span>
            <div className="flex items-center gap-1">
              {secureChannelActive ? (
                <>
                  <span className="text-[#4ade80] font-bold">SECURE</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] shadow-[0_0_5px_#4ade80]"></div>
                </>
              ) : (
                <>
                  <span className="text-[#f87171] font-bold">COMPROMISED</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f87171] shadow-[0_0_5px_#f87171] animate-ping"></div>
                </>
              )}
            </div>
          </div>

          <div className="mt-1 text-right">
            <button
              onClick={() => {
                if (secureChannelActive) {
                  sound.playWarning();
                } else {
                  sound.playClick();
                }
                onToggleSecureChannel();
              }}
              className={`px-3 py-1 rounded text-[10px] font-mono-cyber border transition ${
                secureChannelActive
                  ? 'border-[#f87171]/80 text-[#f87171] bg-[#f87171]/10 hover:bg-[#f87171]/25'
                  : 'border-[#22d3ee]/80 text-[#22d3ee] bg-[#22d3ee]/10 hover:bg-[#22d3ee]/25'
              }`}
            >
              {secureChannelActive ? 'DISCONNECT' : 'RECONNECT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
