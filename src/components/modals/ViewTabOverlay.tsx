import React, { useState } from 'react';
import { 
  X, 
  Crosshair, 
  Eye, 
  GitMerge, 
  Database, 
  Settings, 
  Check
} from 'lucide-react';
import type { NavTab } from '../../types';
import { sound } from '../../utils/audioSynth';

interface ViewTabOverlayProps {
  activeTab: NavTab;
  onClose: () => void;
}

export const ViewTabOverlay: React.FC<ViewTabOverlayProps> = ({ activeTab, onClose }) => {
  // Skill Tree state
  const [unlockedSkills, setUnlockedSkills] = useState<string[]>(['s1', 's2']);

  const toggleSkill = (id: string) => {
    sound.playClick();
    if (unlockedSkills.includes(id)) {
      setUnlockedSkills(unlockedSkills.filter((s) => s !== id));
    } else {
      setUnlockedSkills([...unlockedSkills, id]);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'MISSIONS':
        return (
          <div className="space-y-4 font-mono-cyber">
            <div className="flex justify-between items-center border-b border-[#22d3ee]/30 pb-3">
              <div>
                <h2 className="text-xl font-bold text-[#22d3ee] text-glow-cyan flex items-center gap-2">
                  <Crosshair className="w-5 h-5 text-[#22d3ee]" />
                  <span>MISSIONS HUB // SECTOR ZERO PROTOCOLS</span>
                </h2>
                <p className="text-xs text-[#94a3b8]">Active tactical operations available for Operator.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mission 1 */}
              <div className="p-4 bg-[#0b1633]/80 border border-[#a855f7] rounded relative">
                <span className="text-[9px] font-bold text-[#a855f7] bg-[#a855f7]/20 px-2 py-0.5 rounded uppercase">ACTIVE</span>
                <h3 className="text-base font-bold text-[#22d3ee] mt-2">OPERATION BLACK ECHO</h3>
                <p className="text-xs text-[#94a3b8] mt-1">Investigate power failure and override substation firewall in Sector Zero.</p>
                <div className="mt-4 flex justify-between items-center text-xs">
                  <span className="text-[#a855f7]">PROGRESS: 63%</span>
                  <button onClick={() => { sound.playClick(); onClose(); }} className="px-3 py-1 bg-[#a855f7]/20 border border-[#a855f7] text-[#a855f7] rounded hover:bg-[#a855f7]/40">
                    VIEW ON DASHBOARD
                  </button>
                </div>
              </div>

              {/* Mission 2 */}
              <div className="p-4 bg-[#0b1633]/50 border border-[#22d3ee]/30 rounded">
                <span className="text-[9px] font-bold text-[#22d3ee] bg-[#22d3ee]/20 px-2 py-0.5 rounded uppercase">AVAILABLE</span>
                <h3 className="text-base font-bold text-[#e2e8f0] mt-2">CYBER PATROL: NODE 09</h3>
                <p className="text-xs text-[#94a3b8] mt-1">Scan rogue data packets attempting unauthorized entry into Aether protocol.</p>
                <div className="mt-4 flex justify-between items-center text-xs">
                  <span className="text-[#22d3ee]">REWARD: +800 XP</span>
                  <button onClick={() => { sound.playClick(); alert('Mission Accepted!'); }} className="px-3 py-1 bg-[#22d3ee]/20 border border-[#22d3ee] text-[#22d3ee] rounded hover:bg-[#22d3ee]/40">
                    ACCEPT MISSION
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'SKILL_TREE':
        return (
          <div className="space-y-4 font-mono-cyber">
            <div className="flex justify-between items-center border-b border-[#22d3ee]/30 pb-3">
              <div>
                <h2 className="text-xl font-bold text-[#22d3ee] text-glow-cyan flex items-center gap-2">
                  <GitMerge className="w-5 h-5 text-[#22d3ee]" />
                  <span>OPERATOR NEURAL SKILL TREE</span>
                </h2>
                <p className="text-xs text-[#94a3b8]">Unlock neural abilities and quantum cyber exploits.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {[
                { id: 's1', name: 'Firewall Bypass v1', desc: 'Accelerates port override speed by 25%', req: 'LEVEL 1' },
                { id: 's2', name: 'Neural Overclock', desc: 'Reduces Aurelia response delay', req: 'LEVEL 5' },
                { id: 's3', name: 'Quantum Shielding', desc: 'Hardens secure channel against disconnects', req: 'LEVEL 10' },
                { id: 's4', name: 'Deep Packet Scanner', desc: 'Reveals encrypted intel schematics', req: 'LEVEL 12' },
                { id: 's5', name: 'Aether Synergy', desc: 'Increases XP gained by 15%', req: 'LEVEL 15' },
                { id: 's6', name: 'Zero-Day Protocol', desc: 'Instant firewall bypass ability', req: 'LEVEL 20' },
              ].map((skill) => {
                const isUnlocked = unlockedSkills.includes(skill.id);
                return (
                  <div
                    key={skill.id}
                    onClick={() => toggleSkill(skill.id)}
                    className={`p-4 rounded border cursor-pointer transition ${
                      isUnlocked
                        ? 'border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee] shadow-neon-cyan'
                        : 'border-[#22d3ee]/20 bg-[#0c1324]/60 text-[#94a3b8] hover:border-[#22d3ee]/50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-current">
                        {skill.req}
                      </span>
                      {isUnlocked && <Check className="w-4 h-4 text-[#4ade80]" />}
                    </div>
                    <h4 className="text-sm font-bold text-[#e2e8f0]">{skill.name}</h4>
                    <p className="text-xs opacity-80 mt-1">{skill.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'INTEL':
        return (
          <div className="space-y-4 font-mono-cyber">
            <div className="flex justify-between items-center border-b border-[#22d3ee]/30 pb-3">
              <div>
                <h2 className="text-xl font-bold text-[#22d3ee] text-glow-cyan flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#22d3ee]" />
                  <span>CLASSIFIED INTEL ARCHIVE</span>
                </h2>
                <p className="text-xs text-[#94a3b8]">Review intercepted communications and technical schematics.</p>
              </div>
            </div>

            <div className="p-4 bg-[#0c1324] border border-[#22d3ee]/30 rounded space-y-3">
              <div className="flex justify-between items-center p-3 bg-[#0b1633] rounded border border-[#22d3ee]/20">
                <div>
                  <h4 className="text-sm font-bold text-[#22d3ee]">POWER GRID SCHEMATICS</h4>
                  <p className="text-xs text-[#94a3b8]">Sector Zero / Substation Node</p>
                </div>
                <span className="text-xs text-[#4ade80] font-bold">DECRYPTED</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0b1633] rounded border border-[#22d3ee]/20">
                <div>
                  <h4 className="text-sm font-bold text-[#22d3ee]">FIREWALL CONFIG LEAK</h4>
                  <p className="text-xs text-[#94a3b8]">Exploit vector identified port 443</p>
                </div>
                <span className="text-xs text-[#4ade80] font-bold">DECRYPTED</span>
              </div>
            </div>
          </div>
        );

      case 'CONSPIRACY':
        return (
          <div className="space-y-4 font-mono-cyber">
            <div className="flex justify-between items-center border-b border-[#22d3ee]/30 pb-3">
              <div>
                <h2 className="text-xl font-bold text-[#22d3ee] text-glow-cyan flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#22d3ee]" />
                  <span>AETHER CONSPIRACY EVIDENCE BOARD</span>
                </h2>
                <p className="text-xs text-[#94a3b8]">Interconnected evidence nodes and memory fragments.</p>
              </div>
            </div>

            <div className="p-4 bg-[#0c1324] border border-[#22d3ee]/30 rounded space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-[#0b1633] rounded">
                <span className="text-[#22d3ee]">NODE_01_POWER_GRID</span>
                <span className="text-[#4ade80]">VERIFIED LINK</span>
              </div>
              <div className="flex justify-between p-2 bg-[#0b1633] rounded">
                <span className="text-[#22d3ee]">NODE_02_FIREWALL_RULES</span>
                <span className="text-[#4ade80]">VERIFIED LINK</span>
              </div>
              <div className="flex justify-between p-2 bg-[#0b1633] rounded">
                <span className="text-[#22d3ee]">NODE_03_AURELIA_MEMORIES</span>
                <span className="text-[#a855f7]">ENCRYPTED NODE</span>
              </div>
            </div>
          </div>
        );

      case 'SETTINGS':
      default:
        return (
          <div className="space-y-4 font-mono-cyber">
            <div className="flex justify-between items-center border-b border-[#22d3ee]/30 pb-3">
              <div>
                <h2 className="text-xl font-bold text-[#a855f7] text-glow-purple flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#a855f7]" />
                  <span>SYSTEM CONFIGURATION</span>
                </h2>
                <p className="text-xs text-[#94a3b8]">Adjust OS display, sound, and HUD parameters.</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 bg-[#0b1633]/80 border border-[#22d3ee]/30 rounded flex justify-between items-center">
                <span>UI SYNTH AUDIO EFFECTS</span>
                <button onClick={() => sound.playClick()} className="px-3 py-1 bg-[#22d3ee]/20 border border-[#22d3ee] text-[#22d3ee] rounded">
                  ENABLED
                </button>
              </div>
              <div className="p-3 bg-[#0b1633]/80 border border-[#22d3ee]/30 rounded flex justify-between items-center">
                <span>CRT SCANLINE EFFECT</span>
                <button onClick={() => sound.playClick()} className="px-3 py-1 bg-[#a855f7]/20 border border-[#a855f7] text-[#a855f7] rounded">
                  ACTIVE
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-[#030816]/90 backdrop-blur-lg select-none">
      <div className="glass-panel border-[#22d3ee] rounded-lg w-full max-w-4xl h-[80vh] flex flex-col shadow-neon-cyan overflow-hidden">
        {/* Header */}
        <div className="panel-header px-5 py-3 flex justify-between items-center border-b border-[#22d3ee]/30">
          <span className="text-[#22d3ee] font-bold text-xs tracking-widest font-mono-cyber">
            PROJECT VEIL WORKSPACE // {activeTab}
          </span>
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

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#030816]/80">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#22d3ee]/30 bg-[#0c1324] flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-1.5 text-xs font-mono-cyber border border-[#22d3ee] text-[#22d3ee] bg-[#22d3ee]/10 rounded hover:bg-[#22d3ee]/25 transition"
          >
            RETURN TO DASHBOARD
          </button>
        </div>
      </div>
    </div>
  );
};
