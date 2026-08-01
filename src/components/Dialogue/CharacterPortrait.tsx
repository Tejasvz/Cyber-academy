import React, { useState, useEffect, useRef } from 'react';

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
  const [blink, setBlink] = useState(false);
  const [glitchTrigger, setGlitchTrigger] = useState(false);
  const animationFrameId = useRef<number | null>(null);

  // Smooth mouse follower
  const currentMouse = useRef({ x: 0, y: 0 });
  const targetMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const portraitElement = document.getElementById(`holo-portrait-${speaker}`);
      if (!portraitElement) return;

      const rect = portraitElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalized coordinates
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);

      targetMouse.current = {
        x: Math.max(-10, Math.min(10, dx * 12)),
        y: Math.max(-8, Math.min(8, dy * 10)),
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [speaker]);

  // Interpolation loop for buttery smooth translations
  useEffect(() => {
    const updateMotion = () => {
      const ease = 0.08;
      currentMouse.current.x += (targetMouse.current.x - currentMouse.current.x) * ease;
      currentMouse.current.y += (targetMouse.current.y - currentMouse.current.y) * ease;
      
      setMouseOffset({
        x: currentMouse.current.x,
        y: currentMouse.current.y,
      });

      animationFrameId.current = requestAnimationFrame(updateMotion);
    };

    animationFrameId.current = requestAnimationFrame(updateMotion);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  // Periodic Blink Timer
  useEffect(() => {
    const triggerBlink = () => {
      if (expression === 'panic') {
        // Suspend natural blinks during wide-eyed panic states
        blinkTimeout = setTimeout(triggerBlink, 3000);
        return;
      }
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
      const nextDelay = 3000 + Math.random() * 4000;
      blinkTimeout = setTimeout(triggerBlink, nextDelay);
    };

    let blinkTimeout = setTimeout(triggerBlink, 4000);
    return () => clearTimeout(blinkTimeout);
  }, [expression]);

  // Micro-glitch distortions
  useEffect(() => {
    const triggerGlitch = () => {
      setGlitchTrigger(true);
      setTimeout(() => setGlitchTrigger(false), 80 + Math.random() * 120);
      const nextDelay = 2000 + Math.random() * 5000;
      glitchTimeout = setTimeout(triggerGlitch, nextDelay);
    };

    let glitchTimeout = setTimeout(triggerGlitch, 3000);
    return () => clearTimeout(glitchTimeout);
  }, []);

  // Faction aesthetic themes
  const getTheme = () => {
    switch (speaker) {
      case 'aurelia':
        return {
          glow: 'rgba(0, 240, 255, 0.4)',
          hex: '#00f0ff',
          contrastHex: '#0055ff',
          name: 'AURELIA // TACTICAL DAEMON',
          emitterGlow: 'shadow-[0_0_20px_rgba(0,240,255,0.4)]',
        };
      case 'hesper':
        return {
          glow: 'rgba(255, 176, 0, 0.4)',
          hex: '#ffb000',
          contrastHex: '#ff5500',
          name: 'HESPER // AETHER COMMANDER',
          emitterGlow: 'shadow-[0_0_20px_rgba(255,176,0,0.4)]',
        };
      case 'kaelen':
        return {
          glow: 'rgba(217, 70, 239, 0.4)',
          hex: '#d946ef',
          contrastHex: '#701a75',
          name: 'KAELEN // VOID SECTOR INTERCEPT',
          emitterGlow: 'shadow-[0_0_20px_rgba(217,70,239,0.4)]',
        };
      case 'byte':
        return {
          glow: 'rgba(239, 68, 68, 0.4)',
          hex: '#ef4444',
          contrastHex: '#7f1d1d',
          name: 'BYTE // CORE GATEWAY SENTINEL',
          emitterGlow: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]',
        };
      default:
        return {
          glow: 'rgba(100, 116, 139, 0.3)',
          hex: '#94a3b8',
          contrastHex: '#334155',
          name: 'OPERATOR // CONSOLE LINK',
          emitterGlow: 'shadow-[0_0_15px_rgba(148,163,184,0.3)]',
        };
    }
  };

  const theme = getTheme();
  const isGlitched = expression === 'glitch' || glitchTrigger;
  const isTalking = isTyping || expression === 'talking';

  // Symmetrical Low-Poly Node Mapping for Parallax depth rendering
  // Array format: [x, y, parallaxFactor]
  const nodes = {
    foreheadCenter: [50, 24, 0.3],
    foreheadL: [36, 28, 0.25],
    foreheadR: [64, 28, 0.25],
    templeL: [25, 34, 0.15],
    templeR: [75, 34, 0.15],
    
    eyeL: [38, 44, 0.6],
    eyeR: [62, 44, 0.6],
    eyebrowL: [38, 38, 0.5],
    eyebrowR: [62, 38, 0.5],
    
    noseBridge: [50, 43, 0.7],
    noseTip: [50, 56, 0.95],
    noseL: [44, 57, 0.8],
    noseR: [56, 57, 0.8],

    cheekOuterL: [23, 54, 0.2],
    cheekOuterR: [77, 54, 0.2],
    cheekInnerL: [38, 57, 0.5],
    cheekInnerR: [62, 57, 0.5],

    mouthCenter: [50, 68, 0.85],
    mouthL: [43, 69, 0.75],
    mouthR: [57, 69, 0.75],
    chinUpper: [50, 75, 0.75],
    chinTip: [50, 85, 0.65],
    
    jawL: [32, 77, 0.35],
    jawR: [68, 77, 0.35],
  };

  // Helper to compile a coordinate with custom mouse parallax translation offsets
  const getC = (nodeName: keyof typeof nodes): string => {
    const [x, y, factor] = nodes[nodeName];
    
    // Morph coordinate offsets based on dynamic emotion expressions
    let morphX = 0;
    let morphY = 0;

    if (expression === 'smile') {
      if (nodeName === 'mouthL' || nodeName === 'mouthR') {
        morphY = -2.5; // pull corners up
      }
    } else if (expression === 'angry') {
      if (nodeName === 'eyebrowL' || nodeName === 'eyebrowR') {
        morphY = 2.0; // furrow eyebrows down
      }
      if (nodeName === 'foreheadCenter') {
        morphY = 1.5;
      }
    } else if (expression === 'worried' || expression === 'sad' || expression === 'glitch') {
      if (nodeName === 'eyebrowL' || nodeName === 'eyebrowR') {
        morphY = -1.8; // tilt eyebrows up at center
      }
      if (nodeName === 'mouthL' || nodeName === 'mouthR') {
        morphY = 2.0; // droop mouth edges
      }
    } else if (expression === 'panic') {
      if (nodeName === 'chinTip' || nodeName === 'chinUpper' || nodeName === 'jawL' || nodeName === 'jawR') {
        morphY = 3.5; // drop lower jaw
      }
      if (nodeName === 'mouthCenter') {
        morphY = 2.0; // drop center lip
      }
    }

    // Heavy random perturbation under glitched states
    const isGlitchedState = expression === 'glitch' || glitchTrigger;
    const glitchX = isGlitchedState ? (Math.random() - 0.5) * (factor * 9) : 0;
    const glitchY = isGlitchedState ? (Math.random() - 0.5) * (factor * 9) : 0;
    
    const finalX = x + mouseOffset.x * factor + morphX + glitchX;
    const finalY = y + mouseOffset.y * factor + morphY + (isTalking ? Math.sin(Date.now() * 0.12) * (factor * 0.7) : 0) + glitchY;
    return `${finalX},${finalY}`;
  };

  return (
    <div 
      id={`holo-portrait-${speaker}`}
      className="relative w-full h-full flex flex-col items-center justify-center select-none bg-[#030305]/10"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes hologram-glow {
          0%, 100% { filter: drop-shadow(0 0 10px ${theme.glow}) brightness(1.0); }
          50% { filter: drop-shadow(0 0 16px ${theme.glow}) brightness(1.15); }
        }
        @keyframes emitter-beam {
          0%, 100% { opacity: 0.18; transform: scaleX(1); }
          50% { opacity: 0.25; transform: scaleX(1.05); }
        }
        @keyframes float-particles {
          0% { transform: translateY(0) scale(1); opacity: 0.8; }
          50% { transform: translateY(-40px) scale(1.2); opacity: 1; }
          100% { transform: translateY(-80px) scale(0.6); opacity: 0; }
        }
      `}} />

      {/* Volumetric Emitter Projection Light Cones */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Ambient Projector Cone beam */}
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 h-80 origin-bottom"
          style={{
            background: `linear-gradient(to top, ${theme.hex}33, ${theme.hex}08 50%, transparent)`,
            clipPath: 'polygon(15% 100%, 85% 100%, 100% 0%, 0% 0%)',
            animation: 'emitter-beam 6s ease-in-out infinite',
          }}
        />
        
        {/* Core projection narrow beam */}
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-28 h-80 origin-bottom opacity-20"
          style={{
            background: `linear-gradient(to top, ${theme.hex}55, transparent)`,
            clipPath: 'polygon(30% 100%, 70% 100%, 90% 0%, 10% 0%)',
          }}
        />

        {/* Ambient floating project sparks */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-64 pointer-events-none">
          <div className="absolute left-[20%] bottom-4 w-1 h-1 rounded-full animate-[float-particles_3.2s_infinite]" style={{ backgroundColor: theme.hex }} />
          <div className="absolute left-[45%] bottom-10 w-[1.5px] h-[1.5px] rounded-full animate-[float-particles_2.4s_infinite_0.4s]" style={{ backgroundColor: theme.hex }} />
          <div className="absolute left-[70%] bottom-2 w-1 h-1 rounded-full animate-[float-particles_4.1s_infinite_1.2s]" style={{ backgroundColor: theme.hex }} />
          <div className="absolute left-[35%] bottom-16 w-1 h-1 rounded-full animate-[float-particles_3.5s_infinite_0.8s]" style={{ backgroundColor: theme.hex }} />
        </div>
      </div>

      {/* Hologram Head Projection SVG Matrix */}
      <div 
        className="w-56 h-56 relative z-10 flex items-center justify-center cursor-pointer"
        style={{
          animation: 'hologram-glow 4s ease-in-out infinite',
        }}
      >
        <svg 
          viewBox="0 0 100 100" 
          className={`w-full h-full overflow-visible ${
            isGlitched ? 'animate-[glitch-shake_0.4s_infinite]' : 'transition-transform duration-700 ease-out hover:scale-105'
          }`}
        >
          {/* Defs block containing character gradient masks */}
          <defs>
            <radialGradient id="meshGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={`${theme.hex}1c`} />
              <stop offset="100%" stopColor={`${theme.contrastHex}0a`} />
            </radialGradient>
          </defs>

          {/* BACKGROUND SYSTEM METRICS (Only visible on high zoom HUD layouts) */}
          <g stroke={`${theme.hex}0c`} strokeWidth="0.5" strokeDasharray="1, 4">
            <circle cx="50" cy="50" r="42" />
            <circle cx="50" cy="50" r="34" />
          </g>

          {/* Hologram scanline interference filter */}
          <g>
            {/* Chromatic Aberration Underlays (Red and Blue channel splits) when glitched */}
            {isGlitched && (
              <g stroke="#ff0055" strokeWidth="1.2" fill="none" opacity="0.7" style={{ transform: 'translateX(-1.5px)' }}>
                <path d={`M ${getC('foreheadCenter')} L ${getC('foreheadL')} L ${getC('templeL')} L ${getC('eyeL')} L ${getC('noseBridge')} Z`} />
                <path d={`M ${getC('noseBridge')} L ${getC('noseTip')} L ${getC('cheekInnerL')} L ${getC('eyeL')} Z`} />
                <path d={`M ${getC('noseTip')} L ${getC('mouthCenter')} L ${getC('mouthL')} L ${getC('cheekInnerL')} Z`} />
                <path d={`M ${getC('mouthCenter')} L ${getC('chinUpper')} L ${getC('jawL')} L ${getC('chinTip')} Z`} />
              </g>
            )}
            {isGlitched && (
              <g stroke="#00ffff" strokeWidth="1.2" fill="none" opacity="0.7" style={{ transform: 'translateX(1.5px)' }}>
                <path d={`M ${getC('foreheadCenter')} L ${getC('foreheadR')} L ${getC('templeR')} L ${getC('eyeR')} L ${getC('noseBridge')} Z`} />
                <path d={`M ${getC('noseBridge')} L ${getC('noseTip')} L ${getC('cheekInnerR')} L ${getC('eyeR')} Z`} />
                <path d={`M ${getC('noseTip')} L ${getC('mouthCenter')} L ${getC('mouthR')} L ${getC('cheekInnerR')} Z`} />
                <path d={`M ${getC('mouthCenter')} L ${getC('chinUpper')} L ${getC('jawR')} L ${getC('chinTip')} Z`} />
              </g>
            )}

            {/* PRIMARY LOW-POLY MESH POLYGONS */}
            <g 
              fill="url(#meshGrad)" 
              stroke={theme.hex} 
              strokeWidth="0.85" 
              strokeLinejoin="round" 
              strokeOpacity={isGlitched ? '0.9' : '0.45'}
            >
              {/* Forehead Section */}
              <polygon points={`${getC('foreheadCenter')} ${getC('foreheadL')} ${getC('eyebrowL')} ${getC('noseBridge')}`} />
              <polygon points={`${getC('foreheadCenter')} ${getC('foreheadR')} ${getC('eyebrowR')} ${getC('noseBridge')}`} />
              <polygon points={`${getC('foreheadL')} ${getC('templeL')} ${getC('cheekOuterL')} ${getC('eyebrowL')}`} />
              <polygon points={`${getC('foreheadR')} ${getC('templeR')} ${getC('cheekOuterR')} ${getC('eyebrowR')}`} />

              {/* Eye Socket & Nose Bridge */}
              <polygon points={`${getC('eyebrowL')} ${getC('eyeL')} ${getC('noseBridge')}`} />
              <polygon points={`${getC('eyebrowR')} ${getC('eyeR')} ${getC('noseBridge')}`} />
              
              {/* Cheek Section */}
              <polygon points={`${getC('eyeL')} ${getC('cheekOuterL')} ${getC('cheekInnerL')}`} />
              <polygon points={`${getC('eyeR')} ${getC('cheekOuterR')} ${getC('cheekInnerR')}`} />
              <polygon points={`${getC('eyeL')} ${getC('cheekInnerL')} ${getC('noseTip')} ${getC('noseBridge')}`} />
              <polygon points={`${getC('eyeR')} ${getC('cheekInnerR')} ${getC('noseTip')} ${getC('noseBridge')}`} />
              <polygon points={`${getC('cheekInnerL')} ${getC('cheekOuterL')} ${getC('jawL')} ${getC('noseL')}`} />
              <polygon points={`${getC('cheekInnerR')} ${getC('cheekOuterR')} ${getC('jawR')} ${getC('noseR')}`} />

              {/* Nose Structure */}
              <polygon points={`${getC('noseBridge')} ${getC('noseL')} ${getC('noseTip')}`} />
              <polygon points={`${getC('noseBridge')} ${getC('noseR')} ${getC('noseTip')}`} />

              {/* Mouth & Lips */}
              <polygon points={`${getC('noseTip')} ${getC('mouthL')} ${getC('mouthCenter')}`} />
              <polygon points={`${getC('noseTip')} ${getC('mouthR')} ${getC('mouthCenter')}`} />
              <polygon points={`${getC('mouthL')} ${getC('cheekInnerL')} ${getC('jawL')}`} />
              <polygon points={`${getC('mouthR')} ${getC('cheekInnerR')} ${getC('jawR')}`} />
              
              {/* Chin & Lower Jaw */}
              <polygon points={`${getC('mouthCenter')} ${getC('mouthL')} ${getC('jawL')} ${getC('chinUpper')}`} />
              <polygon points={`${getC('mouthCenter')} ${getC('mouthR')} ${getC('jawR')} ${getC('chinUpper')}`} />
              <polygon points={`${getC('chinUpper')} ${getC('jawL')} ${getC('chinTip')}`} />
              <polygon points={`${getC('chinUpper')} ${getC('jawR')} ${getC('chinTip')}`} />
            </g>

            {/* CHARACTER SPECIFIC HIGHLIGHT MODULES */}
            {speaker === 'hesper' && (
              /* Commander Hesper Visor Band Overlay */
              <g 
                stroke={theme.hex} 
                strokeWidth="1.2" 
                fill={`${theme.hex}1a`} 
                style={{ transform: `translate(${mouseOffset.x * 0.75}px, ${mouseOffset.y * 0.75}px)` }}
              >
                <polygon points={`${getC('templeL')} ${getC('templeR')} ${getC('eyeR')} ${getC('noseBridge')} ${getC('eyeL')}`} />
                <line x1="32" y1="44" x2="68" y2="44" strokeWidth="2.5" strokeDasharray="3, 3" />
              </g>
            )}

            {speaker === 'kaelen' && (
              /* Kaelen Hack nodes (glitching coordinate crosses) */
              <g stroke={theme.hex} strokeWidth="0.8">
                <circle cx="50" cy="50" r="1.5" fill={theme.hex} />
                <line x1="48" y1="50" x2="52" y2="50" />
                <line x1="50" y1="48" x2="50" y2="52" />
              </g>
            )}

            {/* EYE LAYERS WITH BLINK CLIPPING */}
            {!blink ? (
              <g 
                stroke={theme.hex} 
                strokeWidth="1.8" 
                fill="none" 
                strokeLinecap="round"
              >
                {/* Left Eye */}
                <line x1="35" y1="44" x2="41" y2="44" style={{ transform: `translate(${mouseOffset.x * 0.75}px, ${mouseOffset.y * 0.75}px)` }} />
                {/* Right Eye */}
                <line x1="59" y1="44" x2="65" y2="44" style={{ transform: `translate(${mouseOffset.x * 0.75}px, ${mouseOffset.y * 0.75}px)` }} />
              </g>
            ) : (
              /* Closed Blinking lines */
              <g stroke={theme.hex} strokeWidth="1.2" opacity="0.6">
                <line x1="33" y1="44" x2="43" y2="44" />
                <line x1="57" y1="44" x2="67" y2="44" />
              </g>
            )}

            {/* GLITCH VERTEX POINTS */}
            {isGlitched && (
              <g fill={theme.hex}>
                <circle cx="50" cy="24" r="1" />
                <circle cx="23" cy="54" r="1" />
                <circle cx="77" cy="54" r="1" />
                <circle cx="50" cy="85" r="1.2" />
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Holographic Projector Emitter Base Ring Component */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-6 flex flex-col items-center">
        {/* Outer glowing projector ring ellipse */}
        <div 
          className={`w-28 h-5 rounded-full border border-primary/30 bg-[#07070d]/90 flex items-center justify-center relative overflow-hidden ${theme.emitterGlow}`}
          style={{
            borderColor: `${theme.hex}55`,
            boxShadow: `0 0 15px ${theme.glow}, inset 0 0 10px ${theme.glow}`,
          }}
        >
          {/* Inner glass projection lens */}
          <div 
            className="w-16 h-3 rounded-full opacity-70"
            style={{
              background: `radial-gradient(ellipse, ${theme.hex} 0%, transparent 75%)`,
            }}
          />
          
          {/* Projecting light source dot */}
          <div 
            className="w-2 h-2 rounded-full absolute bg-white blur-[1.5px] animate-pulse"
            style={{
              boxShadow: `0 0 8px 3px ${theme.hex}`,
            }}
          />
        </div>

        {/* Emitter label */}
        <div 
          className="text-[6.5px] font-mono tracking-widest font-bold mt-1 opacity-55"
          style={{ color: theme.hex }}
        >
          {theme.name}
        </div>
      </div>
    </div>
  );
};

export default CharacterPortrait;
