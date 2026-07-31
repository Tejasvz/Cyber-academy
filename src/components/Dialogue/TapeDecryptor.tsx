import React, { useState, useEffect, useRef } from 'react';
import { useAudioStore } from '../../store/audioStore';

interface TapeDecryptorProps {
  lessonId: string;
  title: string;
  theoryText: string;
}

export const TapeDecryptor: React.FC<TapeDecryptorProps> = ({
  lessonId,
  title,
  theoryText,
}) => {
  const { playUiClick, playSuccessChime } = useAudioStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [decryptProgress, setDecryptProgress] = useState(0);
  const [revealedText, setRevealedText] = useState('');
  const timerRef = useRef<any>(null);

  // Reset state when lesson changes
  useEffect(() => {
    setIsPlaying(false);
    setDecryptProgress(0);
    setRevealedText('');
    if (timerRef.current) clearInterval(timerRef.current);
  }, [lessonId]);

  useEffect(() => {
    if (isPlaying) {
      const charsPerTick = 6;
      const totalLen = theoryText.length;

      timerRef.current = setInterval(() => {
        setRevealedText((prev) => {
          const nextLen = Math.min(totalLen, prev.length + charsPerTick);
          const progress = Math.floor((nextLen / totalLen) * 100);
          setDecryptProgress(progress);

          if (nextLen >= totalLen) {
            setIsPlaying(false);
            clearInterval(timerRef.current);
            playSuccessChime();
            return theoryText;
          }
          return theoryText.substring(0, nextLen);
        });
      }, 80);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, theoryText, playSuccessChime]);

  const handlePlayToggle = () => {
    playUiClick();
    setIsPlaying(!isPlaying);
  };

  const handleFastDecrypt = () => {
    playUiClick();
    playSuccessChime();
    setIsPlaying(false);
    setRevealedText(theoryText);
    setDecryptProgress(100);
  };

  return (
    <div className="flex flex-col gap-4 font-mono text-xs text-textMain bg-[#0d0d12]/60 border border-primary/10 p-4 rounded-lg shadow-inner select-none relative overflow-hidden">
      {styleBlock}

      <div className="flex justify-between items-center border-b border-primary/20 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></span>
          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
            AETHER LOG DECRYPTOR // ID_{lessonId}
          </span>
        </div>
        <span className="text-[9px] text-textMuted font-bold">DECRYPT_LEVEL: {decryptProgress}%</span>
      </div>

      {/* Cassette Tape Visualizer Screen */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-[#07070a] border border-primary/20 p-4 rounded-md">
        {/* Cassette Body */}
        <div className="relative w-40 h-24 bg-[#14141e] border border-primary/30 rounded p-1.5 flex flex-col justify-between shadow-[0_0_10px_rgba(0,240,255,0.05)] shrink-0">
          {/* Cassette label */}
          <div className="h-6 bg-[#00f0ff]/10 border border-[#00f0ff]/20 rounded flex items-center justify-between px-2 text-[8px] text-primary font-bold overflow-hidden select-none">
            <span className="truncate max-w-[90px]">{title}</span>
            <span className="opacity-60">MEM_RECON</span>
          </div>

          {/* Cassette Center Reels Window */}
          <div className="flex-grow flex items-center justify-center relative bg-[#07070a] border border-primary/20 my-1 rounded">
            {/* Winding tape outline */}
            <div className="absolute inset-x-8 top-1 bottom-1 bg-[#4a3b2c] rounded-md opacity-20"></div>

            {/* Left Reel */}
            <div className="absolute left-10 flex items-center justify-center">
              <svg 
                className={`w-8 h-8 text-primary/70 ${isPlaying ? 'animate-[spin-reel_3s_linear_infinite]' : ''}`} 
                viewBox="0 0 100 100"
              >
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" strokeDasharray="20, 10" fill="none" />
                <circle cx="50" cy="50" r="15" fill="currentColor" />
              </svg>
            </div>

            {/* Right Reel */}
            <div className="absolute right-10 flex items-center justify-center">
              <svg 
                className={`w-8 h-8 text-primary/70 ${isPlaying ? 'animate-[spin-reel_3s_linear_infinite]' : ''}`} 
                viewBox="0 0 100 100"
              >
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" strokeDasharray="20, 10" fill="none" />
                <circle cx="50" cy="50" r="15" fill="currentColor" />
              </svg>
            </div>
          </div>

          {/* Lower Cassette Details */}
          <div className="h-2 flex justify-between items-center px-6 opacity-40">
            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
          </div>
        </div>

        {/* Dynamic Frequency Bars */}
        <div className="flex-grow w-full flex flex-col justify-between h-24 border border-primary/10 p-3 rounded bg-[#0b0b10]/40 relative">
          <div className="text-[7.5px] font-bold text-textMuted uppercase tracking-widest absolute top-1 left-2 select-none">
            SYNAPTIC_FREQ_BAND
          </div>
          
          <div className="flex-grow flex gap-1 items-end justify-center pt-2">
            {Array.from({ length: 18 }).map((_, idx) => {
              const animDelay = `${idx * 0.05}s`;
              return (
                <div
                  key={idx}
                  className="w-[5px] bg-primary rounded-t transition-all"
                  style={{
                    height: isPlaying ? '100%' : '3px',
                    opacity: isPlaying ? 0.95 : 0.25,
                    animation: isPlaying 
                      ? `decrypter-bars 0.6s ease-in-out infinite alternate ${animDelay}` 
                      : 'none',
                    backgroundColor: idx % 3 === 0 ? '#ff00ff' : idx % 2 === 0 ? '#00f0ff' : '#39ff14',
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2 justify-between border-t border-primary/10 pt-3 select-none">
        <div className="flex gap-2">
          <button
            onClick={handlePlayToggle}
            className={`px-4 py-1.5 rounded font-bold uppercase tracking-wider text-[9px] border transition-all cursor-pointer ${
              isPlaying
                ? 'bg-secondary/15 border-secondary text-secondary shadow-[0_0_8px_rgba(255,0,255,0.15)] animate-pulse'
                : 'bg-primary/10 border-primary text-primary hover:bg-primary/20'
            }`}
          >
            {isPlaying ? '⏸️ PAUSE DECRYPT' : '▶️ DECRYPT TAPE'}
          </button>
          {decryptProgress < 100 && (
            <button
              onClick={handleFastDecrypt}
              className="bg-transparent border border-primary/20 text-textMuted hover:border-primary/50 hover:text-textMain px-3 py-1.5 rounded font-bold uppercase tracking-wider text-[9px] transition-all cursor-pointer"
            >
              ⏩ FAST BYPASS
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[8px] font-bold text-textMuted select-none">
          <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-success animate-ping' : 'bg-error'}`}></span>
          {isPlaying ? 'LINK_ACTIVE' : 'LINK_STANDBY'}
        </div>
      </div>

      {/* Synced Decrypted Text Output */}
      {revealedText && (
        <div className="border border-primary/15 bg-[#0a0a0f]/80 p-3 rounded text-[10px] leading-relaxed select-text mt-1 max-h-48 overflow-y-auto">
          <div className="text-secondary font-bold text-[8.5px] uppercase tracking-wider mb-1.5 select-none border-b border-secondary/10 pb-0.5">
            Decrypted Transcript Telemetry:
          </div>
          <p className="text-textMain whitespace-pre-wrap select-text font-mono">
            {revealedText}
            {isPlaying && <span className="w-1 h-3 bg-primary inline-block ml-0.5 animate-pulse"></span>}
          </p>
        </div>
      )}
    </div>
  );
};

// SVG reels spin keyframes and equalizers
const styleBlock = (
  <style dangerouslySetInnerHTML={{ __html: `
    @keyframes spin-reel {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes decrypter-bars {
      0% { height: 10%; }
      50% { height: 85%; }
      100% { height: 25%; }
    }
  `}} />
);
