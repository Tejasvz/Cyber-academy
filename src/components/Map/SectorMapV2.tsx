import React, { useState, useEffect, useRef } from 'react';
import { Compass, ShieldAlert, Radio, Navigation } from 'lucide-react';

export interface SectorNode {
  id: string;
  name: string;
  grid: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'STABLE' | 'UNKNOWN';
  control: string;
  x: number; // percentage
  y: number; // percentage
  description: string;
}

const SECTOR_NODES: SectorNode[] = [
  {
    id: 's01',
    name: 'SECTOR 01 // CENTRAL HUB',
    grid: 'A1-09',
    threatLevel: 'STABLE',
    control: 'NEURAL RESISTANCE',
    x: 35,
    y: 40,
    description: 'Primary operations center and terminal command relay.'
  },
  {
    id: 's02',
    name: 'SECTOR 02 // AETHER DATA GATE',
    grid: 'B4-88',
    threatLevel: 'CRITICAL',
    control: 'AETHER PROTOCOL',
    x: 65,
    y: 30,
    description: 'Encrypted gateway controlling Sector Zero traffic flow.'
  },
  {
    id: 's03',
    name: 'SECTOR 03 // BLACK ECHO BEACON',
    grid: 'C2-14',
    threatLevel: 'HIGH',
    control: 'SYNDICATE MESH',
    x: 50,
    y: 75,
    description: 'Rogue frequency broadcast array transmitting corrupted telemetry.'
  },
  {
    id: 's04',
    name: 'SECTOR 04 // MEMORY VAULT',
    grid: 'D8-02',
    threatLevel: 'STABLE',
    control: 'UNASSOCIATED',
    x: 20,
    y: 60,
    description: 'Sub-surface memory storage enclave containing fragmented neural logs.'
  }
];

export const SectorMapV2: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<SectorNode>(SECTOR_NODES[0]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Radar sweep animation on background canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      canvas.width = canvas.clientWidth || 600;
      canvas.height = canvas.clientHeight || 400;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 20;

      // Radar circles
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = 1;
      [0.3, 0.6, 0.9].forEach(r => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Radar Sweep line
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);

      const sweepGrad = ctx.createConicGradient(0, 0, 0);
      sweepGrad.addColorStop(0, 'rgba(0, 240, 255, 0.3)');
      sweepGrad.addColorStop(0.1, 'rgba(0, 240, 255, 0.05)');
      sweepGrad.addColorStop(0.2, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius * 0.9, 0, Math.PI / 3);
      ctx.fill();

      ctx.restore();

      angle += 0.03;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="w-full h-full bg-[#0a0e14]/90 text-[#dfe2eb] font-mono flex flex-col justify-between p-4 rounded-lg select-none">
      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-cyan-500/30 pb-3">
        <div className="flex items-center space-x-3">
          <Compass size={20} className="text-cyan-400 animate-spin" />
          <div>
            <h2 className="text-sm font-bold text-cyan-300 tracking-wider">SECTOR ZERO STRATEGIC MAP V2</h2>
            <p className="text-[11px] text-gray-400">TACTICAL RADAR & NODE MATRIX</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="flex items-center gap-1 text-teal-400 font-bold bg-cyan-950/40 border border-cyan-500/30 px-2 py-1 rounded">
            <Radio size={12} className="animate-pulse" /> RADAR SWEEP ACTIVE
          </span>
        </div>
      </div>

      {/* Map View & Node Panel */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 my-3 overflow-hidden">
        {/* Map Canvas & Node Overlay */}
        <div className="md:col-span-2 relative bg-black/80 border border-cyan-500/30 rounded-lg overflow-hidden flex items-center justify-center">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* Interactive Nodes */}
          {SECTOR_NODES.map(node => {
            const isSelected = selectedNode.id === node.id;
            return (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node)}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-full transition group ${
                  isSelected
                    ? 'bg-cyan-500 shadow-[0_0_20px_rgba(0,240,255,0.8)] scale-125 z-20'
                    : 'bg-cyan-950/80 border border-cyan-400 hover:scale-110 z-10'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-black' : 'bg-cyan-400 animate-ping'}`} />
                <span className="absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-[10px] font-bold bg-black/80 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded shadow">
                  {node.grid}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Node Details Panel */}
        <div className="bg-black/70 border border-cyan-500/40 rounded-lg p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-400 font-bold">GRID LOCATION: {selectedNode.grid}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  selectedNode.threatLevel === 'CRITICAL'
                    ? 'bg-red-950/60 border-red-500 text-red-400'
                    : selectedNode.threatLevel === 'HIGH'
                    ? 'bg-yellow-950/60 border-yellow-500 text-yellow-400'
                    : 'bg-teal-950/60 border-teal-500 text-teal-300'
                }`}
              >
                {selectedNode.threatLevel}
              </span>
            </div>

            <h3 className="text-sm font-bold text-cyan-200">{selectedNode.name}</h3>

            <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded text-xs space-y-1">
              <span className="text-gray-400 text-[10px]">SECTOR CONTROL</span>
              <p className="text-teal-300 font-semibold">{selectedNode.control}</p>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">{selectedNode.description}</p>
          </div>

          <button className="w-full py-2 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 transition text-xs flex items-center justify-center space-x-2">
            <Navigation size={14} />
            <span>DEPLOY TACTICAL SQUAD</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center text-[11px] text-gray-500 border-t border-cyan-500/20 pt-2">
        <span className="flex items-center gap-1"><ShieldAlert size={12} className="text-cyan-400" /> ACTIVE RADAR SWEEP MATRIX</span>
        <span>SECTOR ZERO MAP SYSTEM</span>
      </div>
    </div>
  );
};
