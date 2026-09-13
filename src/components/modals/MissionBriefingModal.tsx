import React, { useState } from 'react';
import { Clock, Crosshair, ShieldAlert, Terminal, X, Zap } from 'lucide-react';
import type { Mission, Operator } from '../../types';
import type { GameMission } from '../../game/gameData';
import { AureliaHologram3D } from '../AI/AureliaHologram3D';
import { sound } from '../../utils/audioSynth';
import './MissionBriefingModal.css';

interface MissionBriefingModalProps {
  mission: Mission;
  operator: Operator;
  gameMission: GameMission;
  completed: boolean;
  onClose: () => void;
  onDeploy: () => void;
}

const comms = [
  { name: 'HESPER', avatar: '/assets/portraits/hesper.png', text: "We're seeing cascading failures. Stay sharp.", time: '12:45 UTC' },
  { name: 'KAELEN', avatar: '/assets/portraits/kaelen.png', text: 'Or what? Another lecture from your perfect boy scout?', time: '12:46 UTC' },
  { name: 'AURELIA', avatar: '/assets/portraits/aurelia.png', text: 'Kaelen, not now. This is not the time.', time: '12:46 UTC' },
];

export const MissionBriefingModal: React.FC<MissionBriefingModalProps> = ({ mission, operator, gameMission, completed, onClose, onDeploy }) => {
  const [overrideExecuted, setOverrideExecuted] = useState(false);

  const deploy = () => {
    sound.playAureliaPulse();
    setOverrideExecuted(true);
    onDeploy();
  };

  return (
    <section className="briefing-screen" aria-label="Mission briefing">
      <header className="briefing-header">
        <div className="briefing-brand"><DeckMark /><span><strong>PROJECT VEIL</strong><small>AETHER PROTOCOL INTERFACE</small></span></div>
        <div className="briefing-mode"><b>BRIEFING</b><span>MISSION INITIATION</span></div>
        <div className="briefing-system"><b>SEC_ZERO_POD // V2.6</b><span>Secure Command Grid Online</span></div>
        <div className="briefing-operator">OPERATOR: <b>{operator.name.toUpperCase()}</b><br />CLEARANCE: {operator.clearance}<br />TRUST LEVEL: {operator.trustLevel}%</div>
        <button className="briefing-close" onClick={onClose} aria-label="Close briefing"><X /></button>
      </header>

      <aside className="briefing-nav">
        <button className="active"><Crosshair />BRIEFING</button><button><Terminal />TERMINAL</button><button><Zap />MISSIONS</button><button><ShieldAlert />INTEL</button><button><DatabaseMark />DATABASE</button><button><UserMark />OPERATOR</button><button><ShieldAlert />UPGRADES</button><button onClick={onClose}><X />CONFIG</button>
        <div className="briefing-side-status"><span>SYSTEM STATUS</span><i /><b>NOMINAL</b><small>All systems operational <em /></small></div>
      </aside>

      <main className="briefing-content">
        <header className="briefing-title"><h1>MISSION BRIEFING</h1><p>Review your objectives, threats, and mission intel.</p></header>
        <div className="briefing-grid">
          <section className="briefing-panel briefing-hero-card">
            <div className="briefing-portrait"><AureliaHologram3D expression="neutral" isSpeaking={false} onInteract={() => sound.playAureliaPulse()} /></div>
            <div className="briefing-mission-copy"><span>OPERATION</span><h2>{mission.title.replace('OPERATION ', '')}</h2><p>{mission.subtitle.replaceAll(' / ', ' in ')}</p><hr /><b>OBJECTIVE</b><p>{mission.objective}</p><div className="briefing-metrics"><span><small>EST. TIME</small><Clock /> 20 – 30 min</span><span><small>DIFFICULTY</small>▮▮▮▯▯ Low</span><span><small>REWARD</small><em>+{mission.rewardXP} XP</em></span></div></div>
            <div className="briefing-tier">BEGINNER TIER / {gameMission.id}</div>
          </section>

          <section className="briefing-panel handler-card"><div><b>HANDLER AURELIA</b><Waveform /></div><p>{gameMission.briefing}</p><button onClick={() => sound.playAureliaPulse()}>•••</button></section>

          <section className="briefing-panel preparation-card"><header><h2>MISSION PREPARATION</h2><p>{gameMission.theory}</p></header><div className="preparation-body"><div className="prep-box"><Terminal /><span>OBJECTIVES<small>{gameMission.objectives.length} ACTIVE</small></span></div><div className="prep-box"><Crosshair /><span>THREAT<small>{gameMission.threat}</small></span></div><div className="prep-box"><Zap /><span>REWARD<small>+{gameMission.rewardXP} XP</small></span></div><div className="recommended-tools"><b>OBJECTIVE CHAIN</b>{gameMission.objectives.slice(0, 3).map((objective) => <span key={objective.label}>✓ {objective.label} <em>↗</em></span>)}</div><button disabled={overrideExecuted} onClick={deploy}>{completed ? '≫ REPLAY MISSION' : overrideExecuted ? 'RANGE INITIALIZED' : '≫ DEPLOY TO MISSION'}</button></div></section>

          <section className="briefing-panel overview-card"><h2>MISSION OVERVIEW</h2><OverviewRow label="TECHNIQUE" value={gameMission.technique} /><OverviewRow label="ENVIRONMENT" value={gameMission.subtitle} /><OverviewRow label="TARGET SYSTEM" value={gameMission.id} /><OverviewRow label="ACCESS LEVEL" value="OPERATOR" /><OverviewRow label="DETECTION RISK" value={gameMission.threat} tone={gameMission.threat === 'LOW' ? 'green' : 'yellow'} /><OverviewRow label="STATUS" value={completed ? 'COMPLETE' : 'ACTIVE'} tone={completed ? 'green' : 'yellow'} /></section>

          <section className="briefing-panel threat-card"><h2>THREAT ASSESSMENT</h2><ThreatRow label="Simulation" value="Isolated" tone="green" /><ThreatRow label="Objective Chain" value={`${gameMission.objectives.length} steps`} tone="green" /><ThreatRow label="Guidance" value="Available" tone="green" /><ThreatRow label="Complexity" value={gameMission.threat} tone="yellow" /><footer>◎ Overall Risk <b>{gameMission.threat}</b></footer></section>

          <section className="briefing-panel briefing-comms"><header><b>▥ AETHER COMM FEED</b><span>● LIVE</span></header>{comms.map((item) => <article key={item.name}><img src={item.avatar} alt="" /><div><b>// {item.name}</b><p>{item.text}</p></div><time>{item.time}</time></article>)}<button>View full feed <span>→</span></button></section>

          <section className="briefing-panel briefing-operator-card"><h2>OPERATOR STATUS</h2><div className="operator-wheel"><b>{operator.level}</b><span>LEVEL</span></div><div className="briefing-xp"><span>XP <b>{operator.xpCurrent.toLocaleString()} / {operator.xpNext.toLocaleString()}</b></span><i><em style={{ width: `${Math.min(100, operator.xpCurrent / operator.xpNext * 100)}%` }} /></i><span>NEXT LEVEL REWARD<br /><b>+1 Loadout Slot</b></span><span>BADGE PROGRESS <b>{operator.badges.filter((badge) => badge.unlocked).length}/{operator.badges.length} Earned</b></span><i><em className="short" /></i></div></section>
        </div>
      </main>

      <footer className="briefing-footer"><Metric label="NETWORK STATUS" value="STABLE" width="64%" /><Metric label="VEIL INTEGRITY" value="78%" width="78%" /><Metric label="THREAT LEVEL" value="ELEVATED" width="60%" danger /><Metric label="DATA FLOW" value="NORMAL" width="85%" /><aside>◎ <span><b>TIP OF THE DAY</b><br />Use ‘grep’ to quickly search for keywords in large capture files.</span></aside></footer>
    </section>
  );
};

const DeckMark: React.FC = () => <svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M32 7 57 53H7L32 7Z" /><path d="m32 18 14 27H18l14-27ZM32 18v27M18 45l14-10 14 10" /></svg>;
const Waveform: React.FC = () => <span className="briefing-wave">{Array.from({ length: 28 }).map((_, index) => <i key={index} />)}</span>;
const DatabaseMark: React.FC = () => <svg viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" /></svg>;
const UserMark: React.FC = () => <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.6-4.1 4.3-6.1 8-6.1s6.4 2 8 6.1" /></svg>;
const OverviewRow: React.FC<{ label: string; value: string; tone?: string }> = ({ label, value, tone }) => <div className="overview-row"><span>◇</span><p><small>{label}</small><b className={tone}>{value}</b></p></div>;
const ThreatRow: React.FC<{ label: string; value: string; tone: string }> = ({ label, value, tone }) => <div className="threat-row"><span>{label}</span><b className={tone}>{value}</b><i><em /></i></div>;
const Metric: React.FC<{ label: string; value: string; width: string; danger?: boolean }> = ({ label, value, width, danger }) => <div className={danger ? 'footer-metric danger' : 'footer-metric'}><span>{label}<b>{value}</b></span><i><em style={{ width }} /></i></div>;
