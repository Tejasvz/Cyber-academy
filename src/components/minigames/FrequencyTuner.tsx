import React, { useState, useEffect, useRef } from 'react';
import { Activity, Check, RotateCcw, X } from 'lucide-react';
import { sound } from '../../utils/audioSynth';

import './FrequencyTuner.css';

interface FrequencyTunerProps {
  onSuccess: () => void;
  onClose: () => void;
  targetFreq?: number;
  targetAmp?: number;
  targetPhase?: number;
  missionTitle?: string;
}

export const FrequencyTuner: React.FC<FrequencyTunerProps> = ({
  onSuccess,
  onClose,
  targetFreq = 3.5,
  targetAmp = 0.8,
  targetPhase = 1.2,
  missionTitle = 'QUANTUM RELAY STABILIZATION',
}) => {
  const [freq, setFreq] = useState<number>(1.5);
  const [amp, setAmp] = useState<number>(0.4);
  const [phase, setPhase] = useState<number>(0.0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [coherence, setCoherence] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);

  // Calculate Coherence score (0 - 100%)
  useEffect(() => {
    const freqDiff = Math.abs(freq - targetFreq) / 5.0; // max freq 6
    const ampDiff = Math.abs(amp - targetAmp) / 1.0;
    const phaseDiff = Math.abs(phase - targetPhase) / Math.PI;

    const totalDiff = (freqDiff * 0.45 + ampDiff * 0.35 + phaseDiff * 0.2);
    const score = Math.max(0, Math.min(100, Math.round((1 - totalDiff) * 100)));
    setCoherence(score);

    if (score >= 88 && !isLocked) {
      setIsLocked(true);
      sound.playHarmonize();
      sound.playSuccess();
    }
  }, [freq, amp, phase, targetFreq, targetAmp, targetPhase, isLocked]);

  // Canvas Oscilloscope Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let offset = 0;

    const render = () => {
      canvas.width = canvas.clientWidth || 600;
      canvas.height = canvas.clientHeight || 280;

      const w = canvas.width;
      const h = canvas.height;
      const midY = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Grid background lines
      ctx.strokeStyle = 'rgba(160, 82, 239, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Center baseline
      ctx.strokeStyle = 'rgba(32, 214, 233, 0.25)';
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(w, midY);
      ctx.stroke();

      // Target Waveform (Cyan Dotted)
      ctx.strokeStyle = 'rgba(32, 214, 233, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const t = (x / w) * Math.PI * 4 * targetFreq + targetPhase + offset;
        const y = midY - Math.sin(t) * (midY * 0.8 * targetAmp);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Player Waveform (Magenta Solid / Resonant Green if locked)
      ctx.strokeStyle = isLocked ? '#18efad' : '#b84bf5';
      ctx.lineWidth = isLocked ? 3 : 2.5;
      ctx.setLineDash([]);
      ctx.shadowColor = isLocked ? '#18efad' : '#b84bf5';
      ctx.shadowBlur = isLocked ? 15 : 8;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const t = (x / w) * Math.PI * 4 * freq + phase + offset;
        const y = midY - Math.sin(t) * (midY * 0.8 * amp);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      offset += 0.02;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [freq, amp, phase, targetFreq, targetAmp, targetPhase, isLocked]);

  const handleSliderChange = (setter: (v: number) => void, val: number) => {
    setter(val);
    sound.playFrequencyTick();
  };

  const resetSliders = () => {
    setFreq(1.0);
    setAmp(0.3);
    setPhase(0.0);
    setIsLocked(false);
    sound.playClick();
  };

  return (
    <div className="freq-modal-overlay" role="dialog" aria-modal="true" aria-label="Quantum Frequency Oscilloscope">
      <div className="freq-frame glass-panel">
        <header className="freq-header">
          <div className="freq-brand">
            <Activity size={18} className="phosphor-cyan" />
            <div>
              <h2>{missionTitle}</h2>
              <small>QUANTUM HARMONIC RESONANCE ALIGNMENT</small>
            </div>
          </div>
          <button className="freq-close" onClick={onClose} aria-label="Close tuner"><X size={16} /></button>
        </header>

        <div className="freq-body">
          {/* Oscilloscope Canvas Viewport */}
          <div className="oscilloscope-viewport">
            <canvas ref={canvasRef} className="oscilloscope-canvas" />
            <div className="oscilloscope-hud">
              <span className="legend-target">-- REFERENCE CARRIER</span>
              <span className={`legend-player ${isLocked ? 'locked' : ''}`}>
                — PLAYER HARMONIC ({isLocked ? 'PHASE LOCKED' : 'SEARCHING'})
              </span>
            </div>
            <div className="coherence-meter-box">
              <span>HARMONIC COHERENCE:</span>
              <div className="coherence-bar">
                <div
                  className={`coherence-fill ${coherence >= 88 ? 'locked' : ''}`}
                  style={{ width: `${coherence}%` }}
                />
              </div>
              <b className={coherence >= 88 ? 'locked-text' : ''}>{coherence}% {coherence >= 88 && '✓ LOCKED'}</b>
            </div>
          </div>

          {/* Interactive Dials & Sliders */}
          <div className="freq-controls-grid">
            <div className="freq-slider-group">
              <label>
                <span>FREQUENCY MODULATION</span>
                <b>{freq.toFixed(2)} GHz</b>
              </label>
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.05"
                value={freq}
                disabled={isLocked}
                onChange={(e) => handleSliderChange(setFreq, Number(e.target.value))}
              />
              <div className="slider-hints">
                <small>0.5 GHz</small>
                <small>TARGET: ~{targetFreq.toFixed(1)} GHz</small>
                <small>6.0 GHz</small>
              </div>
            </div>

            <div className="freq-slider-group">
              <label>
                <span>AMPLITUDE POWER</span>
                <b>{Math.round(amp * 100)}%</b>
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.02"
                value={amp}
                disabled={isLocked}
                onChange={(e) => handleSliderChange(setAmp, Number(e.target.value))}
              />
              <div className="slider-hints">
                <small>10%</small>
                <small>TARGET: ~{Math.round(targetAmp * 100)}%</small>
                <small>100%</small>
              </div>
            </div>

            <div className="freq-slider-group">
              <label>
                <span>PHASE SHIFT ALIGNMENT</span>
                <b>{(phase / Math.PI).toFixed(2)}π RAD</b>
              </label>
              <input
                type="range"
                min="0.0"
                max="3.14"
                step="0.04"
                value={phase}
                disabled={isLocked}
                onChange={(e) => handleSliderChange(setPhase, Number(e.target.value))}
              />
              <div className="slider-hints">
                <small>0.0</small>
                <small>TARGET: ~{(targetPhase / Math.PI).toFixed(2)}π</small>
                <small>π</small>
              </div>
            </div>
          </div>

          {/* Locked Status Banner */}
          {isLocked && (
            <div className="freq-locked-banner">
              <Check size={26} />
              <div>
                <h3>HARMONIC RESONANCE PHASE-LOCKED</h3>
                <p>Grid frequencies synchronized. Signal parity verified (+150 XP / +30 Credits).</p>
              </div>
              <button
                className="workspace-cta"
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
              >
                COMMIT SIGNAL LOCK →
              </button>
            </div>
          )}
        </div>

        <footer className="freq-footer">
          <button className="freq-reset-btn" onClick={resetSliders} disabled={isLocked}>
            <RotateCcw size={12} style={{ display: 'inline', marginRight: '4px' }} /> RESET SLIDERS
          </button>
          <button className="freq-bypass-btn" onClick={() => { onSuccess(); onClose(); }}>
            EMERGENCY DECODER OVERRIDE (AUTO-ALIGN) ≫
          </button>
        </footer>
      </div>
    </div>
  );
};
