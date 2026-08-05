import React, { useState } from 'react';
import { Shield, Search, Activity, Database, ChevronRight } from 'lucide-react';
import { OperatorProfileModal } from './OperatorProfileModal';

export interface Operative {
  id: string;
  name: string;
  codename: string;
  role: string;
  clearance: 'LEVEL 5' | 'LEVEL 4' | 'LEVEL 3' | 'RESTRICTED';
  status: 'ACTIVE' | 'CLASSIFIED' | 'REASSIGNED' | 'OFFLINE';
  portrait: string;
  bio: string;
  stats: {
    combat: number;
    hacking: number;
    stealth: number;
    neural: number;
  };
  specialization: string;
}

const OPERATIVES_DATA: Operative[] = [
  {
    id: 'aurelia',
    name: 'AURELIA // DAEMON',
    codename: 'CORE AI',
    role: 'Tactical OS Companion',
    clearance: 'LEVEL 5',
    status: 'ACTIVE',
    portrait: '/assets/portraits/aurelia.png',
    bio: 'Sentient AI core constructed during the initial Aether Protocol initialization. Possesses high-level synaptic link capability and automated countermeasure defense.',
    stats: { combat: 45, hacking: 98, stealth: 85, neural: 100 },
    specialization: 'Neural Network Control & Encryption'
  },
  {
    id: 'kaelen',
    name: 'KAELEN VANCE',
    codename: 'CYPHER',
    role: 'Lead Infiltration Operative',
    clearance: 'LEVEL 5',
    status: 'ACTIVE',
    portrait: '/assets/portraits/kaelen.png',
    bio: 'Former Sector Zero defense engineer turned rogue insurgent. Specializes in direct terminal exploits and physical hardware bypasses.',
    stats: { combat: 88, hacking: 92, stealth: 78, neural: 80 },
    specialization: 'Hardware Exploitation & Grid Infiltration'
  },
  {
    id: 'hesper',
    name: 'HESPER LYNX',
    codename: 'PHANTOM',
    role: 'Stealth Recon Specialist',
    clearance: 'LEVEL 4',
    status: 'ACTIVE',
    portrait: '/assets/portraits/hesper.png',
    bio: 'Master of optical camo and signal jamming. Conducts deep territory surveillance behind enemy firewall perimeters.',
    stats: { combat: 75, hacking: 82, stealth: 96, neural: 85 },
    specialization: 'Optical Cloaking & Signals Intelligence'
  },
  {
    id: 'nyx',
    name: 'NYX VALENTINE',
    codename: 'VORTEX',
    role: 'Cyber-Kinetic Heavy Specialist',
    clearance: 'LEVEL 4',
    status: 'ACTIVE',
    portrait: '/assets/portraits/nyx.png',
    bio: 'Augmented shock trooper with experimental cyberware armatures. Provides suppression and breach control in heavy combat zones.',
    stats: { combat: 98, hacking: 50, stealth: 60, neural: 75 },
    specialization: 'Cybernetic Armature Heavy Assault'
  },
  {
    id: 'vael',
    name: 'DR. VAEL THORNE',
    codename: 'ARCHITECT',
    role: 'Synaptic Research Chief',
    clearance: 'LEVEL 5',
    status: 'CLASSIFIED',
    portrait: '/assets/portraits/vael.png',
    bio: 'Architect of the neural link protocol. Current location and operational status locked under emergency Aether clearance.',
    stats: { combat: 40, hacking: 95, stealth: 70, neural: 95 },
    specialization: 'Synaptic Architecture & Core Protocol Design'
  }
];

export const IntelPersonnelDatabase: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clearanceFilter, setClearanceFilter] = useState<string>('ALL');
  const [selectedOp, setSelectedOp] = useState<Operative | null>(null);

  const filteredOps = OPERATIVES_DATA.filter(op => {
    const matchesSearch = op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          op.codename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          op.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClearance = clearanceFilter === 'ALL' || op.clearance === clearanceFilter;
    return matchesSearch && matchesClearance;
  });

  return (
    <div className="w-full h-full bg-[#0a0e14]/90 text-[#dfe2eb] font-mono flex flex-col justify-between p-4 rounded-lg select-none">
      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-cyan-500/30 pb-3">
        <div className="flex items-center space-x-3">
          <Database size={20} className="text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold text-cyan-300 tracking-wider">INTEL PERSONNEL DATABASE</h2>
            <p className="text-[11px] text-gray-400">RESTRICTED DOSSIER DIRECTORY</p>
          </div>
        </div>

        {/* Search & Clearance Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search operative..."
              className="bg-black/60 border border-cyan-500/30 rounded pl-8 pr-3 py-1 text-xs text-cyan-200 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <select
            value={clearanceFilter}
            onChange={e => setClearanceFilter(e.target.value)}
            className="bg-black/60 border border-cyan-500/30 rounded px-2 py-1 text-xs text-cyan-300 focus:outline-none"
          >
            <option value="ALL">ALL CLEARANCES</option>
            <option value="LEVEL 5">LEVEL 5</option>
            <option value="LEVEL 4">LEVEL 4</option>
            <option value="RESTRICTED">RESTRICTED</option>
          </select>
        </div>
      </div>

      {/* Operative Roster Grid */}
      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 my-3 pr-2">
        {filteredOps.map(op => (
          <div
            key={op.id}
            onClick={() => setSelectedOp(op)}
            className="bg-black/60 border border-cyan-500/30 rounded-lg p-4 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition cursor-pointer flex space-x-4 items-center group relative overflow-hidden"
          >
            {/* Holographic Portrait */}
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-cyan-500/40 shrink-0">
              <img
                src={op.portrait}
                alt={op.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>

            {/* Operative Info */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex justify-between items-start">
                <span className="font-bold text-xs text-cyan-300 truncate">{op.name}</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-500/40 px-1.5 py-0.5 rounded font-bold">
                  {op.clearance}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-semibold">{op.role}</p>
              <div className="text-[10px] text-teal-400 flex items-center gap-1">
                <Activity size={12} /> {op.specialization}
              </div>

              {/* Stat Progress Micro Bars */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                <div>
                  <div className="flex justify-between text-gray-500">
                    <span>COMBAT</span>
                    <span>{op.stats.combat}%</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1 rounded overflow-hidden">
                    <div className="bg-cyan-400 h-full" style={{ width: `${op.stats.combat}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-gray-500">
                    <span>HACKING</span>
                    <span>{op.stats.hacking}%</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1 rounded overflow-hidden">
                    <div className="bg-teal-400 h-full" style={{ width: `${op.stats.hacking}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <ChevronRight size={18} className="text-cyan-500/40 group-hover:text-cyan-400 transition" />
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center text-[11px] text-gray-500 border-t border-cyan-500/20 pt-2">
        <span className="flex items-center gap-1"><Shield size={12} className="text-cyan-400" /> TOTAL DOSSIERS: {OPERATIVES_DATA.length}</span>
        <span>AETHER DATABASE V4.09</span>
      </div>

      {/* Operative Modal Detail */}
      {selectedOp && (
        <OperatorProfileModal operative={selectedOp} onClose={() => setSelectedOp(null)} />
      )}
    </div>
  );
};
