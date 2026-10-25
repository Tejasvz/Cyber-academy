import React, { useEffect, useRef, useState } from 'react';
import { Compass, Play } from 'lucide-react';
import type { GameMission } from '../../game/gameData';

import { sound } from '../../utils/audioSynth';
import './TacticalRadarMap2D.css';

interface TacticalRadarMap2DProps {
  gameMissions: GameMission[];
  activeMissionId: string;
  completedMissionIds: Set<string>;
  onSelectMission: (mission: GameMission, deploy?: boolean) => void;
}

// 16 Mission node sector coordinates for the 2D radar grid (percentage coordinates)
const NODE_COORDINATES: Record<string, { x: number; y: number; sector: string; faction: string }> = {
  B01: { x: 22, y: 32, sector: 'SECTOR 00 // POWER RELAY', faction: 'RESISTANCE' },
  B02: { x: 30, y: 22, sector: 'SECTOR 00 // MEMORY ARCHIVE', faction: 'RESISTANCE' },
  B03: { x: 42, y: 28, sector: 'SECTOR 01 // PUBLIC EDGE', faction: 'SYNDICATE' },
  B04: { x: 48, y: 40, sector: 'SECTOR 01 // COMMAND HUB', faction: 'SYNDICATE' },
  B05: { x: 38, y: 55, sector: 'SECTOR 01 // OFFLINE VAULT', faction: 'SYNDICATE' },
  B06: { x: 25, y: 62, sector: 'SECTOR 01 // PORTAL GATE', faction: 'NEUTRAL' },
  B07: { x: 35, y: 78, sector: 'SECTOR 02 // MAIL QUEUE', faction: 'AETHER_CORP' },
  B08: { x: 50, y: 85, sector: 'SECTOR 02 // PRIME GATE', faction: 'AETHER_CORP' },
  A09: { x: 62, y: 76, sector: 'SECTOR 09 // STACK BLOCK', faction: 'VOID_CORE' },
  A10: { x: 74, y: 68, sector: 'SECTOR 09 // DATABASE CORE', faction: 'AETHER_CORP' },
  A11: { x: 82, y: 56, sector: 'SECTOR 09 // CRYPTO SPIRE', faction: 'AETHER_CORP' },
  A12: { x: 76, y: 44, sector: 'SECTOR 09 // STACK LAYER', faction: 'VOID_CORE' },
  A13: { x: 85, y: 34, sector: 'SECTOR 09 // ROOT NODE', faction: 'AETHER_CORP' },
  A14: { x: 72, y: 24, sector: 'SECTOR 09 // WEB GATE', faction: 'SYNDICATE' },
  A15: { x: 60, y: 20, sector: 'SECTOR 09 // TLS BRIDGE', faction: 'RESISTANCE' },
  A16: { x: 50, y: 50, sector: 'SECTOR CLIMAX // SHATTERED CORE', faction: 'GENESIS_CORE' },
};

export const TacticalRadarMap2D: React.FC<TacticalRadarMap2DProps> = ({
  gameMissions,
  activeMissionId,
  completedMissionIds,
  onSelectMission,
}) => {
  const [selectedNode, setSelectedNode] = useState<GameMission>(
    () => gameMissions.find((m) => m.id === activeMissionId) ?? gameMissions[0]
  );
  const [hoveredNode, setHoveredNode] = useState<GameMission | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Radar sweep animation on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      canvas.width = canvas.clientWidth || 800;
      canvas.height = canvas.clientHeight || 550;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(cx, cy) - 20;

      ctx.clearRect(0, 0, w, h);

      // Radar concentric distance rings
      ctx.strokeStyle = 'rgba(32, 214, 233, 0.15)';
      ctx.lineWidth = 1;
      [0.25, 0.5, 0.75, 1.0].forEach((r) => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius * r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Axis crosshairs
      ctx.strokeStyle = 'rgba(160, 82, 239, 0.15)';
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.stroke();

      // Rotating Radar Sweep Cone
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      const sweepGrad = ctx.createConicGradient(0, 0, 0);
      sweepGrad.addColorStop(0, 'rgba(32, 214, 233, 0.35)');
      sweepGrad.addColorStop(0.12, 'rgba(32, 214, 233, 0.05)');
      sweepGrad.addColorStop(0.25, 'rgba(0, 0, 0, 0)');
      sweepGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Sweep leading beam line
      ctx.strokeStyle = '#20d6e9';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#20d6e9';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(radius, 0);
      ctx.stroke();
      ctx.restore();

      angle += 0.015;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleNodeClick = (mission: GameMission) => {
    sound.playClick();
    setSelectedNode(mission);
    onSelectMission(mission, false);
  };

  return (
    <div className="tactical-radar-container">
      {/* 2D Canvas Radar Grid */}
      <div className="radar-viewport">
        <canvas ref={canvasRef} className="radar-canvas" />

        {/* Faction Territory Badges */}
        <div className="faction-overlay">
          <span className="faction-tag tl">RESISTANCE // SECTOR ZERO</span>
          <span className="faction-tag tr">AETHER CORP // VAULT NET</span>
          <span className="faction-tag bl">SYNDICATE // MESH ARRAY</span>
          <span className="faction-tag br">GENESIS CORE // VOID</span>
        </div>

        {/* Node Markers Placed on Radar */}
        {gameMissions.map((mission) => {
          const coords = NODE_COORDINATES[mission.id] ?? { x: 50, y: 50, sector: 'SECTOR ZERO', faction: 'UNKNOWN' };
          const isCompleted = completedMissionIds.has(mission.id);
          const isActive = mission.id === activeMissionId;
          const isSelected = mission.id === selectedNode.id;

          return (
            <button
              key={mission.id}
              onClick={() => handleNodeClick(mission)}
              onMouseEnter={() => setHoveredNode(mission)}
              onMouseLeave={() => setHoveredNode(null)}
              className={`radar-node-marker ${isCompleted ? 'completed' : isActive ? 'active' : 'locked'} ${
                isSelected ? 'selected' : ''
              }`}
              style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
              title={`${mission.id}: ${mission.title}`}
            >
              <div className="marker-beacon" />
              <div className="marker-core">
                <span>{mission.id}</span>
              </div>
              <span className="marker-label">{mission.title.replace('OPERATION ', '')}</span>
            </button>
          );
        })}

        {/* Hover Tooltip */}
        {hoveredNode && (
          <div
            className="radar-tooltip glass-panel"
            style={{
              left: `${(NODE_COORDINATES[hoveredNode.id]?.x ?? 50) + 3}%`,
              top: `${(NODE_COORDINATES[hoveredNode.id]?.y ?? 50) - 8}%`,
            }}
          >
            <b>{hoveredNode.id} // {hoveredNode.title}</b>
            <small>{hoveredNode.technique}</small>
            <span>{NODE_COORDINATES[hoveredNode.id]?.sector}</span>
          </div>
        )}
      </div>

      {/* Side Inspector Card */}
      <aside className="radar-inspector glass-panel">
        <header className="inspector-head">
          <Compass size={16} className="phosphor-cyan" />
          <span>{selectedNode.id} // SECTOR TELEMETRY</span>
        </header>

        <div className="inspector-content">
          <h2>{selectedNode.title}</h2>
          <p className="inspector-sector">{NODE_COORDINATES[selectedNode.id]?.sector}</p>
          <hr className="inspector-rule" />

          <p className="inspector-desc">{selectedNode.objective}</p>

          <dl className="inspector-meta-grid">
            <div>
              <dt>TECHNIQUE</dt>
              <dd>{selectedNode.technique}</dd>
            </div>
            <div>
              <dt>THREAT LEVEL</dt>
              <dd className={selectedNode.threat === 'CRITICAL' ? 'threat-crit' : ''}>{selectedNode.threat}</dd>
            </div>
            <div>
              <dt>FACTION CONTROL</dt>
              <dd>{NODE_COORDINATES[selectedNode.id]?.faction ?? 'NEUTRAL'}</dd>
            </div>
            <div>
              <dt>REWARD</dt>
              <dd>+{selectedNode.rewardXP} XP / +{selectedNode.rewardXP / 5} CREDITS</dd>
            </div>
          </dl>

          <div className="inspector-status-badge">
            STATUS:{' '}
            <b className={completedMissionIds.has(selectedNode.id) ? 'verified' : selectedNode.id === activeMissionId ? 'active' : 'pending'}>
              {completedMissionIds.has(selectedNode.id)
                ? 'VERIFIED / ARCHIVED'
                : selectedNode.id === activeMissionId
                ? 'CURRENT TARGET'
                : 'PENDING INVESTIGATION'}
            </b>
          </div>

          <button
            className="workspace-cta"
            onClick={() => onSelectMission(selectedNode, true)}
          >
            <Play size={13} style={{ display: 'inline', marginRight: '6px' }} />
            DEPLOY TO RANGE NOW →
          </button>
        </div>
      </aside>
    </div>
  );
};
