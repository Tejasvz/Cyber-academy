import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { useAuth } from '../../context/AuthContext';
import { type Lesson, executeTerminalCommand } from '../../services/curriculumService';
import { useAudioStore } from '../../store/audioStore';

interface TerminalProps {
  activeLesson: Lesson | null;
  onSuccess?: (flag: string) => void;
  onCommand?: (cmd: string) => void;
  onFailure?: () => void;
  completed?: boolean;
  width?: number;
  height?: number;
}

const Terminal: React.FC<TerminalProps> = ({ activeLesson, onSuccess, onCommand, onFailure, width, height }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { user, token } = useAuth();
  const { playUiClick, playFailureSweep } = useAudioStore();

  // Command History Buffer References
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  
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
      fontSize: 13,
      theme: {
        background: '#0a0a0f',
        foreground: '#00f0ff',
        cursor: '#00f0ff',
        cursorAccent: '#0a0a0f',
        selectionBackground: 'rgba(0, 240, 255, 0.3)',
        black: '#0a0a0f',
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
      // Handle Up/Down Arrow history navigation
      else if (data.startsWith('\x1b')) {
        const history = historyRef.current;
        if (data === '\x1b[A' && history.length > 0) { // Up Arrow
          playUiClick();
          let idx = historyIndexRef.current;
          if (idx === -1) {
            idx = history.length - 1;
          } else {
            idx = Math.max(0, idx - 1);
          }
          historyIndexRef.current = idx;

          // Clear current input on screen
          for (let i = 0; i < currentInput.length; i++) {
            term.write('\b \b');
          }
          currentInput = history[idx];
          term.write(currentInput);
        } else if (data === '\x1b[B') { // Down Arrow
          playUiClick();
          let idx = historyIndexRef.current;
          if (idx !== -1) {
            // Clear current input on screen
            for (let i = 0; i < currentInput.length; i++) {
              term.write('\b \b');
            }

            if (idx < history.length - 1) {
              idx++;
              historyIndexRef.current = idx;
              currentInput = history[idx];
              term.write(currentInput);
            } else {
              historyIndexRef.current = -1;
              currentInput = '';
            }
          }
        }
      }
      // Handle character input
      else {
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
    const cmdClean = cmdStr.toLowerCase().trim();
    
    // Check if we are executing a boot scan or local status check during reboot phase
    const isBootCmd = !lesson && (cmdClean === 'nmap 127.0.0.1' || cmdClean === 'veil_status' || cmdClean === 'help');

    if (!lesson && !isBootCmd) {
      term.writeln('[-] No active hacking lab selected to execute commands.');
      term.write(getPromptString());
      return;
    }

    // Save to command history buffer
    historyRef.current.push(cmdStr);
    historyIndexRef.current = -1;

    // Trigger external command hook if provided
    if (onCommand) onCommand(cmdStr);

    const cmdLower = cmdStr.toLowerCase().trim();

    // Local loopback UI scanning simulation for the reboot phase
    if (cmdLower === 'nmap 127.0.0.1' && !lesson) {
      playUiClick();
      term.writeln('\r\nStarting Nmap 7.92 ( https://nmap.org ) at 2026-07-31 10:55 UTC');
      term.writeln('Scanning localhost (127.0.0.1)...');
      term.writeln('Host is up (0.0001s latency).');
      term.writeln('PORT     STATE SERVICE');
      
      const ports = [
        { port: '80/tcp', service: 'http-curriculum', win: 'curriculum' },
        { port: '443/tcp', service: 'https-ai-daemon', win: 'ai_assistant' },
        { port: '8080/tcp', service: 'http-conspiracy-board', win: 'conspiracy' },
        { port: '9000/tcp', service: 'http-grid-map', win: 'world_map' },
      ];
      
      ports.forEach((p, idx) => {
        setTimeout(() => {
          term.writeln(`${p.port.padEnd(9)} open  ${p.service}`);
          if (onCommand) {
            onCommand(`discover_${p.win}`);
          }
        }, (idx + 1) * 800);
      });
      
      setTimeout(() => {
        term.writeln('\r\n\x1b[1;32m[+] Visual interface endpoints discovered successfully.\x1b[0m');
        term.writeln('\x1b[1;36m[AURELIA] "Connecting UI modules... System fully restored."\x1b[0m\r\n');
        term.write(getPromptString().trimStart());
        if (onCommand) {
          onCommand('boot_completed');
        }
      }, (ports.length + 1) * 800);
      
      return;
    }

    // 1. Local Tactical OS Command Interceptors
    if (cmdLower === 'veil_status') {
      playUiClick();
      term.writeln('\r\n\x1b[1;36m[VEIL SECTOR GRID STATUS - SYSTEM TELEMETRY]\x1b[0m');
      term.writeln('ACTIVE GATEWAY: SEC_ZERO_BRIDGE (CONNECTED)');
      term.writeln('LATTICE STRENGTH: 94.62%  |  LATENCY: 0.0035s');
      term.writeln('DECRYPTION DIRECTORY MAPS: LOCKED [Sector 1-4]');
      term.writeln('\x1b[1;32mSYS_STATUS: STANDBY (AURELIA DAEMON ROUTING STABLE)\x1b[0m');
      term.write(getPromptString());
      return;
    }

    if (cmdLower === 'sys_decrypt') {
      playUiClick();
      term.writeln('\r\n\x1b[1;33m[DECRYPTING ACTIVE SYNDICATE NETWORK PATHS...]\x1b[0m');
      term.writeln('Scanning synaptic buffers... OK');
      term.writeln('Checking gateway authentication keys... OK');
      term.writeln(`Current Cleared Target Nodes: ${Array.from(user?.xp ? [1] : []).length}`);
      term.writeln('\x1b[1;36m[AURELIA] Hint: Submit lesson flags inside the Operator database to decrypt sectors.\x1b[0m');
      term.write(getPromptString());
      return;
    }

    if (cmdLower === 'help') {
      playUiClick();
      term.writeln('\r\n\x1b[1;36m[AETHER CODES OS TERMINAL SHELL - V2.6]\x1b[0m');
      term.writeln('Local classified commands:');
      term.writeln('  help           - Display available commands reference');
      term.writeln('  clear          - Clear terminal screen buffer');
      term.writeln('  veil_status    - Query current neural connection metrics');
      term.writeln('  sys_decrypt    - Telemetry active sector bypass levels');
      term.writeln('\r\nRange binaries / lab executables:');
      term.writeln('  ls             - List directory elements');
      term.writeln('  cat <file>     - Print target file content');
      term.writeln('  nmap <host>    - Analyze target network port bindings');
      term.writeln('  curl <url>     - Fetch network resource streams');
      term.writeln('  hashcat <hash> - Crack cryptographic hash strings');
      term.write(getPromptString());
      return;
    }

    if (cmdLower === 'clear') {
      term.clear();
      term.write(getPromptString().trimStart());
      return;
    }

    if (!lesson) return;
    try {
      const res = await executeTerminalCommand(lesson.id, cmdStr, token || '');
      
      if (res.output) {
        term.write(res.output);

        // Implicit Shell Flag Interceptor
        const flagRegex = /flag\{[A-Za-z0-9_\-+#@$!%*?&|:;]+\}/g;
        const matches = res.output.match(flagRegex);
        if (matches && matches.length > 0 && onSuccess) {
          const discoveredFlag = matches[0];
          setTimeout(() => {
            term.writeln('\r\n\x1b[1;32m[+] INTERCEPTED SECURITY FLAG: ' + discoveredFlag + '\x1b[0m');
            term.writeln('\x1b[1;36m[AURELIA] "Sector decrypted. Submitting flag verification key..."\x1b[0m\r\n');
            onSuccess(discoveredFlag);
          }, 600);
        }
      }

      currentDirRef.current = res.currentDir;
      isRootShellRef.current = res.isRootShell;
      isSubShellRef.current = res.isSubShell;
      isInterceptStateRef.current = res.isInterceptState;

    } catch (error) {
      console.error('Command execution failed:', error);
      playFailureSweep();
      term.writeln('\r\n[-] Error: Command execution failed. Connection to cyber range node lost.');
      if (onFailure) {
        onFailure();
      }
    }

    term.write(getPromptString());
  };

  return (
    <div className="w-full h-full p-4 bg-[#0a0a0f] border border-primary/20 rounded shadow-[0_0_20px_rgba(0,240,255,0.1)] overflow-hidden relative CRT-glow">
      {/* CRT Scanline grid */}
      <div 
        className="absolute inset-0 pointer-events-none z-30 opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 4px, 6px 100%',
        }}
      />
      {/* CRT Glass reflection curve */}
      <div className="absolute inset-0 pointer-events-none z-30 bg-gradient-to-tr from-transparent via-primary/[0.02] to-transparent" />
      {/* Dynamic Screen Flicker Overlay */}
      <div className="absolute inset-0 pointer-events-none z-30 opacity-[0.03] bg-primary animate-[flicker_0.15s_infinite]" />
      
      {/* XTerm container */}
      <div className="h-full w-full relative z-20" ref={terminalRef} />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flicker {
          0% { opacity: 0.015; }
          50% { opacity: 0.025; }
          100% { opacity: 0.015; }
        }
      `}} />
    </div>
  );
};

export default Terminal;
