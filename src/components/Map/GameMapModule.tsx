import React, { useState } from 'react';
import { Compass, Globe, Radio } from 'lucide-react';
import type { GameMission } from '../../game/gameData';

import { NetworkTopology3D } from '../HUD/NetworkTopology3D';
import { TacticalRadarMap2D } from './TacticalRadarMap2D';
import { sound } from '../../utils/audioSynth';
import './GameMapModule.css';

interface GameMapModuleProps {
  gameMissions: GameMission[];
  activeMissionId: string;
  completedMissionIds: Set<string>;
  onSelectMission: (mission: GameMission, deploy?: boolean) => void;
}

export const GameMapModule: React.FC<GameMapModuleProps> = ({
  gameMissions,
  activeMissionId,
  completedMissionIds,
  onSelectMission,
}) => {
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');
  const [actFilter, setActFilter] = useState<'ALL' | 'ACT1' | 'ACT2'>('ALL');

  const filteredMissions = gameMissions.filter((m) => {
    if (actFilter === 'ACT1') return m.id.startsWith('B');
    if (actFilter === 'ACT2') return m.id.startsWith('A');
    return true;
  });

  const verifiedCount = gameMissions.filter((m) => completedMissionIds.has(m.id)).length;
  const activeMission = gameMissions.find((m) => m.id === activeMissionId) ?? gameMissions[0];

  const handleModeSwitch = (mode: '3D' | '2D') => {
    sound.playClick();
    setViewMode(mode);
  };

  const handleActSwitch = (act: 'ALL' | 'ACT1' | 'ACT2') => {
    sound.playClick();
    setActFilter(act);
  };

  return (
    <div className="game-map-module">
      {/* Top Map Toolbar */}
      <header className="map-toolbar glass-panel">
        <div className="map-toolbar-left">
          <div className="toolbar-title">
            <Compass size={18} className="phosphor-cyan" />
            <div>
              <h3>CYBER SECTOR MAP & GRID TOPOLOGY</h3>
              <small>AETHER SUBNET 10.10.0.0/16 // LIVE RADAR</small>
            </div>
          </div>

          <div className="map-mode-toggles">
            <button
              className={`mode-toggle-btn ${viewMode === '3D' ? 'active' : ''}`}
              onClick={() => handleModeSwitch('3D')}
            >
              <Globe size={13} /> 3D CONSTELLATION
            </button>
            <button
              className={`mode-toggle-btn ${viewMode === '2D' ? 'active' : ''}`}
              onClick={() => handleModeSwitch('2D')}
            >
              <Radio size={13} /> 2D TACTICAL RADAR
            </button>
          </div>
        </div>

        <div className="map-toolbar-right">
          <div className="act-filter-group">
            <button
              className={`act-btn ${actFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => handleActSwitch('ALL')}
            >
              ALL (16)
            </button>
            <button
              className={`act-btn ${actFilter === 'ACT1' ? 'active' : ''}`}
              onClick={() => handleActSwitch('ACT1')}
            >
              ACT I: SECTOR ZERO
            </button>
            <button
              className={`act-btn ${actFilter === 'ACT2' ? 'active' : ''}`}
              onClick={() => handleActSwitch('ACT2')}
            >
              ACT II: DEEP MEMORY
            </button>
          </div>

          <div className="map-summary-stat">
            <span>GRID VERIFIED</span>
            <b>{verifiedCount} / {gameMissions.length} NODES</b>
          </div>
        </div>
      </header>

      {/* Main Map View Area */}
      <div className="map-view-viewport">
        {viewMode === '3D' ? (
          <NetworkTopology3D
            gameMissions={filteredMissions}
            activeMissionId={activeMissionId}
            completedMissionIds={completedMissionIds}
            onSelectMission={onSelectMission}
          />
        ) : (
          <TacticalRadarMap2D
            gameMissions={filteredMissions}
            activeMissionId={activeMissionId}
            completedMissionIds={completedMissionIds}
            onSelectMission={onSelectMission}
          />
        )}
      </div>

      {/* Bottom Sector Telemetry Ticker */}
      <footer className="map-telemetry-ticker glass-panel">
        <div>
          <span>CURRENT DEPLOYMENT TARGET:</span>
          <b>{activeMission.id} // {activeMission.title}</b>
        </div>
        <div>
          <span>TACTICAL TECHNIQUE:</span>
          <b>{activeMission.technique}</b>
        </div>
        <div>
          <span>SECTOR THREAT LEVEL:</span>
          <b style={{ color: activeMission.threat === 'CRITICAL' ? '#ff3366' : '#20d6e9' }}>
            {activeMission.threat}
          </b>
        </div>
        <div>
          <span>CONTROLLER DAEMON:</span>
          <b>AURELIA_DAEMON_V2.6</b>
        </div>
      </footer>
    </div>
  );
};
