import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { useAuth } from '../../context/AuthContext';
import { type Lesson, executeTerminalCommand } from '../../services/curriculumService';

interface TerminalProps {
  activeLesson: Lesson | null;
  onSuccess?: (flag: string) => void;
  completed?: boolean;
  width?: number;
  height?: number;
}

const Terminal: React.FC<TerminalProps> = ({ activeLesson, width, height }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { user, token } = useAuth();
  
  // Refs to prevent stale closures in xterm listeners
  const activeLessonRef = useRef<Lesson | null>(activeLesson);
  const currentDirRef = useRef<string>('~');
  const isRootShellRef = useRef<boolean>(false);
  const isSubShellRef = useRef<boolean>(false);
  const isInterceptStateRef = useRef<boolean>(false);

  // Sync props to refs
  useEffect(() => { activeLessonRef.current = activeLesson; }, [activeLesson]);

  const getPromptString = () => {
    if (isInterceptStateRef.current) {
      return '';
    }
    if (isRootShellRef.current) {
      return `\r\n\x1b[1;31mroot@cyber-academy\x1b[0m:\x1b[1;35m/root\x1b[0m# `;
    }
    if (isSubShellRef.current) {
      return `\r\n\x1b[1;32m$\x1b[0m `;
    }
    const path = currentDirRef.current;
    return `\r\n\x1b[1;36m${user?.username || 'operator'}@cyber-academy\x1b[0m:\x1b[1;35m${path}\x1b[0m$ `;
  };

  // Reset terminal environment when active lesson changes
  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      currentDirRef.current = '~';
      isRootShellRef.current = false;
      isSubShellRef.current = false;
      isInterceptStateRef.current = false;

      if (activeLesson) {
        xtermRef.current.writeln(`\x1b[1;35m[SYSTEM] Loaded Hacking Lab: [${activeLesson.id}] ${activeLesson.title}\x1b[0m`);
        xtermRef.current.writeln(`\x1b[1;32m[SYSTEM] Hacking environment fully prepared. Type 'help' for available tools.\x1b[0m`);
        
        // Custom greeting message based on active lesson
        if (activeLesson.id === 'B01') {
          xtermRef.current.writeln(`\x1b[36m[LAB] Found 1 file in home directory: traffic_dump.pcap. Extract the plaintext password!\x1b[0m`);
        } else if (activeLesson.id === 'B02') {
          xtermRef.current.writeln(`\x1b[36m[LAB] Learn CLI basic navigation. Hint: archives directory holds hidden flag files.\x1b[0m`);
        } else if (activeLesson.id === 'B05') {
          xtermRef.current.writeln(`\x1b[36m[LAB] Target MD5 hash saved in 'hash.txt'. Search 'wordlist.txt' to crack it.\x1b[0m`);
        } else if (activeLesson.id === 'B07') {
          xtermRef.current.writeln(`\x1b[36m[LAB] Simulated email spool loaded in 'emails.txt'. Find the phishing flag.\x1b[0m`);
        } else if (activeLesson.id === 'B08') {
          xtermRef.current.writeln(`\x1b[33m[BOSS] Beginner Tier Boss Fight. Chain Nmap scanning, Curl source analysis, and Hashcat dictionary attacks to breach the target portal!\x1b[0m`);
        } else if (activeLesson.id === 'M08') {
          xtermRef.current.writeln(`\x1b[33m[BOSS] Mediator Tier Boss Fight. Chain SQL Injection auth bypasses, LFI path traversals, and SUID find breakouts to claim the root flag!\x1b[0m`);
        } else if (activeLesson.id === 'A07') {
          xtermRef.current.writeln(`\x1b[31m[BOSS] Advanced Tier Boss Fight: Enterprise Network Takeover. Chain Time-Based SQLi, Cloud SSRF, OS command injection, and AV signature bypasses to compromise the enterprise root domain!\x1b[0m`);
        }
      } else {
        xtermRef.current.writeln('Awaiting module selection... Choose a tier on the right side menu.');
      }
      xtermRef.current.write(getPromptString().trimStart());
    }
  }, [activeLesson]);

  // Fit terminal when dimensions change (e.g. from parent OS window resizing)
  useEffect(() => {
    if (fitAddonRef.current) {
      const timer = setTimeout(() => {
        try {
          fitAddonRef.current?.fit();
        } catch (e) {
          console.warn('Fitting terminal failed:', e);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [width, height]);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm
    const term = new XTerm({
      cursorBlink: true,
      fontFamily: '"Fira Code", monospace',
      fontSize: 14,
      theme: {
        background: '#0d0d12',
        foreground: '#e2e2e8',
        cursor: '#00f0ff',
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
    term.write(`\x1b[1;36m${user?.username || 'operator'}@cyber-academy\x1b[0m:\x1b[1;35m~\x1b[0m$ `);

    let currentInput = '';

    term.onData((data) => {
      // Handle backspace
      if (data === '\x7f') {
        if (currentInput.length > 0) {
          currentInput = currentInput.slice(0, -1);
          term.write('\b \b');
        }
      } 
      // Handle enter
      else if (data === '\r') {
        term.write('\r\n');
        const cmd = currentInput.trim();
        currentInput = '';

        if (cmd) {
          handleCommand(cmd, term);
        } else {
          term.write(getPromptString());
        }
      } 
      // Handle character input
      else {
        // Exclude special characters (like arrow keys) from currentInput
        if (data.charCodeAt(0) >= 32 && data.charCodeAt(0) < 127) {
          currentInput += data;
          term.write(data);
        }
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

  const handleCommand = async (cmdStr: string, term: XTerm) => {
    const lesson = activeLessonRef.current;
    if (!lesson) {
      term.writeln('[-] No active hacking lab selected to execute commands.');
      term.write(getPromptString());
      return;
    }

    try {
      // Execute command on server-side simulator
      const res = await executeTerminalCommand(lesson.id, cmdStr, token || '');
      
      // Output result to console buffer
      if (res.output) {
        term.write(res.output);
      }

      // Sync local prompt variables with the updated session state
      currentDirRef.current = res.currentDir;
      isRootShellRef.current = res.isRootShell;
      isSubShellRef.current = res.isSubShell;
      isInterceptStateRef.current = res.isInterceptState;

      if (cmdStr.toLowerCase() === 'clear') {
        term.clear();
      }
    } catch (error) {
      console.error('Command execution failed:', error);
      term.writeln('\r\n[-] Error: Command execution failed. Connection to cyber range node lost.');
    }

    term.write(getPromptString());
  };

  return (
    <div className="w-full h-full p-4 bg-background border border-primary/20 rounded shadow-neon overflow-hidden">
      <div className="h-full w-full" ref={terminalRef} />
    </div>
  );
};

export default Terminal;
