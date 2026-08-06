import React, { useState, useEffect } from 'react';
import { Triangle, Volume2, VolumeX, Minus, Square, X, ShieldCheck, ShieldAlert } from 'lucide-react';
import { sound } from '../../utils/audioSynth';

interface TopBarProps {
  secureChannelActive: boolean;
  onToggleSecureChannel: () => void;
  onOpenSystemMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  secureChannelActive,
  onToggleSecureChannel,
}) => {
  const [timeStr, setTimeStr] = useState<string>('12:47:18 UTC');
  const [dateStr, setDateStr] = useState<string>('SAT 27.07.2025');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      const secs = String(now.getUTCSeconds()).padStart(2, '0');
      setTimeStr(`${hours}:${mins}:${secs} UTC`);

      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const dayName = days[now.getUTCDay()];
      const dateNum = String(now.getUTCDate()).padStart(2, '0');
      const monthNum = String(now.getUTCMonth() + 1).padStart(2, '0');
      const yearNum = now.getUTCFullYear();
      setDateStr(`${dayName} ${dateNum}.${monthNum}.${yearNum}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.muted = nextMuted;
    if (!nextMuted) sound.playClick();
  };

  return (
    <header className="w-full h-11 flex justify-between items-center px-4 relative z-40 bg-gradient-to-b from-[#0c1324]/90 to-transparent border-b border-[#22d3ee]/15 backdrop-blur-sm select-none">
      {/* Left Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => sound.playClick()}>
          <div className="p-1 border border-[#22d3ee] bg-[#22d3ee]/10 text-[#22d3ee] rounded-sm group-hover:shadow-[0_0_10px_#22d3ee] transition">
            <Triangle className="w-4 h-4 fill-[#22d3ee]/30" />
          </div>
          <div>
            <h1 className="text-[#22d3ee] font-bold text-sm tracking-widest uppercase leading-none text-glow-cyan">
              PROJECT VEIL
            </h1>
            <p className="text-[9px] text-[#94a3b8] tracking-widest leading-tight font-mono-cyber">
              AETHER PROTOCOL INTERFACE
            </p>
          </div>
        </div>
      </div>

      {/* Center OS Tagline */}
      <div className="hidden md:flex items-center gap-3 font-mono-cyber text-xs tracking-wider">
        <span className="text-[#22d3ee]/80 font-bold">CYBER OS v2.1.7</span>
        <span className="text-[#94a3b8]/60">//</span>
        <span className="text-[#4ade80] text-glow-cyan flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse"></span>
          SECURE SESSION ACTIVE
        </span>
      </div>

      {/* Right Stats & Window Controls */}
      <div className="flex items-center gap-5 font-mono-cyber text-xs">
        <div className="hidden sm:flex items-center gap-3 text-[#e2e8f0]/90">
          <span className="text-[#22d3ee]">{timeStr}</span>
          <span className="text-[#94a3b8]/40">|</span>
          <span className="text-[#94a3b8]">{dateStr}</span>
        </div>

        {/* Secure Channel Badge */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleSecureChannel();
          }}
          className={`flex items-center gap-2 px-2.5 py-1 rounded border transition text-[11px] ${
            secureChannelActive
              ? 'border-[#4ade80]/40 bg-[#4ade80]/10 text-[#4ade80] hover:bg-[#4ade80]/20'
              : 'border-[#f87171]/40 bg-[#f87171]/10 text-[#f87171] hover:bg-[#f87171]/20'
          }`}
          title="Toggle Channel Security"
        >
          {secureChannelActive ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SECURE CHANNEL</span>
              <span className="w-2 h-2 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80]"></span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>UNSECURED</span>
              <span className="w-2 h-2 rounded-full bg-[#f87171] shadow-[0_0_8px_#f87171] animate-ping"></span>
            </>
          )}
        </button>

        {/* Mute Button */}
        <button
          onClick={toggleSound}
          className="p-1 text-[#94a3b8] hover:text-[#22d3ee] transition"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-[#f87171]" /> : <Volume2 className="w-4 h-4 text-[#22d3ee]" />}
        </button>

        {/* Faux Window Controls */}
        <div className="flex items-center gap-2 text-[#94a3b8]/70 hover:text-[#22d3ee] transition pl-2 border-l border-[#22d3ee]/20">
          <Minus className="w-3.5 h-3.5 cursor-pointer hover:text-[#22d3ee]" onClick={() => sound.playClick()} />
          <Square className="w-3.5 h-3.5 cursor-pointer hover:text-[#22d3ee]" onClick={() => sound.playClick()} />
          <X className="w-3.5 h-3.5 cursor-pointer hover:text-[#f87171]" onClick={() => sound.playClick()} />
        </div>
      </div>
    </header>
  );
};
