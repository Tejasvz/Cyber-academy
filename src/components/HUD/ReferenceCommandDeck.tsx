import React, { useEffect, useRef, useState } from 'react';
import {
  Crosshair,
  Database,
  Eye,
  GitMerge,
  Radio,
  Send,
  Settings,
  Shield,
  UserRound,
  X,
} from 'lucide-react';
import type { AINotification, IntelItem, Mission, NavTab, Operator, SystemHealth } from '../../types';
import './ReferenceCommandDeck.css';

interface ReferenceCommandDeckProps {
  activeTab: NavTab;
  aureliaMood: 'neutral' | 'thinking' | 'speaking' | 'alert' | 'pleased';
  dialogueText: string;
  health: SystemHealth;
  intelList: IntelItem[];
  isSpeaking: boolean;
  mission: Mission;
  notifications: AINotification[];
  operator: Operator;
  secureChannelActive: boolean;
  onBeginMission: () => void;
  onOpenDiagnostics: () => void;
  onOpenIntelDatabase: () => void;
  onOpenMissionBriefing: () => void;
  onOpenOperatorProfile: () => void;
  onOpenTerminal: () => void;
  onSelectTab: (tab: NavTab) => void;
  onSendMessage: (message: string) => void;
  onTerminalCommand: (command: string) => void;
  onToggleSecureChannel: () => void;
}

const navigation: Array<{ icon: React.ElementType; label: string; tab: NavTab }> = [
  { icon: Shield, label: 'DASHBOARD', tab: 'DASHBOARD' },
  { icon: Crosshair, label: 'MISSIONS', tab: 'MISSIONS' },
  { icon: Eye, label: 'INTEL', tab: 'INTEL' },
  { icon: Database, label: 'SANDBOX', tab: 'CONSPIRACY' },
  { icon: GitMerge, label: 'SKILL TREE', tab: 'SKILL_TREE' },
  { icon: Database, label: 'DATABASE', tab: 'INTEL' },
  { icon: Radio, label: 'UPGRADES', tab: 'CONSPIRACY' },
  { icon: Settings, label: 'CONFIG', tab: 'SETTINGS' },
];

const terminalSeed = [
  { tone: 'prompt', text: 'operator@veil:~$ connect sector-zero' },
  { tone: 'muted', text: 'Establishing secure link...' },
  { tone: 'success', text: 'Connected.' },
  { tone: 'prompt', text: 'operator@sector-zero:~$ ls' },
  { tone: 'plain', text: 'substation_logs/  firewall.conf  nodes/' },
  { tone: 'prompt', text: 'operator@sector-zero:~$ cat firewall.conf' },
  { tone: 'plain', text: '<RESTRICTED>' },
  { tone: 'prompt', text: 'operator@sector-zero:~$ override --port 443' },
  { tone: 'danger', text: 'Access Denied.' },
];

const formatClock = () => {
  const date = new Date();
  return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}:${String(date.getUTCSeconds()).padStart(2, '0')} UTC`;
};

export const ReferenceCommandDeck: React.FC<ReferenceCommandDeckProps> = ({
  activeTab,
  aureliaMood,
  dialogueText,
  health,
  intelList,
  isSpeaking,
  mission,
  notifications,
  operator,
  secureChannelActive,
  onBeginMission,
  onOpenDiagnostics,
  onOpenIntelDatabase,
  onOpenMissionBriefing,
  onOpenOperatorProfile,
  onOpenTerminal,
  onSelectTab,
  onSendMessage,
  onTerminalCommand,
  onToggleSecureChannel,
}) => {
  const [clock, setClock] = useState(formatClock);
  const [composeOpen, setComposeOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLines, setTerminalLines] = useState(terminalSeed);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const hologramRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(formatClock()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let blinkTimer = 0;
    let reopenTimer = 0;
    const scheduleBlink = () => {
      blinkTimer = window.setTimeout(() => {
        setIsBlinking(true);
        reopenTimer = window.setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 130);
      }, 2600 + Math.random() * 4200);
    };
    scheduleBlink();
    return () => {
      window.clearTimeout(blinkTimer);
      window.clearTimeout(reopenTimer);
    };
  }, []);

  const trackAureliaGaze = (event: React.PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    event.currentTarget.style.setProperty('--look-x', `${x * 10}px`);
    event.currentTarget.style.setProperty('--look-y', `${y * 6}px`);
    event.currentTarget.style.setProperty('--turn', `${x * 1.3}deg`);
    setIsWatching(true);
  };

  const releaseAureliaGaze = () => {
    const hologram = hologramRef.current;
    if (hologram) {
      hologram.style.setProperty('--look-x', '0px');
      hologram.style.setProperty('--look-y', '0px');
      hologram.style.setProperty('--turn', '0deg');
    }
    setIsWatching(false);
  };

  const submitTerminal = (event: React.FormEvent) => {
    event.preventDefault();
    const command = terminalInput.trim();
    if (!command) return;
    const isOverride = command.toLowerCase().startsWith('override');
    setTerminalLines((lines) => [
      ...lines,
      { tone: 'prompt', text: `operator@sector-zero:~$ ${command}` },
      { tone: isOverride ? 'success' : 'muted', text: isOverride ? 'Override signal dispatched.' : 'Command accepted.' },
    ]);
    setTerminalInput('');
    onTerminalCommand(command);
  };

  const submitMessage = (event: React.FormEvent) => {
    event.preventDefault();
    const outgoing = message.trim();
    if (!outgoing) return;
    onSendMessage(outgoing);
    setMessage('');
    setComposeOpen(false);
  };

  return (
    <section className="command-deck" aria-label="Project Veil command deck">
      <div className="deck-atmosphere" aria-hidden="true" />
      <div className="deck-scanlines" aria-hidden="true" />

      <header className="deck-header">
        <button className="deck-brand" onClick={() => onSelectTab('DASHBOARD')} aria-label="Open Project Veil dashboard">
          <DeckMark />
          <span><strong>PROJECT VEIL</strong><small>AETHER PROTOCOL INTERFACE</small></span>
        </button>
        <div className="deck-session"><b>CYBER OS v2.1.7</b><span>//</span><span>SECURE SESSION ACTIVE</span></div>
        <div className="deck-header-meta"><span>{clock}</span><span>SAT 27.07.2025</span><button onClick={onToggleSecureChannel}>SECURE CHANNEL <i className={secureChannelActive ? 'is-secure' : ''} /></button></div>
      </header>

      <aside className="deck-sidebar" aria-label="Primary navigation">
        {navigation.map(({ icon: Icon, label, tab }, index) => (
          <button key={`${label}-${index}`} className={activeTab === tab ? 'active' : ''} onClick={() => label === 'DASHBOARD' ? onSelectTab('DASHBOARD') : onSelectTab(tab)}>
            <Icon /><small>{label}</small>
          </button>
        ))}
      </aside>

      <main className="deck-workspace">
        <section className="deck-panel mission-panel">
          <DeckPanelHeader title="CURRENT MISSION" onClose={onOpenMissionBriefing} accent="violet" />
          <button className="mission-content" onClick={onOpenMissionBriefing}>
            <div className="mission-copy"><h1>{mission.title}</h1><p>{mission.subtitle.replaceAll(' / ', '\n')}</p></div>
            <div className="mission-graphic"><Shield /><i /><i /><i /></div>
            <div className="mission-rule" />
            <h2>OBJECTIVE</h2><p className="mission-objective">{mission.objective}</p>
            <div className="mission-progress"><div><span>PROGRESS</span><b>{mission.progress}%</b></div><i><em style={{ width: `${mission.progress}%` }} /></i></div>
            <span className="panel-action">OPEN MISSION BRIEFING <b>→</b></span>
          </button>
        </section>

        <section className="deck-panel operator-panel">
          <DeckPanelHeader title="OPERATOR STATUS" onClose={onOpenOperatorProfile} />
          <div className="operator-body">
            <div className="operator-ident"><span className="operator-mark"><UserRound /></span><p>OPERATOR: <b>{operator.name.toUpperCase()}</b><br />CLEARANCE: <em>{operator.clearance}</em><br />TRUST LEVEL: {operator.trustLevel}%</p></div>
            <div className="operator-level"><span>LEVEL<b>{operator.level}</b></span><div><p>XP <small>{operator.xpCurrent.toLocaleString()} / {operator.xpNext.toLocaleString()}</small></p><i><em style={{ width: `${Math.min(100, operator.xpCurrent / operator.xpNext * 100)}%` }} /></i></div></div>
            <p className="badges-label">BADGES</p><div className="badge-row">{operator.badges.slice(0, 5).map((badge) => <span key={badge.id} className={badge.unlocked ? 'unlocked' : ''}><Shield /></span>)}</div>
            <button onClick={onOpenOperatorProfile} className="panel-action profile-action">VIEW PROFILE <b>→</b></button>
          </div>
        </section>

        <section className="deck-panel terminal-panel">
          <DeckPanelHeader title="TERMINAL CONSOLE" onClose={onOpenTerminal} />
          <div className="terminal-body"><div className="terminal-scroll">{terminalLines.map((line, index) => <p key={`${line.text}-${index}`} className={`terminal-${line.tone}`}>{line.text}</p>)}</div><form onSubmit={submitTerminal} className="terminal-input-row"><span>operator@sector-zero:~$</span><input aria-label="Terminal command" value={terminalInput} onChange={(event) => setTerminalInput(event.target.value)} autoComplete="off" /></form></div>
          <footer className="terminal-toolbar"><button onClick={() => setTerminalLines([])}>CLEAR</button><span /><button onClick={() => setTerminalInput('help')}>HISTORY</button><button onClick={onOpenTerminal}>MAXIMIZE</button></footer>
        </section>

        <section ref={hologramRef} className={`deck-hologram is-${aureliaMood} ${isWatching ? 'is-watching' : ''}`} aria-label={`Aurelia holographic intelligence, ${aureliaMood}`} onPointerMove={trackAureliaGaze} onPointerLeave={releaseAureliaGaze} onClick={() => onSendMessage('You have my attention, Aurelia. Talk to me.')}>
          <div className="holo-spark-field" /><div className="holo-glitch holo-glitch-one" /><div className="holo-glitch holo-glitch-two" />
          <div className="holo-portrait-wrap"><img src={portraitForMood(aureliaMood)} alt={`Aurelia hologram — ${aureliaMood} state`} className={isSpeaking ? 'is-speaking' : ''} /><span className={`holo-blink ${isBlinking ? 'active' : ''}`} /></div>
          <div className="holo-presence-state"><i /> {isWatching ? 'VISUAL CONTACT ESTABLISHED' : 'AURELIA // PRESENT'}</div>
          <button className="holo-emitter" onClick={(event) => { event.stopPropagation(); onSendMessage('Status report, Aurelia.'); }} aria-label="Request status report from Aurelia" title="Ask Aurelia for a live status report"><span /><span /><span /></button>
        </section>

        <section className="deck-panel notifications-panel">
          <DeckPanelHeader title="AI NOTIFICATIONS" count={notifications.filter((item) => !item.read).length} accent="violet" />
          <div className="notification-list">{notifications.slice(0, 3).map((item) => <article key={item.id}><span className={`notification-icon ${item.type}`}><Radio /></span><div><h2>{item.title}</h2><p>{item.description}</p></div><time>{item.timestamp}</time></article>)}</div>
          <button className="panel-action notification-action" onClick={() => onSelectTab('INTEL')}>VIEW ALL NOTIFICATIONS <b>→</b></button>
        </section>

        <section className="deck-panel integrity-panel">
          <DeckPanelHeader title="SYSTEM INTEGRITY" />
          <div className="integrity-body"><div className="integrity-gauge" style={{ '--integrity': `${health.overall * 3.6}deg` } as React.CSSProperties}><b>{health.overall}%</b><span>OVERALL</span></div><StatusBar label="CORE SYSTEMS" tone="cyan" value={health.coreSystems} /><StatusBar label="NETWORK STABILITY" tone="violet" value={health.networkStability} /><StatusBar label="AI RELIABILITY" tone="cyan" value={health.aiReliability} /><div className="secure-row"><span>SECURE CHANNEL</span><b className={secureChannelActive ? 'on' : ''}>{secureChannelActive ? 'ACTIVE' : 'INACTIVE'} <i /></b></div></div>
          <button className="panel-action diagnostics-action" onClick={onOpenDiagnostics}>RUN SYSTEM DIAGNOSTICS <b>→</b></button>
        </section>

        <section className="deck-panel intel-panel">
          <DeckPanelHeader title="RECENT INTEL" />
          <div className="intel-list">{intelList.slice(0, 3).map((item) => <button key={item.id} onClick={onOpenIntelDatabase}><span className="intel-visual" /><b>{item.number}</b><div><h2>{item.title}</h2><p>{item.subtitle}<br />{item.date}</p></div></button>)}</div>
          <button className="panel-action intel-action" onClick={onOpenIntelDatabase}>VIEW INTEL DATABASE <b>→</b></button>
        </section>

        <section className="deck-panel secure-panel">
          <DeckPanelHeader title="SECURE CHANNEL" />
          <div className="secure-body"><div className="secure-emblem"><DeckMark /></div><dl><div><dt>CHANNEL ID</dt><dd>AETHER-7G23-XQ9P</dd></div><div><dt>ENCRYPTION</dt><dd>AES-256 / QUANTUM RESISTANT</dd></div><div><dt>STATUS</dt><dd className={secureChannelActive ? 'connected' : ''}>{secureChannelActive ? 'SECURE' : 'UNSECURED'} <i /></dd></div></dl></div>
          <button className="disconnect-button" onClick={onToggleSecureChannel}>{secureChannelActive ? 'DISCONNECT' : 'RECONNECT'}</button>
        </section>

        <section className="deck-panel dialogue-panel">
          <div className="dialogue-heading"><strong>AURELIA <span>// AI HANDLER</span></strong><span className={isSpeaking ? 'speaking-wave active' : 'speaking-wave'}>{Array.from({ length: 25 }).map((_, index) => <i key={index} />)}</span></div>
          <p>{dialogueText}</p>
          {composeOpen ? <form className="dialogue-input" onSubmit={submitMessage}><input aria-label="Message Aurelia" value={message} onChange={(event) => setMessage(event.target.value)} autoFocus placeholder="Send a secure response..." /><button type="submit"><Send /></button></form> : <button className="begin-mission" onClick={onBeginMission}>LET'S BEGIN</button>}
          <button className="compose-toggle" onClick={() => setComposeOpen((current) => !current)}>{composeOpen ? 'CANCEL' : 'MESSAGE AURELIA'}</button>
        </section>

        <nav className="deck-dock" aria-label="Quick access">
          {navigation.slice(1, 8).map(({ icon: Icon, label, tab }, index) => <button key={`${label}-dock`} onClick={() => index === 0 ? onOpenTerminal() : onSelectTab(tab)} className={activeTab === tab ? 'active' : ''}><span><Icon /></span><small>{label === 'SKILL TREE' ? 'INTEL' : label}</small></button>)}
        </nav>
      </main>

      <footer className="deck-footer"><span>ACTIVE USER: <b>{operator.name.toUpperCase()}</b></span><span>SESSION: 7G23-XQ9P-A1</span><span>UPTIME: 04:27:36</span><span>CPU 32% ▮▮▮▮▯▯</span><span>MEM 61% ▮▮▮▮▯▯</span><span>NET 48ms ▮▮▮▮▮</span></footer>
    </section>
  );
};

const DeckMark: React.FC = () => <svg className="deck-mark" viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M32 7 57 53H7L32 7Z" /><path d="m32 18 14 27H18l14-27ZM32 18v27M18 45l14-10 14 10" /></svg>;

const DeckPanelHeader: React.FC<{ title: string; accent?: 'violet'; count?: number; onClose?: () => void }> = ({ title, accent, count, onClose }) => <header className={`deck-panel-header ${accent ?? ''}`}><span>{title}</span><div>{count !== undefined && <b>{count}</b>}<button onClick={onClose} aria-label={`Open ${title}`}><X /></button></div></header>;

const StatusBar: React.FC<{ label: string; tone: 'cyan' | 'violet'; value: number }> = ({ label, tone, value }) => <div className={`status-bar ${tone}`}><div><span>{label}</span><b>{value}%</b></div><i><em style={{ width: `${value}%` }} /></i></div>;

const portraitForMood = (mood: ReferenceCommandDeckProps['aureliaMood']) => {
  const portraits = {
    neutral: '/assets/portraits/aurelia.png',
    thinking: '/assets/portraits/aurelia-thinking.png',
    speaking: '/assets/portraits/aurelia-speaking.png',
    alert: '/assets/portraits/aurelia-alert.png',
    pleased: '/assets/portraits/aurelia-speaking.png',
  };
  return portraits[mood];
};
