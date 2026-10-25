import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Compass,
  Crosshair,
  Database,
  Eye,
  GitMerge,
  Palette,
  Radio,
  Send,
  Settings,
  Shield,
  Sliders,
  TerminalSquare,
  UserRound,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import type { AINotification, IntelItem, Mission, NavTab, Operator, SystemHealth, ThemeType, WindowId } from '../../types';
import { AureliaHologram3D } from '../AI/AureliaHologram3D';
import './ReferenceCommandDeck.css';
import { usePreferences } from '../../store/preferencesStore';
import { useWindowManager, WINDOW_TITLES } from '../../hooks/useWindowManager';
import { sound } from '../../utils/audioSynth';


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
  onOpenMinigame?: (type: 'hex' | 'frequency') => void;
}

const navigation: Array<{ icon: React.ElementType; label: string; tab: NavTab }> = [
  { icon: Shield, label: 'DASHBOARD', tab: 'DASHBOARD' },
  { icon: Crosshair, label: 'MISSIONS', tab: 'MISSIONS' },
  { icon: Compass, label: 'MAP', tab: 'MAP' },
  { icon: Eye, label: 'INTEL', tab: 'INTEL' },
  { icon: Database, label: 'SANDBOX', tab: 'SANDBOX' },
  { icon: GitMerge, label: 'SKILL TREE', tab: 'SKILL_TREE' },
  { icon: Database, label: 'DATABASE', tab: 'DATABASE' },
  { icon: Radio, label: 'UPGRADES', tab: 'UPGRADES' },
  { icon: Settings, label: 'CONFIG', tab: 'SETTINGS' },
];

const terminalSeed = [
  { tone: 'prompt', text: 'operator@veil:~$ connect sector-zero' },
  { tone: 'muted', text: 'Establishing secure link...' },
  { tone: 'success', text: 'Connected to Sector Zero pod.' },
  { tone: 'prompt', text: 'operator@sector-zero:~$ help' },
  { tone: 'plain', text: 'Commands: scan, crack, tune, theme <cyan|matrix|amethyst|amber>, status, clear' },
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
  onOpenMinigame,
}) => {
  const [clock, setClock] = useState(formatClock);
  const prefs = usePreferences();
  const [composeOpen, setComposeOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLines, setTerminalLines] = useState(terminalSeed);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [volumeSliderOpen, setVolumeSliderOpen] = useState(false);

  const {
    windows,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
    restoreWindow,
    resetLayout,
    minimizedList,
  } = useWindowManager();

  useEffect(() => {
    const timer = window.setInterval(() => setClock(formatClock()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const changeTheme = (newTheme: ThemeType) => {
    prefs.update({ osTheme: newTheme });
    sound.playClick();
    setThemeDropdownOpen(false);
  };

  const handleToggleSecure = () => {
    if (secureChannelActive) {
      sound.playCodeRedAlarm();
    } else {
      sound.playEmergencySuccess();
    }
    onToggleSecureChannel();
  };

  const submitTerminal = (event: React.FormEvent) => {
    event.preventDefault();
    const rawCommand = terminalInput.trim();
    if (!rawCommand) return;
    sound.playKeypress();
    const cmd = rawCommand.toLowerCase();

    setTerminalLines((lines) => [
      ...lines,
      { tone: 'prompt', text: `operator@sector-zero:~$ ${rawCommand}` },
    ]);
    setTerminalInput('');

    if (cmd === 'clear') {
      setTerminalLines([]);
      return;
    }

    if (cmd === 'help') {
      setTerminalLines((lines) => [
        ...lines,
        { tone: 'plain', text: 'AVAILABLE COMMANDS:' },
        { tone: 'plain', text: '  scan           - Scan local subnet for active nodes and open ports' },
        { tone: 'plain', text: '  crack / hack   - Launch tactical Hex Matrix Codebreaker minigame' },
        { tone: 'plain', text: '  tune           - Launch Quantum Frequency Oscilloscope minigame' },
        { tone: 'plain', text: '  theme <name>   - Change HUD theme: cyan, matrix, amethyst, amber' },
        { tone: 'plain', text: '  status         - Display operator telemetry and mission progress' },
        { tone: 'plain', text: '  maximize       - Expand terminal console to fullscreen range' },
      ]);
      return;
    }

    if (cmd === 'scan' || cmd === 'nmap') {
      sound.playDiagnosticScan();
      setTerminalLines((lines) => [
        ...lines,
        { tone: 'muted', text: 'Initiating subnet scan on 10.10.0.0/24...' },
        { tone: 'plain', text: 'NODE 10.10.0.1   [SEC_ZERO_GATEWAY]  PORT 22 (SSH) OPEN' },
        { tone: 'plain', text: 'NODE 10.10.12.34 [VEIL_PROXY_EDGE]    PORT 8080 (PROXY) OPEN' },
        { tone: 'plain', text: 'NODE 10.10.88.99 [QUANTUM_RELAY_4B]   PORT 443 (TLS) LOCKED' },
        { tone: 'success', text: '[+] 3 live nodes discovered. Target ready for crack/tune.' },
      ]);
      return;
    }

    if (cmd.startsWith('theme ')) {
      const targetTheme = cmd.replace('theme ', '').trim();
      const map: Record<string, ThemeType> = {
        cyan: 'CYAN',
        matrix: 'MATRIX',
        emerald: 'MATRIX',
        amethyst: 'AMETHYST',
        purple: 'AMETHYST',
        amber: 'AMBER',
        gold: 'AMBER',
      };
      if (map[targetTheme]) {
        changeTheme(map[targetTheme]);
        setTerminalLines((lines) => [
          ...lines,
          { tone: 'success', text: `OS theme switched to ${map[targetTheme]}.` },
        ]);
      } else {
        setTerminalLines((lines) => [
          ...lines,
          { tone: 'danger', text: 'Invalid theme. Choices: cyan, matrix, amethyst, amber.' },
        ]);
      }
      return;
    }

    if (cmd === 'crack' || cmd === 'hack' || cmd === 'override') {
      onOpenMinigame?.('hex');
      setTerminalLines((lines) => [
        ...lines,
        { tone: 'success', text: 'INITIALIZING HEX MATRIX BREACH PROTOCOL...' },
      ]);
      return;
    }

    if (cmd === 'tune' || cmd === 'stabilize') {
      onOpenMinigame?.('frequency');
      setTerminalLines((lines) => [
        ...lines,
        { tone: 'success', text: 'INITIALIZING QUANTUM FREQUENCY WAVEFORM TUNER...' },
      ]);
      return;
    }

    if (cmd === 'status') {
      setTerminalLines((lines) => [
        ...lines,
        { tone: 'plain', text: `MISSION: ${mission.title} (${mission.progress}%)` },
        { tone: 'plain', text: `OPERATOR: ${operator.name} [LVL ${operator.level}]` },
        { tone: 'plain', text: `DEFCON: ${secureChannelActive ? 'NORMAL' : 'CODE RED'}` },
      ]);
      return;
    }

    // Default to delegating to onTerminalCommand
    onTerminalCommand(rawCommand);
  };

  const submitMessage = (event: React.FormEvent) => {
    event.preventDefault();
    const outgoing = message.trim();
    if (!outgoing) return;
    onSendMessage(outgoing);
    setMessage('');
    setComposeOpen(false);
  };

  const getPanelClass = (id: WindowId, baseClass: string) => {
    const win = windows[id];
    const isMin = win.isMinimized || !win.isOpen;
    const isMax = win.isMaximized;
    return `deck-panel ${baseClass} ${isMin ? 'is-minimized' : ''} ${isMax ? 'is-maximized' : ''}`;
  };

  return (
    <section
      className={`command-deck ${!secureChannelActive ? 'defcon-code-red' : ''}`}
      data-theme={prefs.osTheme}
      aria-label="Project Veil command deck"
    >
      <div className="deck-atmosphere" aria-hidden="true" />
      <div className="deck-scanlines" aria-hidden="true" />

      <header className="deck-header">
        <button className="deck-brand" onClick={() => onSelectTab('DASHBOARD')} aria-label="Open Project Veil dashboard">
          <DeckMark />
          <span><strong>PROJECT VEIL</strong><small>AETHER PROTOCOL INTERFACE</small></span>
        </button>

        <div className="deck-session">
          <b>CYBER OS v2.2.0</b>
          <span>//</span>
          <span>THEME: {prefs.osTheme}</span>
          <span>//</span>
          <span style={{ color: secureChannelActive ? '#18efad' : '#ff3366', fontWeight: 600 }}>
            {secureChannelActive ? 'DEFCON: NORMAL' : 'DEFCON: CODE RED'}
          </span>
        </div>

        <div className="deck-header-meta">
          <span>{clock}</span>

          {/* Theme Selector Popover */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setThemeDropdownOpen(!themeDropdownOpen); setVolumeSliderOpen(false); }}
              title="Change HUD Theme"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            >
              <Palette size={15} />
              <small>{prefs.osTheme}</small>
            </button>
            {themeDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '28px',
                  right: 0,
                  background: 'rgba(6, 8, 24, 0.95)',
                  border: '1px solid var(--veil-border-color)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  zIndex: 200,
                  boxShadow: '0 0 20px rgba(0,0,0,0.8)',
                  minWidth: '130px',
                }}
              >
                {(['CYAN', 'MATRIX', 'AMETHYST', 'AMBER'] as ThemeType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => changeTheme(t)}
                    style={{
                      background: prefs.osTheme === t ? 'rgba(32, 214, 233, 0.2)' : 'transparent',
                      border: '1px solid rgba(160, 82, 239, 0.3)',
                      color: prefs.osTheme === t ? '#20d6e9' : '#a4b3d0',
                      padding: '4px 8px',
                      fontSize: '10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    {t === 'CYAN' ? 'AETHER CYAN' : t === 'MATRIX' ? 'MATRIX GREEN' : t === 'AMETHYST' ? 'AMETHYST NEON' : 'SOLAR AMBER'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Master Volume Popover */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setVolumeSliderOpen(!volumeSliderOpen); setThemeDropdownOpen(false); }}
              title={prefs.muted ? 'Unmute all audio' : 'Audio Controls'}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            >
              {prefs.muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            {volumeSliderOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '28px',
                  right: 0,
                  background: 'rgba(6, 8, 24, 0.95)',
                  border: '1px solid var(--veil-border-color)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  zIndex: 200,
                  boxShadow: '0 0 20px rgba(0,0,0,0.8)',
                  minWidth: '170px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#20d6e9' }}>
                  <span>MASTER VOLUME</span>
                  <b>{Math.round(prefs.master * 100)}%</b>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={prefs.master}
                  onChange={(e) => prefs.update({ master: Number(e.target.value), muted: false })}
                  style={{ width: '100%', accentColor: 'var(--veil-cyan)' }}
                />
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '9px', color: '#a4b3d0' }}>
                  <span>AMBIENT CYBER DRONE</span>
                  <input
                    type="checkbox"
                    checked={prefs.ambient}
                    onChange={(e) => prefs.update({ ambient: e.target.checked })}
                    style={{ accentColor: 'var(--veil-cyan)' }}
                  />
                </label>
                <button
                  onClick={() => prefs.update({ muted: !prefs.muted })}
                  style={{
                    background: prefs.muted ? 'rgba(255, 83, 126, 0.25)' : 'rgba(32, 214, 233, 0.15)',
                    border: '1px solid rgba(160, 82, 239, 0.4)',
                    color: prefs.muted ? '#ff537e' : '#20d6e9',
                    padding: '4px',
                    fontSize: '9px',
                    cursor: 'pointer',
                  }}
                >
                  {prefs.muted ? 'UNMUTE ALL' : 'MUTE ALL'}
                </button>
              </div>
            )}
          </div>

          <button onClick={handleToggleSecure} className="sim-link-btn" title="Toggle Secure Neural Link">
            SECURE CHANNEL <i className={secureChannelActive ? 'is-secure' : ''} />
          </button>

          <div className="header-window-decor">
            <button className="win-btn win-min" onClick={() => minimizeWindow('terminal')} title="Minimize Active Window">–</button>
            <button className="win-btn win-max" onClick={() => maximizeWindow('terminal')} title="Maximize Active Window">□</button>
            <button className="win-btn win-close" onClick={resetLayout} title="Reset All Windows to Grid">✕</button>
          </div>
        </div>
      </header>

      <aside className="deck-sidebar" aria-label="Primary navigation">
        {navigation.map(({ icon: Icon, label, tab }, index) => (
          <button
            key={`${label}-${index}`}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => onSelectTab(tab)}
          >
            <Icon />
            <small>{label}</small>
          </button>
        ))}
      </aside>

      <main className="deck-workspace">
        {/* CURRENT MISSION WINDOW */}
        <section
          className={getPanelClass('mission', 'mission-panel')}
          style={{ zIndex: windows.mission.zIndex }}
          onClick={() => focusWindow('mission')}
        >
          <DeckPanelHeader
            title="CURRENT MISSION"
            accent="violet"
            onMinimize={() => minimizeWindow('mission')}
            onMaximize={() => maximizeWindow('mission')}
            onClose={() => closeWindow('mission')}
          />
          <div className="mission-content">
            <div className="mission-copy" onClick={onOpenMissionBriefing} style={{ cursor: 'pointer' }}>
              <h1>{mission.title}</h1>
              <p>{mission.subtitle.replaceAll(' / ', '\n')}</p>
            </div>
            <div className="mission-graphic" onClick={onOpenMissionBriefing} style={{ cursor: 'pointer' }}>
              <Shield />
              <i /><i /><i />
            </div>
            <div className="mission-rule" />
            <h2>OBJECTIVE</h2>
            <p className="mission-objective">{mission.objective}</p>
            <div className="mission-progress">
              <div><span>PROGRESS</span><b>{mission.progress}%</b></div>
              <i><em style={{ width: `${mission.progress}%` }} /></i>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                className="panel-action"
                style={{ flex: 1, padding: '5px 8px' }}
                onClick={() => onOpenMinigame?.('hex')}
                title="Launch Hex Matrix Buffer Breach Minigame"
              >
                <Zap size={11} /> BREACH PUZZLE <b>→</b>
              </button>
              <button
                className="panel-action"
                style={{ flex: 1, padding: '5px 8px' }}
                onClick={() => onOpenMinigame?.('frequency')}
                title="Launch Frequency Oscilloscope Minigame"
              >
                <Sliders size={11} /> WAVE TUNER <b>→</b>
              </button>
              <button
                className="panel-action"
                style={{ flex: 1.2, padding: '5px 8px' }}
                onClick={onOpenMissionBriefing}
              >
                BRIEFING <b>→</b>
              </button>
            </div>
          </div>
        </section>

        {/* OPERATOR STATUS WINDOW */}
        <section
          className={getPanelClass('operator', 'operator-panel')}
          style={{ zIndex: windows.operator.zIndex }}
          onClick={() => focusWindow('operator')}
        >
          <DeckPanelHeader
            title="OPERATOR STATUS"
            onMinimize={() => minimizeWindow('operator')}
            onMaximize={() => maximizeWindow('operator')}
            onClose={() => closeWindow('operator')}
          />
          <div className="operator-body">
            <div className="operator-ident">
              <span className="operator-mark"><UserRound /></span>
              <p>OPERATOR: <b>{operator.name.toUpperCase()}</b><br />CLEARANCE: <em>{operator.clearance}</em><br />TRUST LEVEL: {operator.trustLevel}%</p>
            </div>
            <div className="operator-level">
              <span>LEVEL<b>{operator.level}</b></span>
              <div>
                <p>XP <small>{operator.xpCurrent.toLocaleString()} / {operator.xpNext.toLocaleString()}</small></p>
                <i><em style={{ width: `${Math.min(100, operator.xpCurrent / operator.xpNext * 100)}%` }} /></i>
              </div>
            </div>
            <p className="badges-label">BADGES</p>
            <div className="badge-row">
              {operator.badges.slice(0, 5).map((badge) => (
                <span key={badge.id} className={badge.unlocked ? 'unlocked' : ''} title={badge.name}><Shield /></span>
              ))}
            </div>
            <button onClick={onOpenOperatorProfile} className="panel-action profile-action">VIEW PROFILE <b>→</b></button>
          </div>
        </section>

        {/* TERMINAL CONSOLE WINDOW */}
        <section
          className={getPanelClass('terminal', 'terminal-panel')}
          style={{ zIndex: windows.terminal.zIndex }}
          onClick={() => focusWindow('terminal')}
        >
          <DeckPanelHeader
            title="TERMINAL CONSOLE"
            onMinimize={() => minimizeWindow('terminal')}
            onMaximize={() => maximizeWindow('terminal')}
            onClose={() => closeWindow('terminal')}
          />
          <div className="terminal-body">
            <div className="terminal-scroll">
              {terminalLines.map((line, index) => (
                <p key={`${line.text}-${index}`} className={`terminal-${line.tone}`}>{line.text}</p>
              ))}
            </div>
            <form onSubmit={submitTerminal} className="terminal-input-row">
              <span>operator@sector-zero:~$</span>
              <input
                aria-label="Terminal command"
                value={terminalInput}
                onChange={(event) => setTerminalInput(event.target.value)}
                autoComplete="off"
                placeholder="type 'help', 'scan', 'crack', 'tune', 'theme matrix'..."
              />
            </form>
          </div>
          <footer className="terminal-toolbar">
            <button onClick={() => setTerminalLines([])}>CLEAR</button>
            <button onClick={() => setTerminalLines(terminalSeed)}>HISTORY</button>
            <button onClick={() => onOpenMinigame?.('hex')}>CRACK</button>
            <button onClick={() => onOpenMinigame?.('frequency')}>TUNE</button>
            <span />
            <button onClick={onOpenTerminal}>MAXIMIZE</button>
          </footer>
        </section>

        {/* HOLOGRAPHIC AI STAGE */}
        <section className={`deck-hologram is-${aureliaMood}`} aria-label={`Aurelia holographic intelligence, ${aureliaMood}`}>
          <AureliaHologram3D
            expression={aureliaMood}
            isSpeaking={isSpeaking}
            onInteract={() => onSendMessage('You have my attention, Aurelia. Talk to me.')}
          />
        </section>

        {/* AI NOTIFICATIONS WINDOW */}
        <section
          className={getPanelClass('notifications', 'notifications-panel')}
          style={{ zIndex: windows.notifications.zIndex }}
          onClick={() => focusWindow('notifications')}
        >
          <DeckPanelHeader
            title="AI NOTIFICATIONS"
            count={notifications.filter((item) => !item.read).length || 3}
            accent="violet"
            onMinimize={() => minimizeWindow('notifications')}
            onMaximize={() => maximizeWindow('notifications')}
            onClose={() => closeWindow('notifications')}
          />
          <div className="notification-list">
            {notifications.slice(0, 3).map((item) => (
              <article key={item.id}>
                <span className={`notification-icon ${item.type}`}><Radio /></span>
                <div><h2>{item.title}</h2><p>{item.description}</p></div>
                <time>{item.timestamp}</time>
              </article>
            ))}
          </div>
          <button className="panel-action notification-action" onClick={() => onSelectTab('NOTIFICATIONS')}>
            VIEW ALL NOTIFICATIONS <b>→</b>
          </button>
        </section>

        {/* SYSTEM INTEGRITY WINDOW */}
        <section
          className={getPanelClass('integrity', 'integrity-panel')}
          style={{ zIndex: windows.integrity.zIndex }}
          onClick={() => focusWindow('integrity')}
        >
          <DeckPanelHeader
            title="SYSTEM INTEGRITY"
            onMinimize={() => minimizeWindow('integrity')}
            onMaximize={() => maximizeWindow('integrity')}
            onClose={() => closeWindow('integrity')}
          />
          <div className="integrity-body">
            <div className="integrity-gauge" style={{ '--integrity': `${health.overall * 3.6}deg` } as React.CSSProperties}>
              <b>{health.overall}%</b>
              <span>OVERALL</span>
            </div>
            <StatusBar label="CORE SYSTEMS" tone="cyan" value={health.coreSystems} />
            <StatusBar label="NETWORK STABILITY" tone="violet" value={health.networkStability} />
            <StatusBar label="AI RELIABILITY" tone="cyan" value={health.aiReliability} />
            <div className="secure-row">
              <span>SECURE CHANNEL</span>
              <b className={secureChannelActive ? 'on' : ''}>{secureChannelActive ? 'ACTIVE' : 'INACTIVE'} <i /></b>
            </div>

            {!secureChannelActive && (
              <button className="countermeasure-btn" onClick={handleToggleSecure}>
                <AlertTriangle size={13} style={{ display: 'inline', marginRight: '5px' }} />
                DEPLOY QUANTUM COUNTERMEASURES
              </button>
            )}
          </div>
          <button className="panel-action diagnostics-action" onClick={onOpenDiagnostics}>
            RUN SYSTEM DIAGNOSTICS <b>→</b>
          </button>
        </section>

        {/* RECENT INTEL WINDOW */}
        <section
          className={getPanelClass('intel', 'intel-panel')}
          style={{ zIndex: windows.intel.zIndex }}
          onClick={() => focusWindow('intel')}
        >
          <DeckPanelHeader
            title="RECENT INTEL"
            onMinimize={() => minimizeWindow('intel')}
            onMaximize={() => maximizeWindow('intel')}
            onClose={() => closeWindow('intel')}
          />
          <div className="intel-list">
            {intelList.slice(0, 3).map((item) => (
              <button key={item.id} onClick={onOpenIntelDatabase}>
                <span className="intel-visual" />
                <b>{item.number}</b>
                <div><h2>{item.title}</h2><p>{item.subtitle}<br />{item.date}</p></div>
              </button>
            ))}
          </div>
          <button className="panel-action intel-action" onClick={onOpenIntelDatabase}>
            VIEW INTEL DATABASE <b>→</b>
          </button>
        </section>

        {/* SECURE CHANNEL WINDOW */}
        <section
          className={getPanelClass('secure', 'secure-panel')}
          style={{ zIndex: windows.secure.zIndex }}
          onClick={() => focusWindow('secure')}
        >
          <DeckPanelHeader
            title="SECURE CHANNEL"
            onMinimize={() => minimizeWindow('secure')}
            onMaximize={() => maximizeWindow('secure')}
            onClose={() => closeWindow('secure')}
          />
          <div className="secure-body">
            <div className="secure-emblem"><DeckMark /></div>
            <dl>
              <div><dt>CHANNEL ID</dt><dd>AETHER-7023-XQ9P</dd></div>
              <div><dt>ENCRYPTION</dt><dd>AES-256 / QUANTUM RESISTANT</dd></div>
              <div><dt>STATUS</dt><dd className={secureChannelActive ? 'connected' : ''}>{secureChannelActive ? 'SECURE' : 'UNSECURED'} <i /></dd></div>
            </dl>
          </div>
          <button className="disconnect-button" onClick={handleToggleSecure}>
            {secureChannelActive ? 'DISCONNECT' : 'RECONNECT'}
          </button>
        </section>

        {/* DIALOGUE PANEL */}
        <section
          className={getPanelClass('dialogue', 'dialogue-panel')}
          style={{ zIndex: windows.dialogue.zIndex }}
          onClick={() => focusWindow('dialogue')}
        >
          <div className="dialogue-heading">
            <strong>AURELIA <span>// AI HANDLER</span></strong>
            <span className={isSpeaking ? 'speaking-wave active' : 'speaking-wave'}>
              {Array.from({ length: 25 }).map((_, index) => <i key={index} />)}
            </span>
          </div>
          <p>{dialogueText}</p>
          {composeOpen ? (
            <form className="dialogue-input" onSubmit={submitMessage}>
              <input
                aria-label="Message Aurelia"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                autoFocus
                placeholder="Send a secure response..."
              />
              <button type="submit"><Send /></button>
            </form>
          ) : (
            <button className="begin-mission" onClick={onBeginMission}>LET'S BEGIN</button>
          )}
          <button className="compose-toggle" onClick={() => setComposeOpen((current) => !current)}>
            {composeOpen ? 'CANCEL' : 'MESSAGE AURELIA'}
          </button>
        </section>

        {/* BOTTOM DOCK & TASKBAR */}
        <nav className="deck-dock" aria-label="Quick access">
          {/* Minimized Window Restore Tray */}
          {minimizedList.length > 0 && (
            <div className="dock-restore-tray">
              {minimizedList.map((id) => (
                <button
                  key={id}
                  className="dock-restore-pill"
                  onClick={() => restoreWindow(id)}
                  title={`Restore ${WINDOW_TITLES[id]}`}
                >
                  + {WINDOW_TITLES[id].replace('CURRENT ', '').replace(' WINDOW', '')}
                </button>
              ))}
              <button className="dock-reset-btn" onClick={resetLayout} title="Reset window positions">
                RESET HUD
              </button>
            </div>
          )}

          <button onClick={onOpenTerminal}>
            <span><TerminalSquare /></span>
            <small>TERMINAL</small>
          </button>

          {navigation
            .filter((item) => ['MISSIONS', 'MAP', 'INTEL', 'SANDBOX', 'DATABASE', 'UPGRADES'].includes(item.tab))
            .map(({ icon: Icon, label, tab }) => (
              <button
                key={`${label}-dock`}
                onClick={() => onSelectTab(tab)}
                className={activeTab === tab ? 'active' : ''}
              >
                <span><Icon /></span>
                <small>{label}</small>
              </button>
            ))}
        </nav>
      </main>

      <footer className="deck-footer">
        <span>ACTIVE USER: <b>{operator.name.toUpperCase()}</b></span>
        <span>SESSION: 7023-XQ9P-A1</span>
        <span>UPTIME: 04:27:36</span>
        <span>CPU {secureChannelActive ? '32%' : '94%'}</span>
        <span>MEM 61%</span>
        <span>NET {secureChannelActive ? '48ms' : '982ms (JITTER)'}</span>
      </footer>
    </section>
  );
};

const DeckMark: React.FC = () => (
  <svg className="deck-mark" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d="M32 7 57 53H7L32 7Z" />
    <path d="m32 18 14 27H18l14-27ZM32 18v27M18 45l14-10 14 10" />
  </svg>
);

const DeckPanelHeader: React.FC<{
  title: string;
  accent?: 'violet';
  count?: number;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}> = ({ title, accent, count, onMinimize, onMaximize, onClose }) => (
  <header className={`deck-panel-header ${accent ?? ''}`}>
    <span>{title}</span>
    <div className="deck-panel-controls">
      {count !== undefined && <b className="panel-count-badge">{count}</b>}
      <div className="window-decorations">
        <button className="win-btn win-min" onClick={onMinimize} title="Minimize">–</button>
        <button className="win-btn win-max" onClick={onMaximize} title="Maximize">□</button>
        <button className="win-btn win-close" onClick={onClose} title="Close">✕</button>
      </div>
    </div>
  </header>
);

const StatusBar: React.FC<{ label: string; tone: 'cyan' | 'violet'; value: number }> = ({
  label,
  tone,
  value,
}) => (
  <div className={`status-bar ${tone}`}>
    <div>
      <span>{label}</span>
      <b>{value}%</b>
    </div>
    <i><em style={{ width: `${value}%` }} /></i>
  </div>
);
