import React from 'react';
import { 
  Shield, 
  Crosshair, 
  Eye, 
  Terminal, 
  GitMerge, 
  Database, 
  Settings 
} from 'lucide-react';
import type { NavTab } from '../../types';
import { sound } from '../../utils/audioSynth';

interface LeftSidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ activeTab, onSelectTab }) => {
  const navItems: Array<{ id: NavTab; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'DASHBOARD', label: 'DASHBOARD', icon: Shield },
    { id: 'MISSIONS', label: 'MISSIONS', icon: Crosshair },
    { id: 'SKILL_TREE', label: 'SKILL TREE', icon: GitMerge },
    { id: 'INTEL', label: 'INTEL', icon: Eye },
    { id: 'CONSPIRACY', label: 'BOARD', icon: Database },
    { id: 'TERMINAL', label: 'TERMINAL', icon: Terminal },
  ];

  return (
    <nav className="w-[72px] h-full flex flex-col items-center py-3 gap-4 border-r border-[#22d3ee]/20 bg-[#0c1324]/65 backdrop-blur-md select-none shrink-0 z-30">
      {/* Top Logo Icon */}
      <div 
        onClick={() => {
          sound.playClick();
          onSelectTab('DASHBOARD');
        }}
        className="cursor-pointer mb-1 group"
        title="Project Veil Command Center"
      >
        <div className="w-10 h-10 border border-[#22d3ee] bg-[#22d3ee]/10 rounded flex items-center justify-center text-[#22d3ee] shadow-neon-cyan group-hover:bg-[#22d3ee]/25 transition">
          <Shield className="w-5 h-5 fill-[#22d3ee]/20" />
        </div>
      </div>

      {/* Main Navigation Items */}
      <div className="flex flex-col gap-3.5 w-full items-center">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                onSelectTab(item.id);
              }}
              className={`flex flex-col items-center gap-1 group w-full py-1 transition relative ${
                isActive ? 'opacity-100' : 'opacity-65 hover:opacity-100'
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#22d3ee] shadow-[0_0_10px_#22d3ee]"></div>
              )}

              <div
                className={`p-2 rounded transition ${
                  isActive
                    ? 'border border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee] shadow-neon-cyan'
                    : 'text-[#94a3b8] group-hover:text-[#22d3ee] group-hover:bg-[#22d3ee]/10'
                }`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <span
                className={`text-[9px] font-mono-cyber tracking-tighter text-center leading-tight transition ${
                  isActive ? 'text-[#22d3ee] font-bold text-glow-cyan' : 'text-[#94a3b8] group-hover:text-[#e2e8f0]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Config Button */}
      <div className="mt-auto w-full flex justify-center pb-2">
        <button
          onClick={() => {
            sound.playClick();
            onSelectTab('SETTINGS');
          }}
          className={`flex flex-col items-center gap-1 group w-full py-1 transition relative ${
            activeTab === 'SETTINGS' ? 'opacity-100' : 'opacity-65 hover:opacity-100'
          }`}
        >
          {activeTab === 'SETTINGS' && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#a855f7] shadow-[0_0_10px_#a855f7]"></div>
          )}
          <div
            className={`p-2 rounded transition ${
              activeTab === 'SETTINGS'
                ? 'border border-[#a855f7] bg-[#a855f7]/20 text-[#a855f7] shadow-neon-purple'
                : 'text-[#94a3b8] group-hover:text-[#22d3ee] group-hover:bg-[#22d3ee]/10'
            }`}
          >
            <Settings className="w-5 h-5" />
          </div>
          <span
            className={`text-[9px] font-mono-cyber tracking-tighter text-center leading-tight transition ${
              activeTab === 'SETTINGS' ? 'text-[#a855f7] font-bold text-glow-purple' : 'text-[#94a3b8] group-hover:text-[#e2e8f0]'
            }`}
          >
            CONFIG
          </span>
        </button>
      </div>
    </nav>
  );
};
