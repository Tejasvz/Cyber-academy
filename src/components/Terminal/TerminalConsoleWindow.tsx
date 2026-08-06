import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, X, Terminal as TerminalIcon } from 'lucide-react';
import type { TerminalEntry } from '../../types';
import { sound } from '../../utils/audioSynth';

interface TerminalConsoleWindowProps {
  onMaximize: () => void;
  onSendTerminalCommand?: (cmd: string) => void;
}

export const TerminalConsoleWindow: React.FC<TerminalConsoleWindowProps> = ({
  onMaximize,
  onSendTerminalCommand,
}) => {
  const [entries, setEntries] = useState<TerminalEntry[]>([
    { id: '1', type: 'prompt', content: 'operator@veil:~$ connect sector-zero' },
    { id: '2', type: 'info', content: 'Establishing secure link...' },
    { id: '3', type: 'success', content: 'Connected to Sector Zero Cyber Node.' },
    { id: '4', type: 'prompt', content: 'operator@sector-zero:~$ ls' },
    { id: '5', type: 'output', content: 'substation_logs/  firewall.conf  nodes/' },
    { id: '6', type: 'prompt', content: 'operator@sector-zero:~$ cat firewall.conf' },
    { id: '7', type: 'warning', content: '<RESTRICTED PROTOCOL>' },
    { id: '8', type: 'prompt', content: 'operator@sector-zero:~$ override --port 443' },
    { id: '9', type: 'error', content: 'Access Denied: Level 12 Clearance Required.' },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('operator@sector-zero:~$');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    sound.playKeypress();
    const cmd = inputVal.trim();
    const newPromptEntry: TerminalEntry = {
      id: Date.now().toString(),
      type: 'prompt',
      content: `${currentPrompt} ${cmd}`,
    };

    let newResponseEntries: TerminalEntry[] = [];
    const lower = cmd.toLowerCase();

    if (lower === 'clear') {
      setEntries([]);
      setInputVal('');
      return;
    } else if (lower === 'help') {
      newResponseEntries = [
        { id: (Date.now() + 1).toString(), type: 'info', content: 'AVAILABLE COMMANDS:' },
        { id: (Date.now() + 2).toString(), type: 'output', content: '  status       - View sector system integrity' },
        { id: (Date.now() + 3).toString(), type: 'output', content: '  ls           - List directory nodes' },
        { id: (Date.now() + 4).toString(), type: 'output', content: '  cat <file>   - Read config or log files' },
        { id: (Date.now() + 5).toString(), type: 'output', content: '  connect <id> - Connect to network sector' },
        { id: (Date.now() + 6).toString(), type: 'output', content: '  override     - Attempt firewall bypass' },
        { id: (Date.now() + 7).toString(), type: 'output', content: '  aurelia      - Query Aurelia AI Handler' },
        { id: (Date.now() + 8).toString(), type: 'output', content: '  clear        - Clear terminal screen' },
      ];
    } else if (lower.startsWith('connect')) {
      const target = cmd.split(' ')[1] || 'sector-zero';
      setCurrentPrompt(`operator@${target}:~$`);
      newResponseEntries = [
        { id: (Date.now() + 1).toString(), type: 'info', content: `Routing quantum channel to ${target}...` },
        { id: (Date.now() + 2).toString(), type: 'success', content: `Connected to ${target}. Encryption level AES-256.` },
      ];
    } else if (lower === 'ls') {
      newResponseEntries = [
        { id: (Date.now() + 1).toString(), type: 'output', content: 'substation_logs/  firewall.conf  nodes/  aether_core.bin' },
      ];
    } else if (lower.startsWith('cat')) {
      const file = cmd.split(' ')[1];
      if (file === 'firewall.conf') {
        newResponseEntries = [
          { id: (Date.now() + 1).toString(), type: 'warning', content: '[PORT: 443] BLOCK ALL UNAUTHORIZED CONNECTIONS' },
          { id: (Date.now() + 2).toString(), type: 'info', content: 'Vulnerability detected: Quantum bypass handshake missing.' },
        ];
      } else {
        newResponseEntries = [
          { id: (Date.now() + 1).toString(), type: 'output', content: `Reading ${file || 'data'}... File encrypted by Sector Zero Authority.` },
        ];
      }
    } else if (lower.startsWith('override')) {
      newResponseEntries = [
        { id: (Date.now() + 1).toString(), type: 'warning', content: 'Executing firewall exploit payload...' },
        { id: (Date.now() + 2).toString(), type: 'success', content: 'Substation firewall node overridden! Progress updated.' },
      ];
    } else if (lower === 'status') {
      newResponseEntries = [
        { id: (Date.now() + 1).toString(), type: 'info', content: 'SYSTEM STATUS: 78% OPERATIONAL | SECURE CHANNEL: ACTIVE' },
      ];
    } else {
      newResponseEntries = [
        { id: (Date.now() + 1).toString(), type: 'error', content: `Command not recognized: '${cmd}'. Type 'help' for command manual.` },
      ];
    }

    setEntries((prev) => [...prev, newPromptEntry, ...newResponseEntries]);
    setInputVal('');

    if (onSendTerminalCommand) {
      onSendTerminalCommand(cmd);
    }
  };

  return (
    <div className="glass-panel rounded-md flex flex-col flex-1 select-none shadow-neon-cyan/10 min-h-[160px]">
      {/* Header */}
      <div className="panel-header px-3.5 py-1.5 flex justify-between items-center rounded-t-md">
        <div className="flex items-center gap-1.5">
          <TerminalIcon className="w-3.5 h-3.5 text-[#22d3ee]" />
          <span className="text-[#22d3ee] font-semibold text-xs tracking-wider font-mono-cyber">
            TERMINAL CONSOLE
          </span>
        </div>
        <div className="flex gap-2 text-[#22d3ee]/60">
          <Minus className="w-3 h-3 cursor-pointer hover:text-[#22d3ee]" onClick={() => sound.playClick()} />
          <Square className="w-3 h-3 cursor-pointer hover:text-[#22d3ee]" onClick={onMaximize} />
          <X className="w-3 h-3 cursor-pointer hover:text-[#f87171]" onClick={() => sound.playClick()} />
        </div>
      </div>

      {/* Terminal History */}
      <div
        ref={scrollRef}
        className="p-3 flex-1 flex flex-col font-mono-cyber text-[11px] overflow-y-auto leading-relaxed gap-1 max-h-[160px]"
      >
        {entries.map((entry) => {
          if (entry.type === 'prompt') {
            return (
              <div key={entry.id} className="text-[#e2e8f0]">
                <span className="text-[#22d3ee]">{entry.content.split(' ')[0]}</span>{' '}
                <span className="text-[#e2e8f0]">{entry.content.split(' ').slice(1).join(' ')}</span>
              </div>
            );
          }
          if (entry.type === 'success') {
            return <div key={entry.id} className="text-[#4ade80]">{entry.content}</div>;
          }
          if (entry.type === 'error') {
            return <div key={entry.id} className="text-[#f87171]">{entry.content}</div>;
          }
          if (entry.type === 'warning') {
            return <div key={entry.id} className="text-[#fbbf24]">{entry.content}</div>;
          }
          if (entry.type === 'info') {
            return <div key={entry.id} className="text-[#94a3b8]">{entry.content}</div>;
          }
          return <div key={entry.id} className="text-[#e2e8f0]">{entry.content}</div>;
        })}

        {/* Input Prompt Line */}
        <form onSubmit={handleCommandSubmit} className="flex items-center gap-1 mt-0.5">
          <span className="text-[#22d3ee] shrink-0">{currentPrompt}</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 bg-transparent text-[#e2e8f0] font-mono-cyber text-[11px] focus:outline-none"
            spellCheck={false}
            autoComplete="off"
          />
          <span className="w-1.5 h-3 bg-[#e2e8f0] animate-pulse"></span>
        </form>
      </div>

      {/* Bottom Toolbar */}
      <div className="px-3 py-1 border-t border-[#22d3ee]/20 flex justify-between text-[10px] font-mono-cyber text-[#22d3ee]/60">
        <span
          onClick={() => {
            sound.playClick();
            setEntries([]);
          }}
          className="cursor-pointer hover:text-[#22d3ee] transition"
        >
          CLEAR
        </span>
        <div className="flex gap-4">
          <span
            onClick={() => {
              sound.playClick();
              setInputVal('help');
            }}
            className="cursor-pointer hover:text-[#22d3ee] transition"
          >
            HISTORY
          </span>
          <span
            onClick={() => {
              sound.playClick();
              onMaximize();
            }}
            className="cursor-pointer hover:text-[#22d3ee] transition font-bold"
          >
            MAXIMIZE
          </span>
        </div>
      </div>
    </div>
  );
};
