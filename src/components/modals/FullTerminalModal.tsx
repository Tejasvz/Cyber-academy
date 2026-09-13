import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronRight, Circle, Flag, Lightbulb, RotateCcw, TerminalSquare, X } from 'lucide-react';
import type { GameMission } from '../../game/gameData';
import { executeRangeCommand, initialRangeState, type RangeState } from '../../game/terminalEngine';
import { sound } from '../../utils/audioSynth';
import './FullTerminalModal.css';

interface ConsoleLine { id: number; type: 'system' | 'command' | 'normal' | 'success' | 'warning' | 'error'; text: string }

interface FullTerminalModalProps {
  mission: GameMission;
  alreadyCompleted: boolean;
  onClose: () => void;
  onMissionComplete: (mission: GameMission) => void;
}

export const FullTerminalModal: React.FC<FullTerminalModalProps> = ({ mission, alreadyCompleted, onClose, onMissionComplete }) => {
  const initialLines = useMemo<ConsoleLine[]>(() => [
    { id: 1, type: 'system', text: `PROJECT VEIL RANGE // ${mission.id}` },
    { id: 2, type: 'normal', text: `${mission.title} loaded into isolated simulation.` },
    { id: 3, type: 'normal', text: "Type 'objectives' to review the chain or 'hint' if you are blocked." },
  ], [mission]);
  const [lines, setLines] = useState(initialLines);
  const [rangeState, setRangeState] = useState<RangeState>(initialRangeState);
  const [input, setInput] = useState('');
  const [missionComplete, setMissionComplete] = useState(alreadyCompleted);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(10);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [lines]);

  const append = (items: Array<Omit<ConsoleLine, 'id'>>) => setLines((current) => [...current, ...items.map((item) => ({ ...item, id: nextId.current++ }))]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const command = input.trim();
    if (!command) return;
    sound.playKeypress();
    setHistory((current) => [...current, command]); setHistoryIndex(-1); setInput('');
    const result = executeRangeCommand(mission, command, rangeState);
    if (result.output[0] === '__CLEAR__') { setLines([]); return; }
    setRangeState(result.state);
    append([{ type: 'command', text: `operator@${mission.id.toLowerCase()}:~$ ${command}` }, ...result.output.map((text) => ({ type: result.tone, text }))]);
    if (command.toLowerCase().startsWith('submit ') && result.tone === 'success' && !missionComplete) {
      setMissionComplete(true); sound.playAureliaPulse(); onMissionComplete(mission);
    }
  };

  const useHint = () => {
    const next = mission.objectives[Math.min(rangeState.completedSteps, mission.objectives.length - 1)];
    setInput(next?.command ?? `submit ${mission.flag}`);
  };

  const reset = () => { setRangeState(initialRangeState()); setLines(initialLines); setMissionComplete(alreadyCompleted); setInput(''); };

  const navigateHistory = (event: React.KeyboardEvent<HTMLInputElement>) => {
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
        <header className="range-header"><div><TerminalSquare /><span><b>TACTICAL RANGE // {mission.id}</b><small>{mission.title}</small></span></div><div className="range-threat">THREAT SIMULATION <b>{mission.threat}</b></div><button onClick={onClose} aria-label="Close terminal"><X /></button></header>
        <aside className="range-objectives">
          <span className="range-kicker">MISSION OBJECTIVES</span><h2>{mission.technique}</h2><p>{mission.objective}</p>
          <ol>{mission.objectives.map((objective, index) => <li key={objective.label} className={index < rangeState.completedSteps ? 'complete' : index === rangeState.completedSteps ? 'active' : ''}><span>{index < rangeState.completedSteps ? <Check /> : <Circle />}</span><div><b>{objective.label}</b><small>{index < rangeState.completedSteps ? 'VERIFIED' : index === rangeState.completedSteps ? 'ACTIVE' : 'LOCKED'}</small></div></li>)}</ol>
          <div className="range-progress"><span>CHAIN PROGRESS <b>{Math.round(rangeState.completedSteps / mission.objectives.length * 100)}%</b></span><i><em style={{ width: `${rangeState.completedSteps / mission.objectives.length * 100}%` }} /></i></div>
          <button className="range-hint" onClick={useHint}><Lightbulb /> LOAD NEXT COMMAND</button>
        </aside>
        <main className="range-console">
          <div className="range-console-toolbar"><span><i /> ISOLATED TRAINING ENVIRONMENT</span><div><button onClick={reset}><RotateCcw /> RESET RANGE</button><button onClick={() => setLines([])}>CLEAR</button></div></div>
          <div className="range-output" ref={scrollRef}>{lines.map((line) => <p key={line.id} className={line.type}>{line.text}</p>)}{missionComplete && <div className="range-victory"><Flag /><span><b>MISSION COMPLETE</b><small>{mission.lore}</small></span></div>}</div>
          <form onSubmit={submit} className="range-input"><span>operator@{mission.id.toLowerCase()}:~$</span><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={navigateHistory} autoFocus spellCheck={false} aria-label="Terminal command" /><i /></form>
        </main>
        <footer className="range-footer"><span>DIRECTORY: {rangeState.currentDirectory}</span><span>COMMAND HISTORY: {history.length}</span><span>FLAG BUFFER: {rangeState.discoveredFlag ? 'CAPTURED' : 'EMPTY'}</span>{missionComplete && <button onClick={onClose}>RETURN TO COMMAND DECK <ChevronRight /></button>}</footer>
      </div>
    </div>
  );
};
