import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Check, ChevronRight, Circle, Flag, Folder, FileText, Lightbulb, RotateCcw, Sliders, TerminalSquare, X, Zap } from 'lucide-react';
import type { GameMission } from '../../game/gameData';
import { executeRangeCommand, getAutocompleteCandidates, getVirtualTreeForMission, initialRangeState, type RangeState } from '../../game/terminalEngine';
import { sound } from '../../utils/audioSynth';
import { speakAurelia } from '../../utils/aureliaVoice';
import { HexMatrixBreach } from '../minigames/HexMatrixBreach';
import { FrequencyTuner } from '../minigames/FrequencyTuner';
import './FullTerminalModal.css';

interface ConsoleLine { id: number; type: 'system' | 'command' | 'normal' | 'success' | 'warning' | 'error'; text: string }

interface FullTerminalModalProps {
  mission: GameMission;
  alreadyCompleted: boolean;
  onClose: () => void;
  onMissionComplete: (mission: GameMission) => void;
  savedState?: RangeState;
  onStateChange?: (state: RangeState) => void;
  augments?: string[];
  initialCommand?: string;
  onNextMission?: () => void;
}

const formatSyntaxOutput = (text: string): React.ReactNode => {
  if (text.includes('flag{')) {
    const parts = text.split(/(flag\{[^}]+\})/g);
    return parts.map((part, index) => part.startsWith('flag{') ? <span key={index} className="phosphor-emerald">{part}</span> : part);
  }
  if (/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(text)) {
    const parts = text.split(/(\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b)/g);
    return parts.map((part, index) => /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(part) ? <span key={index} className="phosphor-cyan">{part}</span> : part);
  }
  return text;
};

export const FullTerminalModal: React.FC<FullTerminalModalProps> = ({ mission, alreadyCompleted, onClose, onMissionComplete, savedState, onStateChange, augments = [], initialCommand = '', onNextMission }) => {
  const initialLines = useMemo<ConsoleLine[]>(() => [
    { id: 1, type: 'system', text: `PROJECT VEIL RANGE // ${mission.id}` },
    { id: 2, type: 'normal', text: `${mission.title} loaded into isolated simulation.` },
    { id: 3, type: 'normal', text: "Type 'objectives' to review the chain, 'crack' for breach minigame, 'tune' for waveform tuner, or Tab to autocomplete." },
  ], [mission]);
  const [lines, setLines] = useState(initialLines);
  const [rangeState, setRangeState] = useState<RangeState>(savedState ?? initialRangeState());
  const [input, setInput] = useState(initialCommand);
  const [missionComplete, setMissionComplete] = useState(alreadyCompleted);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState<number | null>(null);
  const [treeOpen, setTreeOpen] = useState(true);
  const [activeMinigame, setActiveMinigame] = useState<'hex' | 'frequency' | null>(null);


  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(10);
  const save = (state: RangeState) => { setRangeState(state); onStateChange?.(state); };
  
  useEffect(() => { sound.setThreat('tension'); return () => sound.setThreat('exploration'); }, []);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [lines]);

  // Lockout Timer countdown
  useEffect(() => {
    if (rangeState.trace >= 100 && lockoutTimeLeft === null) {
      setLockoutTimeLeft(15);
      sound.playWarning();
      speakAurelia("Warning: Trace overload reached 100 percent. Emergency signal recovery window active for 15 seconds.", () => {});
    } else if (rangeState.trace < 100 && lockoutTimeLeft !== null) {
      setLockoutTimeLeft(null);
    }
  }, [rangeState.trace, lockoutTimeLeft]);

  useEffect(() => {
    if (lockoutTimeLeft === null || lockoutTimeLeft <= 0) {
      if (lockoutTimeLeft === 0) {
        save(initialRangeState());
        setLines([...initialLines, { id: nextId.current++, type: 'error', text: 'LOCKOUT EXPIRED: Emergency signal lost. Range objectives reset to 0.' }]);
        setLockoutTimeLeft(null);
        sound.playWarning();
      }
      return;
    }
    const timer = setInterval(() => setLockoutTimeLeft((prev) => (prev !== null ? prev - 1 : null)), 1000);
    return () => clearInterval(timer);
  }, [lockoutTimeLeft, initialLines]);

  const candidates = useMemo(() => getAutocompleteCandidates(mission, input), [mission, input]);
  const virtualTree = useMemo(() => getVirtualTreeForMission(mission, rangeState.completedSteps), [mission, rangeState.completedSteps]);

  const append = (items: Array<Omit<ConsoleLine, 'id'>>) => setLines((current) => [...current, ...items.map((item) => ({ ...item, id: nextId.current++ }))]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const command = input.trim();
    if (!command) return;
    sound.playKeypress();
    setHistory((current) => [...current, command]); setHistoryIndex(-1); setInput('');
    
    if (command.toLowerCase() === 'recover' && augments.includes('recovery') && !rangeState.recovered) {
      save({ ...rangeState, trace: Math.max(0, rangeState.trace - 30), recovered: true });
      setLockoutTimeLeft(null);
      sound.playSuccess();
      append([{ type: 'success', text: 'EMERGENCY RECOVERY PROTOCOL APPLIED. Trace reduced by 30%.' }]);
      speakAurelia("Signal recovery confirmed. Trace reduced by thirty percent.", () => {});
      return;
    }

    if (rangeState.trace >= 100) {
      append([{ type: 'warning', text: `RANGE LOCKOUT ACTIVE: ${lockoutTimeLeft}s remaining. Type 'recover' (if equipped) or wait for range reset.` }]);
      return;
    }

    const cmdLower = command.toLowerCase();
    if (cmdLower === 'crack' || cmdLower === 'hack' || cmdLower === 'breach') {
      setActiveMinigame('hex');
      append([
        { type: 'command', text: `operator@${mission.id.toLowerCase()}:~$ ${command}` },
        { type: 'normal', text: 'INITIALIZING HEX MATRIX BREACH PROTOCOL PUZZLE...' },
      ]);
      return;
    }

    if (cmdLower === 'tune' || cmdLower === 'stabilize' || cmdLower === 'oscilloscope') {
      setActiveMinigame('frequency');
      append([
        { type: 'command', text: `operator@${mission.id.toLowerCase()}:~$ ${command}` },
        { type: 'normal', text: 'INITIALIZING QUANTUM FREQUENCY WAVEFORM TUNER...' },
      ]);
      return;
    }

    const result = executeRangeCommand(mission, command, rangeState, augments);
    if (result.output[0] === '__CLEAR__') { setLines([]); return; }
    if (result.tone === 'error') {
      const traceAdd = augments.includes('damping') ? 8 : 15;
      result.state = { ...result.state, trace: Math.min(100, rangeState.trace + traceAdd) };
      sound.playWarning();
    }
    save(result.state);
    append([{ type: 'command', text: `operator@${mission.id.toLowerCase()}:~$ ${command}` }, ...result.output.map((text) => ({ type: result.tone, text }))]);
    
    if (command.toLowerCase().startsWith('submit ') && result.tone === 'success' && !missionComplete) {
      setMissionComplete(true);
      sound.playSuccess();
      onMissionComplete(mission);
      speakAurelia(`Flag verified. Operation ${mission.title} completed successfully.`, () => {});
    }
  };

  const handleMinigameSuccess = () => {
    const flag = mission.flag;
    const updatedState: RangeState = {
      ...rangeState,
      completedSteps: mission.objectives.length,
      discoveredFlag: flag,
    };
    save(updatedState);
    append([
      { type: 'success', text: `[+] TACTICAL OVERRIDE VERIFIED: Key discovered -> ${flag}` },
      { type: 'normal', text: `Run 'submit ${flag}' to finish verification.` },
    ]);
    setInput(`submit ${flag}`);
    speakAurelia(`Tactical minigame solved. Submit the recovered flag: ${flag}`, () => {});
  };

  const useHint = () => {
    const next = mission.objectives[rangeState.completedSteps];
    const hintCmd = next?.command ?? `submit ${mission.flag}`;
    setInput(hintCmd);
    speakAurelia(`Aurelia analysis suggest: try ${hintCmd}`, () => {});
  };

  const reset = () => { save(initialRangeState()); setLines(initialLines); setMissionComplete(alreadyCompleted); setInput(''); setHistory([]); setHistoryIndex(-1); setLockoutTimeLeft(null); sound.playDeploy(); };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      if (candidates.length > 0) {
        setInput(candidates[0]);
        sound.playClick();
      }
      return;
    }
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    if (event.key === 'ArrowUp' && history.length) {
      const next = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next); setInput(history[next]);
    } else if (event.key === 'ArrowDown') {
      const next = historyIndex >= history.length - 1 ? -1 : historyIndex + 1;
      setHistoryIndex(next); setInput(next < 0 ? '' : history[next]);
    }
  };

  return (
    <div className="range-overlay" role="dialog" aria-modal="true" aria-label={`${mission.title} cyber range`}>
      <div className="range-shell">
        <header className="range-header">
          <div><TerminalSquare /><span><b>TACTICAL RANGE // {mission.id}</b><small>{mission.title}</small></span></div>
          {lockoutTimeLeft !== null && (
            <div className="range-threat" style={{ color: '#ff4d4d', borderColor: '#ff4d4d' }}>
              <AlertTriangle /> EMERGENCY LOCKOUT: <b>{lockoutTimeLeft}s</b>
            </div>
          )}
          <div className="range-threat">THREAT SIMULATION <b>{mission.threat}</b></div>
          <button onClick={onClose} aria-label="Close terminal"><X /></button>
        </header>

        <aside className="range-objectives">
          <span className="range-kicker">MISSION OBJECTIVES</span><h2>{mission.technique}</h2><p>{mission.objective}</p>
          <ol>{mission.objectives.map((objective, index) => <li key={objective.label} className={index < rangeState.completedSteps ? 'complete' : index === rangeState.completedSteps ? 'active' : ''}><span>{index < rangeState.completedSteps ? <Check /> : <Circle />}</span><div><b>{objective.label}</b><small>{index < rangeState.completedSteps ? 'VERIFIED' : index === rangeState.completedSteps ? 'ACTIVE' : 'LOCKED'}</small></div></li>)}</ol>
          <div className="range-progress"><span>CHAIN PROGRESS <b>{Math.round(rangeState.completedSteps / mission.objectives.length * 100)}%</b></span><i><em style={{ width: `${rangeState.completedSteps / mission.objectives.length * 100}%` }} /></i></div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '8px 0' }}>
            <button className="range-hint" onClick={() => setActiveMinigame('hex')} title="Launch Hex Matrix Breach Minigame">
              <Zap size={13} /> BREACH PUZZLE
            </button>
            <button className="range-hint" onClick={() => setActiveMinigame('frequency')} title="Launch Frequency Oscilloscope Minigame">
              <Sliders size={13} /> WAVE TUNER
            </button>
          </div>

          <button className="range-hint" onClick={useHint}><Lightbulb /> LOAD NEXT COMMAND</button>
          <p className={rangeState.trace >= 75 ? 'danger' : ''}>SIMULATED TRACE: {rangeState.trace}%</p>
          <p>Invalid commands raise trace (+15% standard, +8% damped). At 100%, 15s emergency window opens.</p>
          {augments.includes('analysis') && <code>{mission.objectives[rangeState.completedSteps]?.command ?? `submit ${mission.flag}`}</code>}
          {augments.includes('recovery') && <button className="range-hint" disabled={rangeState.recovered} onClick={() => setInput('recover')}>SIGNAL RECOVERY {rangeState.recovered ? '// USED' : '// READY'}</button>}
          
          {/* Virtual File Tree Side Drawer */}
          <div className="range-tree-container">
            <button className="tree-toggle" onClick={() => setTreeOpen(!treeOpen)}>
              <Folder size={14} /> RANGE FILESYSTEM TREE <b>{treeOpen ? '▼' : '▶'}</b>
            </button>
            {treeOpen && (
              <ul className="tree-node-list">
                {virtualTree.filter(node => node.status !== 'hidden').map((node) => (
                  <li key={node.path} className={`tree-node ${node.status}`} onClick={() => setInput(node.isDir ? `cd ${node.name}` : `cat ${node.name}`)}>
                    {node.isDir ? <Folder size={12} className="icon-dir" /> : <FileText size={12} className="icon-file" />}
                    <span>{node.name}</span>
                    <small>{node.status === 'discovered' ? '[RECOVERED]' : ''}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <main className="range-console">
          <div className="range-console-toolbar">
            <span><i /> ISOLATED TRAINING ENVIRONMENT</span>
            <div>
              <button onClick={() => setActiveMinigame('hex')}><Zap size={12} /> CRACK</button>
              <button onClick={() => setActiveMinigame('frequency')}><Sliders size={12} /> TUNE</button>
              <button onClick={reset}><RotateCcw /> RESET RANGE</button>
              <button onClick={() => setLines([])}>CLEAR</button>
            </div>
          </div>
          <div className="range-output" ref={scrollRef} role="log" aria-live="polite">
            {lines.map((line) => <p key={line.id} className={line.type}>{formatSyntaxOutput(line.text)}</p>)}
            {rangeState.completedSteps > 0 && <p className="system">Checkpoint: {rangeState.completedSteps}/{mission.objectives.length} objectives. {rangeState.discoveredFlag ? `Recovered: ${rangeState.discoveredFlag}` : 'Investigation saved.'}</p>}
            {missionComplete && <div className="range-victory"><Flag /><span><b>MISSION COMPLETE</b><small>{mission.lore}</small></span></div>}
          </div>
          <form onSubmit={submit} className="range-input">
            <span>operator@{mission.id.toLowerCase()}:~$</span>
            <input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} autoFocus spellCheck={false} aria-label="Terminal command" />
            {candidates.length > 0 && <small className="autocomplete-hint">Press [Tab] for: <b>{candidates[0]}</b></small>}
            <i />
          </form>
        </main>
        <footer className="range-footer"><span>DIRECTORY: {rangeState.currentDirectory}</span><span>COMMAND HISTORY: {history.length}</span><span>FLAG BUFFER: {rangeState.discoveredFlag ? 'CAPTURED' : 'EMPTY'}</span>{missionComplete && <button onClick={onNextMission ?? onClose}>{onNextMission ? 'NEXT OPERATION' : 'RETURN TO COMMAND DECK'} <ChevronRight /></button>}</footer>
      </div>

      {activeMinigame === 'hex' && (
        <HexMatrixBreach
          hasTraceDamper={augments.includes('damping')}
          onSuccess={handleMinigameSuccess}
          onClose={() => setActiveMinigame(null)}
        />
      )}

      {activeMinigame === 'frequency' && (
        <FrequencyTuner
          missionTitle={mission.title}
          onSuccess={handleMinigameSuccess}
          onClose={() => setActiveMinigame(null)}
        />
      )}
    </div>
  );
};

