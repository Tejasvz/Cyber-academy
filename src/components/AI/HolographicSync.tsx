import React, { useEffect, useRef } from 'react';

interface HolographicSyncProps {
  active?: boolean;
  frequency?: number;
  mode?: 'waveform' | 'spectrum' | 'pulse';
  className?: string;
}

export const HolographicSync: React.FC<HolographicSyncProps> = ({
  active = true,
  frequency = 440,
  mode = 'waveform',
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const handleResize = () => {
      canvas.width = canvas.clientWidth || 300;
      canvas.height = canvas.clientHeight || 120;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Glow background
      const grad = ctx.createRadialGradient(width / 2, centerY, 5, width / 2, centerY, width / 2);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.15)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      if (mode === 'waveform') {
        // Draw dual holographic sine waves
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#00f0ff';
        ctx.beginPath();

        for (let x = 0; x < width; x++) {
          const freqMultiplier = (frequency / 440) * 0.03;
          const amp = active ? 25 * Math.sin(x * 0.01 + phase) : 5;
          const y = centerY + Math.sin(x * freqMultiplier + phase) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.stroke();

        // Secondary cyan-purple phase wave
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(160, 32, 240, 0.8)';
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const freqMultiplier = (frequency / 440) * 0.025;
          const amp = active ? 18 * Math.cos(x * 0.015 + phase) : 3;
          const y = centerY + Math.cos(x * freqMultiplier - phase * 0.8) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (mode === 'spectrum') {
        // Draw frequency bars
        const numBars = 32;
        const barWidth = width / numBars - 2;

        for (let i = 0; i < numBars; i++) {
          const barHeight = active
            ? Math.abs(Math.sin(i * 0.2 + phase * 2)) * (height * 0.7) + 5
            : 4;

          const x = i * (barWidth + 2);
          const y = height - barHeight;

          const barGrad = ctx.createLinearGradient(0, height, 0, 0);
          barGrad.addColorStop(0, 'rgba(0, 240, 255, 0.2)');
          barGrad.addColorStop(1, 'rgba(0, 240, 255, 0.9)');

          ctx.fillStyle = barGrad;
          ctx.fillRect(x, y, barWidth, barHeight);
        }
      } else if (mode === 'pulse') {
        // Concentric pulse rings
        const maxRadius = Math.min(width, height) / 2 - 10;
        const radius = (phase * 15) % maxRadius;

        ctx.strokeStyle = `rgba(0, 240, 255, ${1 - radius / maxRadius})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(width / 2, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      phase += active ? 0.08 : 0.02;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [active, frequency, mode]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block rounded ${className}`}
    />
  );
};
