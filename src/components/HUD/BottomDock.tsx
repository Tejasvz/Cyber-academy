import React from 'react';
import { 
  Terminal, 
  Crosshair, 
  Eye, 
  Shield, 
  GitMerge, 
  Database, 
  Settings 
} from 'lucide-react';
import type { NavTab } from '../../types';
import { sound } from '../../utils/audioSynth';

interface BottomDockProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenTerminalModal: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  activeTab,
  onSelectTab,
  onOpenTerminalModal,
}) => {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-2 flex items-end gap-4 sm:gap-6 z-40 select-none">
      {/* 1. Terminal Icon */}
      <button
        onClick={() => {
          sound.playClick();
          onOpenTerminalModal();
        }}
        className="flex flex-col items-center gap-1 text-[#94a3b8] hover:text-[#22d3ee] cursor-pointer transition group"
        title="Open Full Terminal"
      >
        <div className="p-2 rounded border border-transparent group-hover:border-[#22d3ee]/40 group-hover:bg-[#22d3ee]/10 transition">
          <Terminal className="w-5 h-5" />
        </div>
        <span className="text-[9px] font-mono-cyber tracking-wider">TERMINAL</span>
      </button>

      {/* 2. Missions Icon */}
      <button
        onClick={() => {
          sound.playClick();
          onSelectTab('MISSIONS');
        }}
        className={`flex flex-col items-center gap-1 cursor-pointer transition group ${
          activeTab === 'MISSIONS' ? 'text-[#22d3ee]' : 'text-[#94a3b8] hover:text-[#22d3ee]'
        }`}
        title="Open Missions Hub"
      >
        <div
          className={`p-2 rounded border transition ${
            activeTab === 'MISSIONS'
              ? 'border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee] shadow-neon-cyan'
              : 'border-transparent group-hover:border-[#22d3ee]/40 group-hover:bg-[#22d3ee]/10'
          }`}
        >
          <Crosshair className="w-5 h-5" />
        </div>
        <span className="text-[9px] font-mono-cyber tracking-wider">MISSIONS</span>
      </button>

      {/* 3. Skill Tree Icon */}
      <button
        onClick={() => {
          sound.playClick();
          onSelectTab('SKILL_TREE');
        }}
        className={`flex flex-col items-center gap-1 cursor-pointer transition group ${
          activeTab === 'SKILL_TREE' ? 'text-[#22d3ee]' : 'text-[#94a3b8] hover:text-[#22d3ee]'
        }`}
        title="Open Neural Skill Tree"
      >
        <div
          className={`p-2 rounded border transition ${
            activeTab === 'SKILL_TREE'
              ? 'border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee] shadow-neon-cyan'
              : 'border-transparent group-hover:border-[#22d3ee]/40 group-hover:bg-[#22d3ee]/10'
          }`}
        >
          <GitMerge className="w-5 h-5" />
        </div>
        <span className="text-[9px] font-mono-cyber tracking-wider">SKILLS</span>
      </button>

      {/* 4. Center Logo Button (Larger, elevated) */}
      <button
        onClick={() => {
          sound.playAureliaPulse();
          onSelectTab('DASHBOARD');
        }}
        className="w-13 h-13 sm:w-14 sm:h-14 bg-[#0b1633] border-2 border-[#22d3ee] rounded-full flex items-center justify-center -translate-y-2.5 shadow-neon-cyan cursor-pointer hover:bg-[#22d3ee]/25 hover:scale-105 active:scale-95 transition relative z-10 group"
        title="Project Veil Core Command"
      >
        <Shield className="w-6 h-6 text-[#22d3ee] fill-[#22d3ee]/20 group-hover:scale-110 transition-transform" />
      </button>

      {/* 5. Intel Icon */}
      <button
        onClick={() => {
          sound.playClick();
          onSelectTab('INTEL');
        }}
        className={`flex flex-col items-center gap-1 cursor-pointer transition group ${
          activeTab === 'INTEL' ? 'text-[#22d3ee]' : 'text-[#94a3b8] hover:text-[#22d3ee]'
        }`}
        title="Open Intel Archive"
      >
        <div
          className={`p-2 rounded border transition ${
            activeTab === 'INTEL'
              ? 'border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee] shadow-neon-cyan'
              : 'border-transparent group-hover:border-[#22d3ee]/40 group-hover:bg-[#22d3ee]/10'
          }`}
        >
          <Eye className="w-5 h-5" />
        </div>
        <span className="text-[9px] font-mono-cyber tracking-wider">INTEL</span>
      </button>

      {/* 6. Conspiracy Board Icon */}
      <button
        onClick={() => {
          sound.playClick();
          onSelectTab('CONSPIRACY');
        }}
        className={`flex flex-col items-center gap-1 cursor-pointer transition group ${
          activeTab === 'CONSPIRACY' ? 'text-[#22d3ee]' : 'text-[#94a3b8] hover:text-[#22d3ee]'
        }`}
        title="Open Conspiracy Board"
      >
        <div
          className={`p-2 rounded border transition ${
            activeTab === 'CONSPIRACY'
              ? 'border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee] shadow-neon-cyan'
              : 'border-transparent group-hover:border-[#22d3ee]/40 group-hover:bg-[#22d3ee]/10'
          }`}
        >
          <Database className="w-5 h-5" />
        </div>
        <span className="text-[9px] font-mono-cyber tracking-wider">BOARD</span>
      </button>

      {/* 7. Settings Icon */}
      <button
        onClick={() => {
          sound.playClick();
          onSelectTab('SETTINGS');
        }}
        className={`flex flex-col items-center gap-1 cursor-pointer transition group ${
          activeTab === 'SETTINGS' ? 'text-[#22d3ee]' : 'text-[#94a3b8] hover:text-[#22d3ee]'
        }`}
        title="System Settings"
      >
        <div
          className={`p-2 rounded border transition ${
            activeTab === 'SETTINGS'
              ? 'border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee] shadow-neon-cyan'
              : 'border-transparent group-hover:border-[#22d3ee]/40 group-hover:bg-[#22d3ee]/10'
          }`}
        >
          <Settings className="w-5 h-5" />
        </div>
        <span className="text-[9px] font-mono-cyber tracking-wider">CONFIG</span>
      </button>
    </div>
  );
};
