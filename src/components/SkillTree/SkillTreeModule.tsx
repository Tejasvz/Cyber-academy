import React, { useState } from 'react';
import { Cpu, Zap, Lock, CheckCircle, Award, RefreshCcw } from 'lucide-react';

export interface SkillNode {
  id: string;
  name: string;
  category: 'cyberware' | 'hacking' | 'stealth' | 'combat';
  tier: number;
  cost: number;
  unlocked: boolean;
  prerequisiteId?: string;
  description: string;
  effect: string;
  icon: string;
}

const INITIAL_SKILLS: SkillNode[] = [
  // Cyberware Branch
  {
    id: 'cyber_1',
    name: 'SYNAPTIC OVERCLOCK',
    category: 'cyberware',
    tier: 1,
    cost: 1,
    unlocked: true,
    description: 'Increases command execution speed and terminal buffer responsiveness by 25%.',
    effect: '+25% Command Speed',
    icon: 'Cpu'
  },
  {
    id: 'cyber_2',
    name: 'NEURAL SHIELDING',
    category: 'cyberware',
    tier: 2,
    cost: 2,
    unlocked: false,
    prerequisiteId: 'cyber_1',
    description: 'Dampens counter-hack shockwaves during automated brute force sweeps.',
    effect: '-40% Counter-Hack Damage',
    icon: 'Shield'
  },
  // Hacking Branch
  {
    id: 'hack_1',
    name: 'DNS MESH INJECTOR',
    category: 'hacking',
    tier: 1,
    cost: 1,
    unlocked: true,
    description: 'Enables deep DNS lookup bypasses and hidden subdomain discovery.',
    effect: 'Unlocks DNS Bypass Commands',
    icon: 'Zap'
  },
  {
    id: 'hack_2',
    name: 'PARALLEL PORT SCANNER',
    category: 'hacking',
    tier: 2,
    cost: 2,
    unlocked: false,
    prerequisiteId: 'hack_1',
    description: 'Scans up to 100 ports simultaneously without raising threat alert levels.',
    effect: 'Stealth Scan Enabled',
    icon: 'Zap'
  },
  // Stealth Branch
  {
    id: 'stealth_1',
    name: 'SIGNAL SPOOFER',
    category: 'stealth',
    tier: 1,
    cost: 1,
    unlocked: false,
    description: 'Spoofs IP telemetry to evade active Sector Zero radar sweep sweeps.',
    effect: '-30% Radar Detectability',
    icon: 'Shield'
  },
  // Combat Branch
  {
    id: 'combat_1',
    name: 'KINETIC BREACH ARMATURE',
    category: 'combat',
    tier: 1,
    cost: 1,
    unlocked: false,
    description: 'Overloads server firewall gates with high-density energy pulses.',
    effect: '+50% Gate Breach Power',
    icon: 'Award'
  }
];

export const SkillTreeModule: React.FC = () => {
  const [skills, setSkills] = useState<SkillNode[]>(INITIAL_SKILLS);
  const [availablePoints, setAvailablePoints] = useState(5);
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(skills[0]);

  const handleUnlock = (skillId: string) => {
    const target = skills.find(s => s.id === skillId);
    if (!target || target.unlocked) return;

    if (target.prerequisiteId) {
      const prereq = skills.find(s => s.id === target.prerequisiteId);
      if (!prereq || !prereq.unlocked) return;
    }

    if (availablePoints < target.cost) return;

    setAvailablePoints(prev => prev - target.cost);
    setSkills(prev =>
      prev.map(s => (s.id === skillId ? { ...s, unlocked: true } : s))
    );
    setSelectedSkill(prev => (prev?.id === skillId ? { ...prev, unlocked: true } : prev));
  };

  const handleReset = () => {
    setSkills(INITIAL_SKILLS);
    setAvailablePoints(5);
    setSelectedSkill(INITIAL_SKILLS[0]);
  };

  return (
    <div className="w-full h-full bg-[#0a0e14]/90 text-[#dfe2eb] font-mono flex flex-col justify-between p-4 rounded-lg select-none">
      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-cyan-500/30 pb-3">
        <div className="flex items-center space-x-3">
          <Cpu size={20} className="text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold text-cyan-300 tracking-wider">OPERATOR SKILL TREE & UPGRADES</h2>
            <p className="text-[11px] text-gray-400">NEURAL ENHANCEMENT ARCHITECTURE</p>
          </div>
        </div>

        {/* Available Points Counter & Reset */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 bg-cyan-950/60 border border-cyan-500/40 rounded px-3 py-1 text-cyan-300 font-bold">
            <Award size={14} className="text-teal-400" />
            <span>POINTS AVAILABLE:</span>
            <span className="text-teal-300 text-sm font-black">{availablePoints}</span>
          </div>

          <button
            onClick={handleReset}
            className="p-1.5 border border-cyan-500/30 rounded text-gray-400 hover:text-cyan-300 hover:bg-cyan-500/20 transition"
            title="Reset Skill Points"
          >
            <RefreshCcw size={14} />
          </button>
        </div>
      </div>

      {/* Main Node Graph */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 my-3 overflow-y-auto pr-2">
        {/* Left Skill Nodes Grid */}
        <div className="md:col-span-2 bg-black/60 border border-cyan-500/30 rounded-lg p-4 space-y-4">
          <div className="text-xs font-bold text-cyan-400 tracking-wider uppercase border-b border-cyan-500/20 pb-2">
            CYBERNETIC & HACKING NODES
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {skills.map(skill => {
              const isSelected = selectedSkill?.id === skill.id;
              const prereq = skill.prerequisiteId ? skills.find(s => s.id === skill.prerequisiteId) : null;
              const canUnlock = !skill.unlocked && availablePoints >= skill.cost && (!prereq || prereq.unlocked);

              return (
                <div
                  key={skill.id}
                  onClick={() => setSelectedSkill(skill)}
                  className={`p-3 rounded-lg border flex flex-col justify-between space-y-2 transition cursor-pointer relative ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                      : skill.unlocked
                      ? 'border-teal-500/40 bg-teal-950/20'
                      : canUnlock
                      ? 'border-cyan-500/30 bg-black/40 hover:border-cyan-400'
                      : 'border-gray-800 bg-black/60 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{skill.category}</span>
                    {skill.unlocked ? (
                      <CheckCircle size={14} className="text-teal-400" />
                    ) : (
                      <Lock size={14} className="text-gray-500" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-cyan-300 leading-tight">{skill.name}</h4>
                    <p className="text-[10px] text-teal-400 mt-1">{skill.effect}</p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-gray-500 border-t border-cyan-500/20 pt-1">
                    <span>TIER {skill.tier}</span>
                    <span className="text-cyan-400 font-bold">{skill.cost} PTS</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Skill Node Detail Preview */}
        {selectedSkill && (
          <div className="bg-black/70 border border-cyan-500/40 rounded-lg p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-cyan-400">
                <Cpu size={18} />
                <span className="text-xs font-bold uppercase">{selectedSkill.category} BRANCH</span>
              </div>

              <h3 className="text-sm font-bold text-cyan-200">{selectedSkill.name}</h3>

              <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded text-xs space-y-1">
                <span className="text-gray-400 text-[10px]">UPGRADE EFFECT</span>
                <p className="text-teal-300 font-semibold">{selectedSkill.effect}</p>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">{selectedSkill.description}</p>
            </div>

            {/* Unlock Action Button */}
            <div>
              {selectedSkill.unlocked ? (
                <div className="w-full py-2 bg-teal-950/60 border border-teal-500/40 rounded text-center text-xs font-bold text-teal-300 flex items-center justify-center space-x-2">
                  <CheckCircle size={14} />
                  <span>UPGRADE UNLOCKED</span>
                </div>
              ) : (
                <button
                  onClick={() => handleUnlock(selectedSkill.id)}
                  disabled={
                    availablePoints < selectedSkill.cost ||
                    (!!selectedSkill.prerequisiteId && !skills.find(s => s.id === selectedSkill.prerequisiteId)?.unlocked)
                  }
                  className="w-full py-2 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 disabled:opacity-40 transition text-xs flex items-center justify-center space-x-2"
                >
                  <Zap size={14} />
                  <span>UNLOCK UPGRADE ({selectedSkill.cost} PTS)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center text-[11px] text-gray-500 border-t border-cyan-500/20 pt-2">
        <span>CYBERWARE ENHANCEMENT ENGINE</span>
        <span className="text-cyan-400">AETHER UPGRADE NODE PROTOCOL</span>
      </div>
    </div>
  );
};
