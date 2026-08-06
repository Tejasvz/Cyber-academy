import React from 'react';
import { X, Award, Shield, User, Cpu } from 'lucide-react';
import type { Operator } from '../../types';
import { sound } from '../../utils/audioSynth';

interface OperatorProfileModalProps {
  operator: Operator;
  onClose: () => void;
  onResetProgress?: () => void;
}

export const OperatorProfileModal: React.FC<OperatorProfileModalProps> = ({
  operator,
  onClose,
  onResetProgress,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030816]/85 backdrop-blur-md select-none">
      <div className="glass-panel border-[#22d3ee] rounded-lg w-full max-w-2xl max-h-[85vh] flex flex-col shadow-neon-cyan overflow-hidden">
        {/* Header */}
        <div className="panel-header px-5 py-3 flex justify-between items-center border-b border-[#22d3ee]/30">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#22d3ee]" />
            <span className="text-[#22d3ee] font-bold text-sm tracking-widest font-mono-cyber">
              OPERATOR PROFILE // {operator.name}
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
        <div className="p-6 overflow-y-auto flex flex-col gap-5 font-mono-cyber">
          {/* Identity Header */}
          <div className="p-4 bg-[#0b1633]/80 border border-[#22d3ee]/40 rounded flex items-center gap-4">
            <div className="w-16 h-16 rounded border-2 border-[#a855f7] bg-[#a855f7]/20 flex items-center justify-center text-[#a855f7] text-2xl font-bold shadow-neon-purple shrink-0">
              {operator.name ? operator.name.charAt(0) : 'F'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-[#22d3ee] text-glow-cyan">
                    OPERATOR: {operator.name}
                  </h2>
                  <p className="text-xs text-[#94a3b8]">CALLSIGN: {operator.callsign}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#94a3b8]">CLEARANCE LEVEL</span>
                  <div className="text-xs font-bold text-[#4ade80] bg-[#4ade80]/10 px-2.5 py-0.5 rounded border border-[#4ade80]/30 mt-0.5">
                    {operator.clearance}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-6 text-xs text-[#94a3b8]">
                <div>LEVEL: <span className="text-[#a855f7] font-bold">{operator.level}</span></div>
                <div>TRUST INDEX: <span className="text-[#22d3ee] font-bold">{operator.trustLevel}%</span></div>
                <div>XP: <span className="text-[#e2e8f0]">{operator.xpCurrent} / {operator.xpNext}</span></div>
              </div>
            </div>
          </div>

          {/* Badges & Achievements */}
          <div>
            <h3 className="text-xs text-[#22d3ee] uppercase font-bold tracking-wider mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>EARNED BADGES & CREDENTIALS</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {operator.badges.map((b) => (
                <div
                  key={b.id}
                  className={`p-3 rounded border flex items-center gap-3 ${
                    b.unlocked
                      ? 'border-[#22d3ee]/40 bg-[#0c1324]/80 text-[#22d3ee]'
                      : 'border-[#94a3b8]/20 bg-[#0c1324]/30 text-[#94a3b8]/50'
                  }`}
                >
                  <div className="p-2 border rounded border-current bg-current/10 shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">{b.name}</h4>
                    <p className="text-[10px] text-[#94a3b8] leading-tight mt-0.5">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Hardware Augments */}
          <div>
            <h3 className="text-xs text-[#a855f7] uppercase font-bold tracking-wider mb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              <span>EQUIPPED NEURAL AUGMENTS</span>
            </h3>
            <div className="grid grid-cols-3 gap-3 text-xs text-center">
              <div className="p-3 border border-[#22d3ee]/30 bg-[#0b1633]/60 rounded">
                <div className="text-[10px] text-[#94a3b8]">CYBER DECK</div>
                <div className="text-[#22d3ee] font-bold mt-1">AETHER M3 PRO</div>
              </div>
              <div className="p-3 border border-[#a855f7]/30 bg-[#0b1633]/60 rounded">
                <div className="text-[10px] text-[#94a3b8]">ENCRYPTION</div>
                <div className="text-[#a855f7] font-bold mt-1">QUANTUM-AES256</div>
              </div>
              <div className="p-3 border border-[#4ade80]/30 bg-[#0b1633]/60 rounded">
                <div className="text-[10px] text-[#94a3b8]">SIGNAL SUITE</div>
                <div className="text-[#4ade80] font-bold mt-1">NEURAL LINK v2</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#22d3ee]/30 bg-[#0c1324]/90 flex justify-between items-center">
          {onResetProgress ? (
            <button
              onClick={() => {
                sound.playWarning();
                onResetProgress();
              }}
              className="px-4 py-2 text-xs font-mono-cyber border border-[#f87171]/60 text-[#f87171] bg-[#f87171]/10 rounded hover:bg-[#f87171]/25 transition"
            >
              NEURAL REBOOT / RESET PROGRESS
            </button>
          ) : (
            <div></div>
          )}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 text-xs font-mono-cyber border border-[#22d3ee] text-[#22d3ee] bg-[#22d3ee]/10 rounded hover:bg-[#22d3ee]/25 transition"
          >
            CLOSE PROFILE
          </button>
        </div>
      </div>
    </div>
  );
};
