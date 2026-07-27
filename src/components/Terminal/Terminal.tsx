import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { useAuth } from '../../context/AuthContext';

interface TerminalProps {
  onCommand?: (command: string) => void;
  initialPath?: string;
}

const Terminal: React.FC<TerminalProps> = ({ onCommand, initialPath = '~' }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { user } = useAuth();
  
  const promptString = `\x1b[1;36m${user?.username || 'operator'}@cyber-academy\x1b[0m:\x1b[1;35m${initialPath}\x1b[0m$ `;

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm
    const term = new XTerm({
      cursorBlink: true,
      fontFamily: '"Fira Code", monospace',
      fontSize: 14,
      theme: {
        background: '#0d0d12', // Near-black to match our tailwind config
        foreground: '#e2e2e8', // Off-white main text
        cursor: '#00f0ff', // Neon cyan cursor
        cursorAccent: '#0d0d12',
        selectionBackground: 'rgba(0, 240, 255, 0.3)',
        black: '#0d0d12',
        red: '#ff2a2a',
        green: '#39ff14',
        yellow: '#ffb000',
        blue: '#00f0ff',
        magenta: '#ff00ff',
        cyan: '#00f0ff',
        white: '#e2e2e8',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln('Initialize sequence... [OK]');
    term.writeln('Secure connection established.');
    term.writeln('Type "help" for a list of commands.\r\n');
    term.write(promptString);

    let currentInput = '';

    term.onData((data) => {
      const char = data;

      // Handle Enter
      if (char === '\r') {
        term.write('\r\n');
        
        const trimmedCmd = currentInput.trim();
        if (trimmedCmd) {
          handleCommand(trimmedCmd, term);
          if (onCommand) onCommand(trimmedCmd);
        }
        
        currentInput = '';
        term.write(promptString);
      }
      // Handle Backspace
      else if (char === '\x7f') {
        if (currentInput.length > 0) {
          currentInput = currentInput.slice(0, -1);
          term.write('\b \b');
        }
      }
      // Handle printable characters
      else {
        currentInput += char;
        term.write(char);
      }
    });

    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  const handleCommand = (cmd: string, term: XTerm) => {
    const [command] = cmd.split(' ');

    switch (command.toLowerCase()) {
      case 'help':
        term.writeln('Available simulated commands:');
        term.writeln('  \x1b[36mhelp\x1b[0m    - Show this message');
        term.writeln('  \x1b[36mclear\x1b[0m   - Clear the terminal');
        term.writeln('  \x1b[36mwhoami\x1b[0m  - Print current user');
        term.writeln('  \x1b[36mdate\x1b[0m    - Print current date and time');
        break;
      case 'clear':
        term.clear();
        break;
      case 'whoami':
        term.writeln(user?.username || 'anonymous_operator');
        break;
      case 'date':
        term.writeln(new Date().toString());
        break;
      case 'nmap':
        term.writeln('\x1b[33mWarning: Simulated nmap execution. Target out of scope.\x1b[0m');
        break;
      default:
        term.writeln(`\x1b[31mbash: ${command}: command not found\x1b[0m`);
    }
  };

  return (
    <div className="w-full h-full p-4 bg-background border border-primary/20 rounded shadow-neon overflow-hidden">
      <div className="h-full w-full" ref={terminalRef} />
    </div>
  );
};

export default Terminal;
