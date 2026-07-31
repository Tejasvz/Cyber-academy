import React, { useState } from 'react';
import { useAudioStore } from '../../store/audioStore';

interface SectorNode {
  id: string;
  name: string;
  faction: 'AetherCorp' | 'Syndicate' | 'Resistance' | 'Unknown';
  status: 'SECURE' | 'COMPROMISED' | 'LOCKED';
  xpRequired: number;
  x: number; // percentage
  y: number; // percentage
  coordinates: string;
  info: string;
}

interface SectorMapProps {
  userXp: number;
}

export const SectorMap: React.FC<SectorMapProps> = ({ userXp }) => {
  const { playUiClick } = useAudioStore();
  const [hoveredNode, setHoveredNode] = useState<SectorNode | null>(null);

  // Map nodes matching the Act I/II/III progression
  const nodes: SectorNode[] = [
    {
      id: 'sec_zero',
      name: 'Sector Zero (Entry buffer)',
      faction: 'Resistance',
      status: userXp >= 0 ? 'COMPROMISED' : 'SECURE',
      xpRequired: 0,
      x: 20,
      y: 30,
      coordinates: '0x00:0xFF:12',
      info: 'Decryption gateway buffer. Primary access point for handler daemon Aurelia.',
    },
    {
      id: 'aether_main',
      name: 'AetherCorp Server Vault',
      faction: 'AetherCorp',
      status: userXp >= 200 ? 'COMPROMISED' : (userXp >= 100 ? 'SECURE' : 'LOCKED'),
      xpRequired: 100,
      x: 75,
      y: 25,
      coordinates: '0x0C:0xAE:88',
      info: 'Corporate database array holding raw synaptic interface source code files.',
    },
    {
      id: 'syndicate_node',
      name: 'Syndicate Core Array',
      faction: 'Syndicate',
      status: userXp >= 400 ? 'COMPROMISED' : (userXp >= 300 ? 'SECURE' : 'LOCKED'),
      xpRequired: 300,
      x: 35,
      y: 75,
      coordinates: '0x1F:0x00:4C',
      info: 'Command-and-control subnet distributing malware payloads across the Neural Veil.',
    },
    {
      id: 'hesper_lab',
      name: 'Hesper Secret Annex',
      faction: 'Unknown',
      status: userXp >= 600 ? 'SECURE' : 'LOCKED',
      xpRequired: 600,
      x: 80,
      y: 70,
      coordinates: '0x88:0xFF:E2',
      info: 'Classified laboratory housing the prototype Neural Veil synthesis reactor.',
    },
  ];

  // SVG connecting lines between sector hubs
  const lines = [
    { from: 'sec_zero', to: 'aether_main' },
    { from: 'sec_zero', to: 'syndicate_node' },
    { from: 'aether_main', to: 'hesper_lab' },
    { from: 'syndicate_node', to: 'hesper_lab' },
  ];

  const getNodeColor = (status: SectorNode['status']) => {
    if (status === 'COMPROMISED') return '#39ff14'; // Green for hijacked/cleared
    if (status === 'SECURE') return '#00f0ff'; // Cyan for target/available
    return '#ff2a2a'; // Red/Locked
  };

  return (
    <div className="w-full h-full min-h-[380px] bg-[#07070a] border border-primary/10 rounded relative overflow-hidden font-mono select-none">
      {styleBlock}

      {/* Radar sweeping scan lines */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-30 select-none">
        <div className="w-[200%] h-[200%] absolute top-[-50%] left-[-50%] bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.08)_0%,transparent_70%)] animate-[radar-rotate_16s_linear_infinite]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:100%_20px]" />
      </div>

      {/* Grid rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.07] border border-primary/20 z-0">
        <div className="w-48 h-48 rounded-full border border-primary animate-ping" style={{ animationDuration: '6s' }} />
        <div className="w-96 h-96 rounded-full border border-primary absolute" />
        <div className="w-[600px] h-[600px] rounded-full border border-primary absolute" />
      </div>

      {/* Connection paths */}
      <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        {lines.map((line, idx) => {
          const fromNode = nodes.find((n) => n.id === line.from);
          const toNode = nodes.find((n) => n.id === line.to);
          if (!fromNode || !toNode) return null;

          const isLocked = fromNode.status === 'LOCKED' || toNode.status === 'LOCKED';

          return (
            <line
              key={idx}
              x1={`${fromNode.x}%`}
              y1={`${fromNode.y}%`}
              x2={`${toNode.x}%`}
              y2={`${toNode.y}%`}
              stroke={isLocked ? 'rgba(255, 42, 42, 0.15)' : 'rgba(0, 240, 255, 0.25)'}
              strokeWidth={isLocked ? '1' : '1.5'}
              strokeDasharray={isLocked ? '3, 6' : '0'}
              className={!isLocked ? 'animate-pulse' : ''}
            />
          );
        })}
      </svg>

      {/* Sector Nodes */}
      {nodes.map((node) => {
        const isHovered = hoveredNode?.id === node.id;
        const color = getNodeColor(node.status);

        return (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            onMouseEnter={() => {
              playUiClick();
              setHoveredNode(node);
            }}
            onMouseLeave={() => setHoveredNode(null)}
            className="z-20 cursor-pointer"
          >
            {/* Interactive pulsing radar node point */}
            <div className="relative flex items-center justify-center w-8 h-8">
              {node.status !== 'LOCKED' && (
                <div 
                  className="absolute w-6 h-6 rounded-full animate-ping opacity-30"
                  style={{ backgroundColor: color }}
                />
              )}
              <div 
                className="w-3 h-3 rounded-full border border-background shadow-lg transition-transform duration-200"
                style={{ 
                  backgroundColor: color,
                  transform: isHovered ? 'scale(1.3)' : 'scale(1)'
                }}
              />
            </div>

            {/* Micro label identifier */}
            <div 
              className="absolute top-7 left-1/2 -translate-x-1/2 bg-[#0d0d12]/90 border border-primary/20 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-widest whitespace-nowrap"
              style={{ color }}
            >
              {node.status === 'LOCKED' ? '🔒 SEC_LOCK' : node.id.toUpperCase()}
            </div>
          </div>
        );
      })}

      {/* Hover Telemetry HUD Panel */}
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 right-4 bg-[#0d0d12]/95 border border-primary/30 p-3.5 rounded shadow-[0_0_15px_rgba(0,240,255,0.2)] z-30 flex flex-col md:flex-row justify-between gap-3 animate-[fade-in_0.2s_ease-out]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span 
                className="w-2 h-2 rounded-full animate-pulse" 
                style={{ backgroundColor: getNodeColor(hoveredNode.status) }} 
              />
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                {hoveredNode.name}
              </span>
            </div>
            <p className="text-[8.5px] text-textMuted max-w-xl leading-relaxed">
              {hoveredNode.info}
            </p>
          </div>

          <div className="shrink-0 flex flex-row md:flex-col justify-between md:items-end text-[8px] font-bold text-textMuted border-t md:border-t-0 md:border-l border-primary/10 pt-2 md:pt-0 md:pl-4 min-w-[130px] gap-1.5">
            <div>
              COORDS: <span className="text-secondary">{hoveredNode.coordinates}</span>
            </div>
            <div>
              OWNER: <span className="text-secondary uppercase">{hoveredNode.faction}</span>
            </div>
            <div>
              STATUS: <span className="uppercase" style={{ color: getNodeColor(hoveredNode.status) }}>{hoveredNode.status}</span>
            </div>
            {hoveredNode.status === 'LOCKED' && (
              <div className="text-[#ff2a2a] animate-pulse">
                XP REQ: {hoveredNode.xpRequired} (CURRENT: {userXp})
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compass grid marker */}
      <div className="absolute top-3 right-4 text-[7px] text-textMuted uppercase font-bold tracking-widest opacity-60">
        GRID: SECTOR_ZERO_LATTICE
      </div>
    </div>
  );
};

// Sonar scope animation rotations
const styleBlock = (
  <style dangerouslySetInnerHTML={{ __html: `
    @keyframes radar-rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `}} />
);
export default SectorMap;
