import React, { useMemo, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, CircleDot, Crosshair, Database, Eye, GitMerge, LockKeyhole, Radio, Settings, Shield, TerminalSquare, Zap } from 'lucide-react';
import type { IntelItem, Mission, NavTab, Operator } from '../../types';
import { sound } from '../../utils/audioSynth';
import './ViewTabOverlay.css';

interface ViewTabOverlayProps {
  activeTab: NavTab;
  intelList: IntelItem[];
  mission: Mission;
  operator: Operator;
  onClose: () => void;
  onOpenBriefing: () => void;
  onOpenTerminal: () => void;
  onLogout: () => void;
}

const tabs: Array<{ id: NavTab; label: string; icon: React.ElementType }> = [
  { id: 'MISSIONS', label: 'MISSIONS', icon: Crosshair },
  { id: 'INTEL', label: 'INTEL ARCHIVE', icon: Eye },
  { id: 'SKILL_TREE', label: 'NEURAL TREE', icon: GitMerge },
  { id: 'CONSPIRACY', label: 'AETHER MAP', icon: Database },
  { id: 'TERMINAL', label: 'TERMINAL', icon: TerminalSquare },
  { id: 'SETTINGS', label: 'CONFIG', icon: Settings },
];

const skillNodes = [
  { id: 's1', name: 'CIPHER SIGHT', detail: 'Expose weak encryption signatures.', cost: 0, x: 14, y: 45 },
  { id: 's2', name: 'PACKET GHOST', detail: 'Reduce trace accumulation by 18%.', cost: 0, x: 34, y: 25 },
  { id: 's3', name: 'NEURAL OVERCLOCK', detail: 'Faster analysis from Aurelia.', cost: 1, x: 34, y: 66 },
  { id: 's4', name: 'QUANTUM SHIELD', detail: 'Absorb one critical system alert.', cost: 2, x: 57, y: 24 },
  { id: 's5', name: 'DEEP SCAN', detail: 'Reveal classified intel fragments.', cost: 2, x: 57, y: 66 },
  { id: 's6', name: 'AETHER SYMBIOSIS', detail: 'Unlock shared handler protocols.', cost: 3, x: 80, y: 45 },
];

export const ViewTabOverlay: React.FC<ViewTabOverlayProps> = ({ activeTab, intelList, mission, operator, onClose, onOpenBriefing, onOpenTerminal, onLogout }) => {
  const [view, setView] = useState<NavTab>(activeTab);
  const [selectedIntelId, setSelectedIntelId] = useState(intelList[0]?.id ?? '');
  const [unlockedSkills, setUnlockedSkills] = useState(['s1', 's2']);
  const [selectedSkill, setSelectedSkill] = useState('s1');
  const [skillPoints, setSkillPoints] = useState(4);
  const [selectedNode, setSelectedNode] = useState('GRID_4B');
  const [settings, setSettings] = useState({ synth: true, voice: true, scanlines: true, reducedMotion: false });
  const selectedIntel = intelList.find((item) => item.id === selectedIntelId) ?? intelList[0];
  const selectedSkillData = skillNodes.find((node) => node.id === selectedSkill) ?? skillNodes[0];
  const title = useMemo(() => tabs.find((tab) => tab.id === view)?.label ?? 'WORKSPACE', [view]);

  const unlockSkill = () => {
    if (unlockedSkills.includes(selectedSkillData.id) || skillPoints < selectedSkillData.cost) return;
    sound.playAureliaPulse();
    setUnlockedSkills((current) => [...current, selectedSkillData.id]);
    setSkillPoints((current) => current - selectedSkillData.cost);
  };

  const renderWorkspace = () => {
    if (view === 'MISSIONS') return (
      <div className="workspace-grid missions-workspace">
        <section className="workspace-panel primary-mission-card">
          <div className="mission-watermark"><Shield /></div><span className="workspace-kicker">ACTIVE OPERATION // B01</span>
          <h1>{mission.title}</h1><p className="mission-subtitle">{mission.subtitle.replaceAll(' / ', ' · ')}</p>
          <div className="mission-meter"><i><b style={{ width: `${mission.progress}%` }} /></i><strong>{mission.progress}%</strong></div>
          <dl className="mission-facts"><div><dt>OBJECTIVE</dt><dd>{mission.objective}</dd></div><div><dt>ENVIRONMENT</dt><dd>{mission.location}</dd></div><div><dt>THREAT INDEX</dt><dd className="danger">{mission.threatLevel}</dd></div><div><dt>REWARD</dt><dd className="success">+{mission.rewardXP} XP</dd></div></dl>
          <button className="workspace-cta" onClick={onOpenBriefing}>OPEN MISSION BRIEFING <ChevronRight /></button>
        </section>
        <section className="workspace-panel operation-queue"><WorkspaceHeader eyebrow="DEPLOYMENT QUEUE" status="3 OPERATIONS" />
          {[
            ['GHOST CIRCUIT', 'Trace a rogue signal through abandoned relay nodes.', 'AVAILABLE', 'LOW'],
            ['SILENT ORBIT', 'Recover a damaged Aether memory partition.', 'LOCKED', 'MEDIUM'],
            ['MIRROR FALL', 'Identify the entity mimicking handler traffic.', 'CLASSIFIED', 'CRITICAL'],
          ].map(([name, copy, state, risk], index) => <article className="queue-item" key={name}><b>0{index + 2}</b><div><h3>{name}</h3><p>{copy}</p></div><span className={state === 'AVAILABLE' ? 'success' : ''}>{state}<small>{risk} RISK</small></span></article>)}
        </section>
        <section className="workspace-panel handler-note"><WorkspaceHeader eyebrow="HANDLER ASSESSMENT" status="AURELIA // LIVE" /><blockquote>“The outage is a symptom, Fragment. Something inside Sector Zero learned how to hide from me. I need your instincts where my sensors fail.”</blockquote></section>
      </div>
    );

    if (view === 'INTEL') return (
      <div className="workspace-grid intel-workspace">
        <section className="workspace-panel intel-index"><WorkspaceHeader eyebrow="DECRYPTED RECORDS" status={`${intelList.length} FILES`} />{intelList.map((item) => <button key={item.id} className={selectedIntel?.id === item.id ? 'active' : ''} onClick={() => setSelectedIntelId(item.id)}><span>{String(item.number).padStart(2, '0')}</span><div><b>{item.title}</b><small>{item.subtitle}</small></div><i>{item.classification}</i></button>)}</section>
        <section className="workspace-panel intel-reader"><div className="intel-reader-head"><span>FILE // {selectedIntel?.id.toUpperCase()}</span><b>{selectedIntel?.classification}</b></div><div className="intel-schematic"><div className="schematic-orbit" /><Shield /><span>NODE 4B</span></div><h1>{selectedIntel?.title}</h1><p className="intel-copy">{selectedIntel?.content}</p><footer><span>CAPTURED {selectedIntel?.date}</span><span>HASH 7E3A-99F2-0C4D</span><span className="success">DECRYPTED</span></footer></section>
      </div>
    );

    if (view === 'SKILL_TREE') return (
      <div className="workspace-grid skill-workspace">
        <section className="workspace-panel skill-map"><div className="skill-map-meta"><span>NEURAL CAPACITY</span><b>{skillPoints} POINTS AVAILABLE</b></div><svg className="skill-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M14 45 L34 25 L57 24 L80 45 M14 45 L34 66 L57 66 L80 45 M34 25 L57 66 M34 66 L57 24" /></svg>{skillNodes.map((node) => { const unlocked = unlockedSkills.includes(node.id); return <button key={node.id} style={{ left: `${node.x}%`, top: `${node.y}%` }} className={`skill-node ${unlocked ? 'unlocked' : ''} ${selectedSkill === node.id ? 'selected' : ''}`} onClick={() => setSelectedSkill(node.id)}><span>{unlocked ? <Check /> : <LockKeyhole />}</span><small>{node.name}</small></button>; })}</section>
        <section className="workspace-panel skill-detail"><span className="workspace-kicker">NEURAL AUGMENT // {selectedSkillData.id.toUpperCase()}</span><h1>{selectedSkillData.name}</h1><p>{selectedSkillData.detail}</p><dl><div><dt>COST</dt><dd>{selectedSkillData.cost || 'CORE'} POINTS</dd></div><div><dt>STATE</dt><dd className={unlockedSkills.includes(selectedSkillData.id) ? 'success' : ''}>{unlockedSkills.includes(selectedSkillData.id) ? 'SYNCHRONIZED' : 'DORMANT'}</dd></div></dl><button className="workspace-cta" disabled={unlockedSkills.includes(selectedSkillData.id) || skillPoints < selectedSkillData.cost} onClick={unlockSkill}>{unlockedSkills.includes(selectedSkillData.id) ? 'NODE ONLINE' : 'SYNCHRONIZE NODE'} <Zap /></button></section>
      </div>
    );

    if (view === 'CONSPIRACY') {
      const nodes = [
        { id: 'GRID_4B', label: 'GRID NODE 4B', x: 18, y: 25, copy: 'Initial cascade origin. Three telemetry frames are missing.' },
        { id: 'MIRROR', label: 'MIRROR SIGNAL', x: 53, y: 18, copy: 'A signal carrying Aurelia’s own cryptographic signature.' },
        { id: 'AURELIA', label: 'AURELIA CORE', x: 76, y: 47, copy: 'Handler memory partition accessed 11 seconds before failure.' },
        { id: 'GHOST', label: 'GHOST OPERATOR', x: 42, y: 71, copy: 'Unknown operator credentials accepted by a retired node.' },
        { id: 'VOID', label: 'VOID GATE', x: 12, y: 73, copy: 'No physical record. Appears in every corrupted log.' },
      ];
      const active = nodes.find((node) => node.id === selectedNode) ?? nodes[0];
      return <div className="workspace-grid conspiracy-workspace"><section className="workspace-panel evidence-map"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M18 25 L53 18 L76 47 L42 71 L12 73 Z M18 25 L42 71 M53 18 L42 71 M12 73 L76 47" /></svg>{nodes.map((node) => <button key={node.id} style={{ left: `${node.x}%`, top: `${node.y}%` }} className={selectedNode === node.id ? 'active' : ''} onClick={() => setSelectedNode(node.id)}><CircleDot /><span>{node.label}</span></button>)}</section><section className="workspace-panel evidence-detail"><WorkspaceHeader eyebrow="CORRELATION NODE" status="LIVE ANALYSIS" /><Radio className="evidence-pulse" /><h1>{active.label}</h1><p>{active.copy}</p><dl><div><dt>CONFIDENCE</dt><dd>87%</dd></div><div><dt>LINKS</dt><dd>04 ACTIVE</dd></div><div><dt>ACCESS</dt><dd className="danger">RESTRICTED</dd></div></dl><div className="aurelia-whisper">AURELIA: “Some memories feel like mine. That does not mean they belong to me.”</div></section></div>;
    }

    if (view === 'TERMINAL') return <div className="workspace-grid terminal-workspace"><section className="workspace-panel terminal-preview"><WorkspaceHeader eyebrow="AETHER SHELL" status="ENCRYPTED TUNNEL ACTIVE" /><div className="terminal-transcript"><span>operator@veil:~$ <b>trace --origin GRID_4B</b></span><p>Routing through sector-zero relay...</p><p>3 nodes resolved. 1 signature masked.</p><span>operator@veil:~$ <b>inspect --signal MIRROR</b></span><p className="danger">ACCESS REQUIRES DIRECT NEURAL LINK.</p><span className="cursor-line">operator@veil:~$ <i /></span></div></section><section className="workspace-panel terminal-launch"><TerminalSquare /><span className="workspace-kicker">FULL SCREEN MODULE</span><h1>SECURE TERMINAL</h1><p>Open the operational shell to execute training commands, inspect files, and submit mission flags.</p><button className="workspace-cta" onClick={onOpenTerminal}>MAXIMIZE TERMINAL <ChevronRight /></button></section></div>;

    return <div className="workspace-grid config-workspace"><section className="workspace-panel config-panel"><WorkspaceHeader eyebrow="SENSORY INTERFACE" status="LOCAL PROFILE" />{(Object.keys(settings) as Array<keyof typeof settings>).map((key) => <button key={key} onClick={() => { sound.playClick(); setSettings((current) => ({ ...current, [key]: !current[key] })); }}><div><b>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</b><small>{settingDescription(key)}</small></div><span className={settings[key] ? 'on' : ''}><i /></span></button>)}</section><section className="workspace-panel identity-panel"><WorkspaceHeader eyebrow="OPERATOR LINK" status="VERIFIED" /><div className="identity-sigil"><Shield /></div><h1>{operator.name.toUpperCase()}</h1><p>{operator.callsign}</p><dl><div><dt>CLEARANCE</dt><dd>{operator.clearance}</dd></div><div><dt>TRUST</dt><dd>{operator.trustLevel}%</dd></div><div><dt>NEURAL LEVEL</dt><dd>{operator.level}</dd></div></dl><button className="workspace-cta" onClick={onLogout}>END SECURE SESSION</button></section></div>;
  };

  return <div className="veil-workspace-overlay" role="dialog" aria-modal="true" aria-label={`${title} workspace`}><header className="workspace-topbar"><button className="workspace-brand" onClick={onClose}><BrandMark /><span><strong>PROJECT VEIL</strong><small>AETHER PROTOCOL INTERFACE</small></span></button><div><b>{title}</b><span>SEC_ZERO_POD // V2.6</span></div><div className="workspace-operator"><span>OPERATOR: <b>{operator.name.toUpperCase()}</b></span><span>TRUST LEVEL: {operator.trustLevel}%</span></div></header><aside className="workspace-rail">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? 'active' : ''} onClick={() => setView(id)}><Icon /><span>{label}</span></button>)}<button className="workspace-return" onClick={onClose}><ArrowLeft /><span>COMMAND DECK</span></button></aside><main className="workspace-main"><div className="workspace-title"><div><span>PROJECT VEIL // SECURE WORKSPACE</span><h2>{title}</h2></div><div><i /> LIVE DATASTREAM</div></div>{renderWorkspace()}</main><footer className="workspace-footer"><span>LINK: STABLE</span><span>ENCRYPTION: AETHER-256</span><span>SESSION NODE: 7G23-XQ9P</span><b>SECURE CHANNEL <i /></b></footer></div>;
};

const WorkspaceHeader: React.FC<{ eyebrow: string; status: string }> = ({ eyebrow, status }) => <header className="workspace-panel-head"><span>{eyebrow}</span><b>{status}</b></header>;
const BrandMark = () => <svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M32 7 57 53H7L32 7Z" /><path d="m32 18 14 27H18l14-27ZM32 18v27M18 45l14-10 14 10" /></svg>;
const settingDescription = (key: string) => ({ synth: 'Interface clicks and operational feedback.', voice: 'Allow Aurelia to speak responses aloud.', scanlines: 'Analog holographic display texture.', reducedMotion: 'Reduce parallax and ambient movement.' }[key] ?? 'Local interface preference.');
