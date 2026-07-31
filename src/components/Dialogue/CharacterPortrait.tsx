import React, { useState, useEffect } from 'react';

interface CharacterPortraitProps {
  speaker: 'aurelia' | 'hesper' | 'kaelen' | 'byte' | 'operator';
  expression: string;
  isTyping: boolean;
}

export const CharacterPortrait: React.FC<CharacterPortraitProps> = ({
  speaker,
  expression,
  isTyping,
}) => {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const portraitElement = document.getElementById(`portrait-${speaker}`);
      if (!portraitElement) return;

      const rect = portraitElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate normalized delta coordinates relative to center (-1 to 1)
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);

      // Clamp offset for small translation sweeps
      setMouseOffset({
        x: Math.max(-5, Math.min(5, dx * 6)),
        y: Math.max(-4, Math.min(4, dy * 5)),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [speaker]);

  // Select color themes according to faction lore
  const getThemeColors = () => {
    switch (speaker) {
      case 'aurelia': // Sleek Cyan AI Daemon
        return {
          glow: 'rgba(0, 240, 255, 0.4)',
          border: 'border-primary/30',
          text: 'text-primary',
          hex: '#00f0ff',
        };
      case 'hesper': // Amber Veteran Ops Commander
        return {
          glow: 'rgba(255, 176, 0, 0.4)',
          border: 'border-amber-500/30',
          text: 'text-amber-500',
          hex: '#ffb000',
        };
      case 'kaelen': // Green Syndicate Defector
        return {
          glow: 'rgba(57, 255, 20, 0.4)',
          border: 'border-green-500/30',
          text: 'text-green-500',
          hex: '#39ff14',
        };
      case 'byte': // Red Alert Rogue Sentinel
        return {
          glow: 'rgba(255, 42, 42, 0.4)',
          border: 'border-red-500/30',
          text: 'text-red-500',
          hex: '#ff2a2a',
        };
      default: // Blue/Slate Operator HUD
        return {
          glow: 'rgba(0, 150, 255, 0.3)',
          border: 'border-slate-500/30',
          text: 'text-slate-400',
          hex: '#64748b',
        };
    }
  };

  const colors = getThemeColors();
  const isGlitched = expression === 'glitch';
  const showTalk = isTyping || expression === 'talking';

  return (
    <div 
      id={`portrait-${speaker}`}
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0f]/90 select-none"
    >
      {/* Dynamic Keyframes Injector */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blink-portrait {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.08); }
        }
        @keyframes talk-wave-1 {
          0% { height: 3px; }
          100% { height: 14px; }
        }
        @keyframes talk-wave-2 {
          0% { height: 4px; }
          100% { height: 18px; }
        }
        @keyframes talk-wave-3 {
          0% { height: 2px; }
          100% { height: 12px; }
        }
        @keyframes scanline-portrait {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes rotate-ring-portrait {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes glitch-shake {
          0% { transform: translate(0, 0) skewX(0deg); filter: hue-rotate(0deg); }
          10% { transform: translate(-2px, 1px) skewX(-2deg); filter: hue-rotate(90deg); }
          20% { transform: translate(2px, -1px) skewX(3deg); }
          30% { transform: translate(0, 0); }
          40% { transform: translate(-1px, -2px); filter: saturate(2); }
          50% { transform: translate(2px, 2px); }
          60% { transform: translate(0, 0); }
          90% { transform: translate(-3px, -1px) skewX(-4deg); }
          100% { transform: translate(0, 0); }
        }
      `}} />

      {/* Grid Scanline Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-10 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 4px, 6px 100%',
        }}
      />

      {/* Moving CRT scan bar */}
      <div 
        className="absolute w-full h-[2px] opacity-25 pointer-events-none z-10"
        style={{
          background: `linear-gradient(to bottom, transparent, ${colors.hex}, transparent)`,
          animation: 'scanline-portrait 2.8s linear infinite',
        }}
      />

      {/* Hologram Vector Matrix Container */}
      <div 
        className={`relative w-20 h-20 flex items-center justify-center ${
          isGlitched ? 'animate-[glitch-shake_0.6s_infinite]' : ''
        }`}
        style={{
          filter: `drop-shadow(0 0 8px ${colors.glow})`,
        }}
      >
        {/* Outer Tech HUD Rings */}
        <div 
          className="absolute inset-0 rounded-full border border-dashed animate-[rotate-ring-portrait_24s_linear_infinite]"
          style={{ borderColor: `${colors.hex}18` }}
        />
        <div 
          className="absolute w-[86%] h-[86%] rounded-full border border-dotted animate-[rotate-ring-portrait_12s_linear_reverse_infinite]"
          style={{ borderColor: `${colors.hex}22` }}
        />

        {/* Character Specific Vectors */}
        <svg className="w-12 h-12 relative z-20" viewBox="0 0 100 100" fill="none">
          {speaker === 'aurelia' && (
            /* Aurelia: Elegant crystalline AI core */
            <g stroke={colors.hex} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="50,15 80,35 80,65 50,85 20,65 20,35" strokeDasharray="300" strokeDashoffset="0" />
              <polygon points="50,25 72,40 72,60 50,75 28,60 28,40" strokeOpacity="0.4" style={{ transform: `translate(${mouseOffset.x * 0.3}px, ${mouseOffset.y * 0.3}px)`, transformOrigin: '50px 50px' }} />
              {/* Glowing vertical core line */}
              <line x1="50" y1="20" x2="50" y2="80" strokeDasharray="4, 4" strokeOpacity="0.7" style={{ transform: `translate(${mouseOffset.x * 0.5}px, ${mouseOffset.y * 0.5}px)`, transformOrigin: '50px 50px' }} />
              {/* Blinking eyes */}
              <g style={{ animation: 'blink-portrait 4.2s infinite', transform: `translate(${mouseOffset.x * 0.8}px, ${mouseOffset.y * 0.8}px)`, transformOrigin: '50px 45px' }}>
                <line x1="33" y1="45" x2="45" y2="45" strokeWidth="4" />
                <line x1="55" y1="45" x2="67" y2="45" strokeWidth="4" />
              </g>
            </g>
          )}

          {speaker === 'hesper' && (
            /* Hesper: Robust shield tech visor */
            <g stroke={colors.hex} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20,25 L80,25 L85,45 L75,75 L50,85 L25,75 L15,45 Z" />
              <g style={{ transform: `translate(${mouseOffset.x * 0.7}px, ${mouseOffset.y * 0.7}px)`, transformOrigin: '50px 50px' }}>
                <rect x="28" y="38" width="44" height="12" rx="2" fill={`${colors.hex}22`} />
                <circle cx="35" cy="44" r="1.5" fill={colors.hex} />
                <circle cx="65" cy="44" r="1.5" fill={colors.hex} />
                <g style={{ animation: 'blink-portrait 3.6s infinite', transformOrigin: '50px 44px' }}>
                  <line x1="28" y1="44" x2="72" y2="44" strokeWidth="1.5" strokeOpacity="0.9" />
                </g>
              </g>
              {/* Tactical collar lines */}
              <path d="M30,80 L38,90 L62,90 L70,80" strokeWidth="2" strokeOpacity="0.6" style={{ transform: `translate(${mouseOffset.x * 0.2}px, ${mouseOffset.y * 0.2}px)`, transformOrigin: '50px 85px' }} />
            </g>
          )}

          {speaker === 'kaelen' && (
            /* Kaelen: Decentralized node network mask */
            <g stroke={colors.hex} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M50,15 L78,28 L78,55 L50,85 L22,55 L22,28 Z" />
              <g style={{ transform: `translate(${mouseOffset.x * 0.6}px, ${mouseOffset.y * 0.6}px)`, transformOrigin: '50px 50px' }}>
                {/* Decentralized node linkage lines */}
                <line x1="50" y1="15" x2="50" y2="50" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="22" y1="28" x2="50" y2="50" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="78" y1="28" x2="50" y2="50" strokeWidth="1.5" strokeOpacity="0.4" />
                {/* Eye nodes blinking */}
                <g style={{ animation: 'blink-portrait 4.8s infinite', transformOrigin: '50px 38px' }}>
                  <circle cx="36" cy="38" r="3.5" fill={colors.hex} />
                  <circle cx="64" cy="38" r="3.5" fill={colors.hex} />
                </g>
                {/* Sub-node details */}
                <circle cx="50" cy="50" r="2.5" fill={colors.hex} />
                <circle cx="50" cy="72" r="2" fill={colors.hex} strokeWidth="1" />
              </g>
            </g>
          )}

          {speaker === 'byte' && (
            /* Byte: Aggressive security warden monitor */
            <g stroke={colors.hex} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="15" y="20" width="70" height="50" rx="6" />
              <line x1="15" y1="60" x2="85" y2="60" />
              {/* CRT monitor stand */}
              <path d="M40,70 L30,90 L70,90 L60,70" strokeWidth="2" />
              {/* Glitching crosshair eyes */}
              <g style={{ transform: `translate(${mouseOffset.x * 0.8}px, ${mouseOffset.y * 0.8}px)`, transformOrigin: '50px 50px' }}>
                <g style={{ animation: 'blink-portrait 2.8s infinite', transformOrigin: '50px 42px' }}>
                  <line x1="30" y1="36" x2="42" y2="48" />
                  <line x1="42" y1="36" x2="30" y2="48" />
                  <line x1="58" y1="36" x2="70" y2="48" />
                  <line x1="70" y1="36" x2="58" y2="48" />
                </g>
              </g>
            </g>
          )}

          {speaker === 'operator' && (
            /* Player Operator: Empty HUD wireframe helmet */
            <g stroke={colors.hex} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="50" cy="45" r="30" />
              <path d="M22,55 C22,75 35,88 50,88 C65,88 78,75 78,55" />
              {/* Tactical HUD crosshair */}
              <g style={{ transform: `translate(${mouseOffset.x * 0.5}px, ${mouseOffset.y * 0.5}px)`, transformOrigin: '50px 50px' }}>
                <circle cx="50" cy="45" r="8" strokeDasharray="3, 3" strokeOpacity="0.6" />
                {/* HUD grid lines */}
                <line x1="50" y1="10" x2="50" y2="25" strokeOpacity="0.5" />
                <line x1="50" y1="65" x2="50" y2="80" strokeOpacity="0.5" />
              </g>
            </g>
          )}
        </svg>

        {/* Real-time Telemetry Overlay Values */}
        <div 
          className={`absolute bottom-0 text-[6.5px] font-bold font-mono tracking-widest leading-none ${colors.text} select-none opacity-60`}
        >
          {speaker.toUpperCase()} // SYS_INIT
        </div>
      </div>

      {/* Equalizer speech visualizer bar lines */}
      <div className="flex gap-1 justify-center items-end h-5 mt-1 relative z-20 w-full px-4">
        {showTalk ? (
          <>
            <div className="w-[3px] bg-current rounded-full" style={{ color: colors.hex, animation: 'talk-wave-1 0.35s ease-in-out infinite alternate' }} />
            <div className="w-[3px] bg-current rounded-full" style={{ color: colors.hex, animation: 'talk-wave-2 0.28s ease-in-out infinite alternate 0.05s' }} />
            <div className="w-[3px] bg-current rounded-full" style={{ color: colors.hex, animation: 'talk-wave-3 0.42s ease-in-out infinite alternate 0.02s' }} />
            <div className="w-[3px] bg-current rounded-full" style={{ color: colors.hex, animation: 'talk-wave-2 0.31s ease-in-out infinite alternate 0.08s' }} />
            <div className="w-[3px] bg-current rounded-full" style={{ color: colors.hex, animation: 'talk-wave-1 0.38s ease-in-out infinite alternate 0.04s' }} />
          </>
        ) : (
          <>
            <div className="w-[3px] h-[3px] bg-current rounded-full opacity-35" style={{ color: colors.hex }} />
            <div className="w-[3px] h-[3px] bg-current rounded-full opacity-35" style={{ color: colors.hex }} />
            <div className="w-[3px] h-[3px] bg-current rounded-full opacity-35" style={{ color: colors.hex }} />
            <div className="w-[3px] h-[3px] bg-current rounded-full opacity-35" style={{ color: colors.hex }} />
            <div className="w-[3px] h-[3px] bg-current rounded-full opacity-35" style={{ color: colors.hex }} />
          </>
        )}
      </div>
    </div>
  );
};

export default CharacterPortrait;
