import React, { useState, useRef, useEffect } from 'react';
import { X, Terminal as TerminalIcon, RotateCcw } from 'lucide-react';
import type { TerminalEntry } from '../../types';
import { sound } from '../../utils/audioSynth';

interface FullTerminalModalProps {
  onClose: () => void;
  onVerifyFlag?: (flag: string) => void;
}

export const FullTerminalModal: React.FC<FullTerminalModalProps> = ({ onClose, onVerifyFlag }) => {
  const [entries, setEntries] = useState<TerminalEntry[]>([
    { id: '1', type: 'prompt', content: 'operator@veil:~$ connect sector-zero' },
    { id: '2', type: 'info', content: 'Establishing secure link...' },
    { id: '3', type: 'success', content: 'Connected.' },
    { id: '4', type: 'prompt', content: 'operator@sector-zero:~$ ls' },
    { id: '5', type: 'output', content: 'substation_logs/  firewall.conf  nodes/  aether_core.bin' },
    { id: '6', type: 'prompt', content: 'operator@sector-zero:~$ cat firewall.conf' },
    { id: '7', type: 'warning', content: '<RESTRICTED - PORT 443 BLOCK>' },
    { id: '8', type: 'prompt', content: 'operator@sector-zero:~$ status' },
    { id: '9', type: 'success', content: 'SYSTEM STATUS: 78% OPERATIONAL | SECURE CHANNEL: ACTIVE' },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [promptStr] = useState('operator@sector-zero:~$');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    sound.playKeypress();
    const cmd = inputVal.trim();
    const newPromptEntry: TerminalEntry = {
      id: Date.now().toString(),
      type: 'prompt',
      content: `${promptStr} ${cmd}`,
    };

    let newResponses: TerminalEntry[] = [];
    const lower = cmd.toLowerCase();

    if (lower.startsWith('flag') || lower.startsWith('submit')) {
      const flagPart = cmd.split(' ')[1] || cmd;
      if (onVerifyFlag) {
        onVerifyFlag(flagPart);
      }
      newResponses = [
        { id: (Date.now() + 1).toString(), type: 'info', content: `Verifying flag parameter: ${flagPart}...` },
      ];
    } else if (lower === 'clear') {
      setEntries([]);
      setInputVal('');
      return;
    } else if (lower === 'help') {
      newResponses = [
        { id: (Date.now() + 1).toString(), type: 'info', content: 'MAXIMIZED TERMINAL COMMAND LIST:' },
        { id: (Date.now() + 2).toString(), type: 'output', content: '  status       - System health overview' },
        { id: (Date.now() + 3).toString(), type: 'output', content: '  ls           - List files and subdirectories' },
        { id: (Date.now() + 4).toString(), type: 'output', content: '  cat <file>   - Output content of specified file' },
        { id: (Date.now() + 5).toString(), type: 'output', content: '  flag <val>   - Submit flag for mission verification' },
        { id: (Date.now() + 6).toString(), type: 'output', content: '  override     - Trigger firewall exploit sequence' },
        { id: (Date.now() + 7).toString(), type: 'output', content: '  clear        - Clear console buffer' },
      ];
    } else if (lower === 'override') {
      newResponses = [
        { id: (Date.now() + 1).toString(), type: 'warning', content: 'Executing quantum handshake override on port 443...' },
        { id: (Date.now() + 2).toString(), type: 'success', content: 'Substation firewall node overridden successfully!' },
      ];
    } else {
      newResponses = [
        { id: (Date.now() + 1).toString(), type: 'output', content: `[COMMAND PARSED]: ${cmd}` },
      ];
    }

    setEntries((prev) => [...prev, newPromptEntry, ...newResponses]);
    setInputVal('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-[#030816]/90 backdrop-blur-lg select-none">
      <div className="glass-panel border-[#22d3ee] rounded-lg w-full max-w-5xl h-[85vh] flex flex-col shadow-neon-cyan overflow-hidden">
        {/* Header */}
        <div className="panel-header px-5 py-3 flex justify-between items-center border-b border-[#22d3ee]/30">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-5 h-5 text-[#22d3ee]" />
            <span className="text-[#22d3ee] font-bold text-sm tracking-widest font-mono-cyber">
              TERMINAL CONSOLE // MAXIMIZED WORKSTATION
            </span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-[#22d3ee] hover:text-[#f87171] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Console Window Content */}
        <div
          ref={scrollRef}
          className="flex-1 p-5 overflow-y-auto font-mono-cyber text-xs leading-relaxed space-y-1.5 bg-[#030816]/80 text-[#e2e8f0]"
        >
          {entries.map((entry) => {
            if (entry.type === 'prompt') {
              return (
                <div key={entry.id}>
                  <span className="text-[#22d3ee] font-bold">{entry.content.split(' ')[0]}</span>{' '}
                  <span>{entry.content.split(' ').slice(1).join(' ')}</span>
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
            return <div key={entry.id} className="text-[#94a3b8]">{entry.content}</div>;
          })}

          <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2">
            <span className="text-[#22d3ee] font-bold shrink-0">{promptStr}</span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 bg-transparent text-[#e2e8f0] font-mono-cyber text-xs focus:outline-none"
              autoFocus
              spellCheck={false}
            />
            <span className="w-2 h-4 bg-[#e2e8f0] animate-pulse"></span>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-[#22d3ee]/30 bg-[#0c1324] flex justify-between items-center text-xs font-mono-cyber">
          <div className="flex gap-4 text-[#22d3ee]/70">
            <button
              onClick={() => {
                sound.playClick();
                setEntries([]);
              }}
              className="hover:text-[#22d3ee] transition flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>CLEAR BUFFER</span>
            </button>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-1.5 border border-[#22d3ee] text-[#22d3ee] bg-[#22d3ee]/10 rounded hover:bg-[#22d3ee]/25 transition"
          >
            RESTORE WINDOW
          </button>
        </div>
      </div>
    </div>
  );
};
