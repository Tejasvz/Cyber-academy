import React, { useState, useEffect } from 'react';
import { X, Activity, CheckCircle2 } from 'lucide-react';
import { sound } from '../../utils/audioSynth';

interface DiagnosticsModalProps {
  onClose: () => void;
  onCompleteDiagnostics: () => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({
  onClose,
  onCompleteDiagnostics,
}) => {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([
    'INITIALIZING SYSTEM DIAGNOSTICS...',
  ]);

  useEffect(() => {
    sound.playDiagnosticScan();

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onCompleteDiagnostics();
          return 100;
        }
        const next = prev + 10;
        if (next === 30) {
          setLogs((l) => [...l, 'VERIFYING CORE SYSTEM KERNEL... PASS (100%)']);
        } else if (next === 60) {
          setLogs((l) => [...l, 'MEASURING QUANTUM NETWORK STABILITY... 82%']);
        } else if (next === 90) {
          setLogs((l) => [...l, 'SYNCHRONIZING AURELIA NEURAL RELIABILITY... 95%']);
        } else if (next === 100) {
          setLogs((l) => [...l, 'ALL DIAGNOSTICS COMPLETE. SYSTEM STABLE.']);
        }
        return next;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030816]/85 backdrop-blur-md select-none">
      <div className="glass-panel border-[#22d3ee] rounded-lg w-full max-w-xl flex flex-col shadow-neon-cyan overflow-hidden">
        {/* Header */}
        <div className="panel-header px-5 py-3 flex justify-between items-center border-b border-[#22d3ee]/30">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#22d3ee] animate-pulse" />
            <span className="text-[#22d3ee] font-bold text-sm tracking-widest font-mono-cyber">
              SYSTEM DIAGNOSTICS RUNNER
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

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-5 font-mono-cyber">
          {/* Circular Progress Gauge */}
          <div className="flex flex-col items-center justify-center my-2">
            <div className="relative w-28 h-28 radial-progress flex items-center justify-center shadow-neon-cyan" style={{ '--value': `${progress}%` } as React.CSSProperties}>
              <div className="absolute inset-0 border-4 border-[#22d3ee]/30 rounded-full border-dashed animate-spin"></div>
              <div className="text-center relative z-10 font-mono-cyber">
                <div className="text-2xl font-bold text-[#22d3ee] text-glow-cyan">{progress}%</div>
                <div className="text-[9px] text-[#22d3ee]/80 tracking-widest uppercase">SCANNING</div>
              </div>
            </div>
          </div>

          {/* Diagnostics Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-[#22d3ee] mb-1">
              <span>SCAN PROGRESS</span>
              <span className="font-bold">{progress}%</span>
            </div>
            <div className="h-2 bg-[#0b1633] w-full rounded-full overflow-hidden border border-[#22d3ee]/30">
              <div
                className="h-full bg-gradient-to-r from-[#a855f7] to-[#22d3ee] shadow-[0_0_10px_#22d3ee] transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Diagnostic Console Logs */}
          <div className="p-3 bg-[#0c1324] border border-[#22d3ee]/30 rounded h-36 overflow-y-auto text-xs space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="flex items-center gap-2 text-[#4ade80]">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#22d3ee]/30 bg-[#0c1324] flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            disabled={progress < 100}
            className={`px-6 py-2 text-xs font-mono-cyber border rounded transition ${
              progress === 100
                ? 'border-[#22d3ee] text-[#22d3ee] bg-[#22d3ee]/20 hover:bg-[#22d3ee]/35'
                : 'border-[#94a3b8]/30 text-[#94a3b8] cursor-not-allowed'
            }`}
          >
            {progress === 100 ? 'CLOSE & APPLY' : 'SCANNING...'}
          </button>
        </div>
      </div>
    </div>
  );
};
