import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../../utils/audioSynth';

interface AureliaStageProps {
  isSpeaking: boolean;
  onInteract?: () => void;
}

export const AureliaStage: React.FC<AureliaStageProps> = ({ isSpeaking, onInteract }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imgError, setImgError] = useState(false);

  // Hologram image URL from reference
  const aureliaImgUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCJjh5XmhITAbPMRRGihThZ_-goYL7NkOzC8Si4LEnYaPzIszlePjM6vfY2JOnTUNPuL1IBgtzU1UsoGoiETT-ZAFNUu00NJIvspld-l7x5nRpz_RF4mGKcmpJjCqtSK9wbJZ2Kou_hiO0zm_JKelSrxnvlQXvQOtLXZ0-uPcynW2KvsIe_V4e71v7gr7hWIjPDC2yYQmDLDQM8pjzCervK-yEHmL29xGzUgqVHEO7ERBWJfPy4uNHV";

  // Particle Canvas for holographic digital dust
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 800);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create particles
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: width / 2 + (Math.random() - 0.5) * 360,
      y: height * 0.7 - Math.random() * 300,
      size: Math.random() * 2.2 + 0.8,
      speedY: -(Math.random() * 0.8 + 0.2),
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.8 + 0.2,
      color: Math.random() > 0.4 ? '#22d3ee' : '#a855f7',
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < height * 0.25 || p.opacity <= 0) {
          p.y = height * 0.72 + Math.random() * 20;
          p.x = width / 2 + (Math.random() - 0.5) * 300;
          p.opacity = Math.random() * 0.8 + 0.2;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
      {/* Background Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Holographic Base Emitter on Floor */}
      <div className="hologram-base">
        {/* Concentric Energy Rings */}
        <div className="absolute inset-3 border border-[#22d3ee]/60 rounded-full border-dashed animate-spin-slow"></div>
        <div className="absolute inset-8 border border-[#a855f7]/50 rounded-full animate-pulse"></div>
        <div className="absolute inset-16 border-2 border-[#22d3ee]/40 rounded-full border-dotted animate-[spin_18s_linear_infinite_reverse]"></div>
        <div className="absolute inset-28 bg-[#22d3ee]/20 rounded-full blur-md"></div>
      </div>

      {/* Hologram Light Cone / Rays */}
      <div 
        className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[420px] h-[480px] pointer-events-none opacity-40 z-5"
        style={{
          background: 'polygon(20% 100%, 80% 100%, 100% 0%, 0% 0%)',
          backgroundImage: 'linear-gradient(to top, rgba(34,211,238,0.3) 0%, rgba(168,85,247,0.1) 60%, transparent 100%)',
          clipPath: 'polygon(30% 100%, 70% 100%, 100% 0%, 0% 0%)'
        }}
      ></div>

      {/* Hologram Aurelia Container */}
      <div 
        onClick={() => {
          sound.playAureliaPulse();
          if (onInteract) onInteract();
        }}
        className="hologram-container cursor-pointer pointer-events-auto group"
        title="Interact with Aurelia AI Handler"
      >
        {!imgError ? (
          <img
            src={aureliaImgUrl}
            alt="Aurelia Hologram AI"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className={`hologram-img transition-all duration-300 ${
              isSpeaking ? 'scale-105 filter drop-shadow-[0_0_40px_#22d3ee] brightness-125' : ''
            }`}
          />
        ) : (
          /* SVG Holographic AI Mesh Fallback if image fails */
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            <svg viewBox="0 0 400 400" className="w-[80%] h-[80%] text-[#22d3ee] filter drop-shadow-[0_0_20px_#22d3ee]">
              <defs>
                <linearGradient id="holoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <circle cx="200" cy="180" r="140" fill="none" stroke="url(#holoGrad)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-spin-slow" />
              <polygon points="200,60 280,240 120,240" fill="none" stroke="#22d3ee" strokeWidth="2" />
              <polygon points="200,280 290,140 110,140" fill="none" stroke="#a855f7" strokeWidth="1.5" />
              <circle cx="200" cy="160" r="40" fill="none" stroke="#22d3ee" strokeWidth="2" className="animate-pulse" />
              <circle cx="200" cy="160" r="8" fill="#22d3ee" className="animate-ping" />
            </svg>
          </div>
        )}

        {/* Ambient Overlay Glitch Line */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#22d3ee]/10 to-transparent opacity-30 animate-pulse pointer-events-none"></div>
      </div>
    </div>
  );
};
