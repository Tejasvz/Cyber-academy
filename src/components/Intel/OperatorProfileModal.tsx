import React, { useState } from 'react';
import { type Operative } from './IntelPersonnelDatabase';
import { X, Shield, Cpu, Play, Pause, FileText, Activity } from 'lucide-react';
import { HolographicSync } from '../AI/HolographicSync';

interface OperatorProfileModalProps {
  operative: Operative;
  onClose: () => void;
}

export const OperatorProfileModal: React.FC<OperatorProfileModalProps> = ({ operative, onClose }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeTab, setActiveTab] = useState<'dossier' | 'implants' | 'audio'>('dossier');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md font-mono select-none">
      <div className="w-full max-w-2xl bg-[#0a0e14] border border-cyan-500/40 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.3)] flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-center bg-cyan-950/60 border-b border-cyan-500/30 p-4">
          <div className="flex items-center space-x-3">
            <Shield className="text-cyan-400" size={20} />
            <div>
              <h3 className="font-bold text-sm text-cyan-300 tracking-wider">OPERATIVE DOSSIER // {operative.codename}</h3>
              <p className="text-[10px] text-gray-400">{operative.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-cyan-300 hover:bg-cyan-500/20 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Portrait & Overview Header */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 items-center">
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-cyan-500/40 shrink-0 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              <img
                src={operative.portrait}
                alt={operative.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>

            <div className="flex-1 space-y-2 text-left">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black text-cyan-300">{operative.name}</span>
                <span className="bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[10px] px-2 py-0.5 rounded font-bold">
                  {operative.clearance}
                </span>
              </div>
              <p className="text-teal-400 font-semibold">{operative.role}</p>
              <p className="text-gray-400 leading-relaxed">{operative.bio}</p>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex space-x-2 border-b border-cyan-500/20 pb-2">
            {(['dossier', 'implants', 'audio'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded transition uppercase font-bold text-[11px] ${
                  activeTab === tab
                    ? 'bg-cyan-500 text-black'
                    : 'bg-black/40 text-cyan-400 hover:bg-cyan-500/20'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'dossier' && (
            <div className="space-y-4">
              <h4 className="text-cyan-400 font-bold tracking-wider uppercase text-xs flex items-center gap-1.5">
                <Activity size={14} /> COMBAT & SYNAPTIC RATINGS
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">COMBAT PROFICIENCY</span>
                    <span className="text-cyan-300 font-bold">{operative.stats.combat}%</span>
                  </div>
                  <div className="w-full bg-cyan-950/60 h-2 rounded overflow-hidden">
                    <div className="bg-cyan-400 h-full" style={{ width: `${operative.stats.combat}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">HACKING EXPLOITS</span>
                    <span className="text-teal-300 font-bold">{operative.stats.hacking}%</span>
                  </div>
                  <div className="w-full bg-cyan-950/60 h-2 rounded overflow-hidden">
                    <div className="bg-teal-400 h-full" style={{ width: `${operative.stats.hacking}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">STEALTH RECON</span>
                    <span className="text-indigo-300 font-bold">{operative.stats.stealth}%</span>
                  </div>
                  <div className="w-full bg-cyan-950/60 h-2 rounded overflow-hidden">
                    <div className="bg-indigo-400 h-full" style={{ width: `${operative.stats.stealth}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">NEURAL STABILITY</span>
                    <span className="text-purple-300 font-bold">{operative.stats.neural}%</span>
                  </div>
                  <div className="w-full bg-cyan-950/60 h-2 rounded overflow-hidden">
                    <div className="bg-purple-400 h-full" style={{ width: `${operative.stats.neural}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'implants' && (
            <div className="space-y-3">
              <h4 className="text-cyan-400 font-bold uppercase text-xs flex items-center gap-1.5">
                <Cpu size={14} /> ACTIVE CYBERNETICS LOADOUT
              </h4>
              <div className="bg-black/60 border border-cyan-500/30 rounded p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-300 font-bold">SYNAPTIC ACCELERATOR MK-IV</span>
                  <span className="text-teal-400">TIER 3</span>
                </div>
                <p className="text-gray-400">Reduces hack latency by 35% and provides neural feedback damping.</p>
              </div>
              <div className="bg-black/60 border border-cyan-500/30 rounded p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-300 font-bold">SUB-DERMAL OPTICAL CAMO</span>
                  <span className="text-teal-400">TIER 2</span>
                </div>
                <p className="text-gray-400">Bypasses threat radar scans for up to 45 seconds during infiltration.</p>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-4">
              <h4 className="text-cyan-400 font-bold uppercase text-xs flex items-center gap-1.5">
                <FileText size={14} /> DECRYPTED AUDIO LOG #808
              </h4>
              <div className="bg-black/80 border border-cyan-500/30 rounded-lg p-4 space-y-3">
                <div className="h-16 bg-cyan-950/40 rounded overflow-hidden relative">
                  <HolographicSync active={isPlayingAudio} mode="waveform" frequency={520} />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="flex items-center space-x-2 px-4 py-2 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 transition"
                  >
                    {isPlayingAudio ? <Pause size={16} /> : <Play size={16} />}
                    <span>{isPlayingAudio ? 'PAUSE PLAYBACK' : 'PLAY AUDIO LOG'}</span>
                  </button>

                  <span className="text-gray-500 text-[10px]">FREQ: 520 MHz // DECRYPTED</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
