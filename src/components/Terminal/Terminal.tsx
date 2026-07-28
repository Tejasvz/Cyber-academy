import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { useAuth } from '../../context/AuthContext';
import { type Lesson } from '../../services/curriculumService';

interface TerminalProps {
  activeLesson: Lesson | null;
  onSuccess?: (flag: string) => void;
  completed?: boolean;
  width?: number;
  height?: number;
}

const Terminal: React.FC<TerminalProps> = ({ activeLesson, onSuccess, completed, width, height }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { user } = useAuth();
  
  // Refs to prevent stale closures in xterm listeners
  const activeLessonRef = useRef<Lesson | null>(activeLesson);
  const currentDirRef = useRef<string>('~');
  const isRootShellRef = useRef<boolean>(false);
  const isSubShellRef = useRef<boolean>(false);
  const isInterceptStateRef = useRef<boolean>(false);
  const onSuccessRef = useRef<((flag: string) => void) | undefined>(onSuccess);
  const completedRef = useRef<boolean | undefined>(completed);

  // Sync props to refs
  useEffect(() => { activeLessonRef.current = activeLesson; }, [activeLesson]);
  useEffect(() => { onSuccessRef.current = onSuccess; }, [onSuccess]);
  useEffect(() => { completedRef.current = completed; }, [completed]);

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

        if (isInterceptStateRef.current) {
          handleInterceptInput(cmd, term);
        } else if (cmd) {
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

  const handleInterceptInput = (input: string, term: XTerm) => {
    isInterceptStateRef.current = false;
    if (input === '0' || input === '1') {
      term.writeln(`\r\n\x1b[32m[+] Forwarding modified request: {"item_id":"cyber-jacket","price":${input}}...\x1b[0m`);
      term.writeln('\x1b[35m[SERVER RESPONSE] 200 OK\x1b[0m');
      term.writeln('\x1b[35m{\x1b[0m');
      term.writeln('\x1b[35m  "status": "success",\x1b[0m');
      term.writeln('\x1b[35m  "transaction_id": "TXN-9812",\x1b[0m');
      term.writeln(`\x1b[35m  "flag": "flag{proxy_parameter_tampering}"\x1b[0m`);
      term.writeln('\x1b[35m}\x1b[0m');
      term.writeln('\r\n\x1b[1;32m[+] Vulnerability successfully exploited! Submit the flag above.\x1b[0m');
    } else {
      term.writeln(`\r\n[-] Forwarding unmodified request: {"item_id":"cyber-jacket","price":499}...`);
      term.writeln('\x1b[31m[SERVER RESPONSE] 400 Bad Request\x1b[0m');
      term.writeln('\x1b[31m{ "error": "Insufficient account balance" }\x1b[0m');
      term.writeln('\r\n\x1b[33m[!] Try changing the price to 0 or 1 next time.\x1b[0m');
    }
    term.write(getPromptString());
  };

  const handleCommand = (cmdStr: string, term: XTerm) => {
    const parts = cmdStr.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    const lesson = activeLessonRef.current;

    // Standard shell files configuration mapping
    const checkFileExists = (filename: string): { exists: boolean; content: string } => {
      if (!lesson) return { exists: false, content: '' };
      
      if (lesson.id === 'B01' && filename === 'traffic_dump.pcap' && currentDirRef.current === '~') {
        return {
          exists: true,
          content: `=== PACKET DUMP (HTTP SESSION) ===\r\nPacket #1: [TCP Handshake SYN] 192.168.1.10 -> 10.10.12.5 (Port 80)\r\nPacket #2: [TCP Handshake SYN-ACK] 10.10.12.5 -> 192.168.1.10\r\nPacket #3: [TCP Handshake ACK] 192.168.1.10 -> 10.10.12.5\r\nPacket #4: [HTTP GET /] 192.168.1.10 -> 10.10.12.5\r\nPacket #5: [HTTP 200 OK] (application/html)\r\nPacket #6: [HTTP POST /login] 192.168.1.10 -> 10.10.12.5\r\n  Host: bank.insecure-traffic.local\r\n  Content-Type: application/x-www-form-urlencoded\r\n  \r\n  POSTDATA: username=admin&password=flag{pcap_sniff_success}&submit=Login\r\nPacket #7: [HTTP 302 Found] Redirect to /dashboard\r\n==================================`
        };
      }
      if (lesson.id === 'B02' && filename === 'hint.txt' && currentDirRef.current === '~') {
        return { exists: true, content: 'Try exploring hidden files in the archives folder! Use "ls -a" to see hidden files, "cd archives" to enter it, and "cat .flag.txt" to view contents.' };
      }
      if (lesson.id === 'B02' && filename === '.flag.txt' && currentDirRef.current === '~/archives') {
        return { exists: true, content: 'flag{cli_funda_master}' };
      }
      if (lesson.id === 'B05' && filename === 'hash.txt' && currentDirRef.current === '~') {
        return { exists: true, content: 'e59cd9086abb32e185ca1891124892c9' };
      }
      if (lesson.id === 'B05' && filename === 'wordlist.txt' && currentDirRef.current === '~') {
        return { exists: true, content: 'password123\r\nadmin\r\nqwerty\r\nwelcome\r\nflag{hash_cracked_secret}\r\nletmein\r\nshadow' };
      }
      if (lesson.id === 'B07' && filename === 'emails.txt' && currentDirRef.current === '~') {
        return {
          exists: true,
          content: 'Email ID: 1\r\nFrom: accounting@cyberacademy.com\r\nTo: operator@cyberacademy.com\r\nSubject: Q2 Budget Report Review\r\n---\r\nEmail ID: 2\r\nFrom: support@micr0s0ft-security-update.com\r\nTo: operator@cyberacademy.com\r\nSubject: ACTION REQUIRED: Reset password immediately\r\n---\r\nEmail ID: 3\r\nFrom: notifications@github.local\r\nTo: operator@cyberacademy.com\r\nSubject: Security Advisory'
        };
      }
      if (lesson.id === 'B08' && filename === 'hash.txt' && currentDirRef.current === '~') {
        return { exists: true, content: '772f7d9812a8123ab49a37c0938478ff' };
      }
      if (lesson.id === 'B08' && filename === 'wordlist.txt' && currentDirRef.current === '~') {
        return { exists: true, content: 'password\r\nadmin\r\nletmein\r\nflag{beginner_boss_defeated}\r\nshadow' };
      }
      if (lesson.id === 'M08' && filename === 'readme.txt' && currentDirRef.current === '~') {
        return { exists: true, content: 'Welcome to the Mediator Boss Challenge. Targets are internal web portals and system binaries.' };
      }
      return { exists: false, content: '' };
    };

    // Subshell command evaluation (Overflow binary shell)
    if (isSubShellRef.current) {
      if (command === 'cat' && args[0] === 'flag.txt') {
        term.writeln('flag{stack_overflow_eip_hijack}');
      } else if (command === 'ls') {
        term.writeln('flag.txt  vulnerable_binary  vulnerable_binary.c');
      } else if (command === 'exit') {
        isSubShellRef.current = false;
        term.writeln('Connection closed. Returned to normal shell.');
      } else {
        term.writeln(`sh: ${command}: command not found`);
      }
      term.write(getPromptString());
      return;
    }

    // Helper warnings for running lesson commands outside the correct context
    const checkLessonContext = (expectedIds: string[], cmdName: string): boolean => {
      if (!lesson || !expectedIds.includes(lesson.id)) {
        term.writeln(`\x1b[33m[WARNING] '${cmdName}' is only available in specific labs (e.g. [${expectedIds.join(', ')}]).\x1b[0m`);
        return false;
      }
      return true;
    };

    switch (command) {
      case 'help':
        term.writeln('Available core shell commands:');
        term.writeln('  \x1b[36mhelp\x1b[0m                  - Show this help message');
        term.writeln('  \x1b[36mclear\x1b[0m                 - Clear the terminal screen');
        term.writeln('  \x1b[36mwhoami\x1b[0m                - Display active user alias');
        term.writeln('  \x1b[36mdate\x1b[0m                  - Print current date and time');
        term.writeln('  \x1b[36mpwd\x1b[0m                   - Print current directory');
        term.writeln('  \x1b[36mls\x1b[0m                    - List files (`ls -a` for hidden)');
        term.writeln('  \x1b[36mcd <dir>\x1b[0m              - Change directories');
        term.writeln('  \x1b[36mcat <file>\x1b[0m            - Read file contents');
        term.writeln('  \x1b[36mgrep <word> <file>\x1b[0m    - Search text in files');
        term.writeln('  \x1b[36mstrings <file>\x1b[0m        - Extract text strings from binary files');
        term.writeln('  \x1b[36msubmit <flag>\x1b[0m         - Submit lesson flag (e.g. submit flag{...})');
        
        if (lesson) {
          term.writeln('\r\nModule Hacking Commands for current environment:');
          if (lesson.id === 'B03') {
            term.writeln('  \x1b[33mwhois <domain>\x1b[0m        - Query domain registration registry');
            term.writeln('  \x1b[33mnslookup <domain>\x1b[0m     - Domain query tool (`-type=txt` supported)');
            term.writeln('  \x1b[33mdig <domain>\x1b[0m          - Domain lookup tool (`-t txt` supported)');
          } else if (lesson.id === 'B04' || lesson.id === 'B08') {
            term.writeln('  \x1b[33mnmap <ip>\x1b[0m             - Port scanner (`-sS` supported)');
          } else if (lesson.id === 'B05' || lesson.id === 'B08') {
            term.writeln('  \x1b[33mhashcat <hash> <dict>\x1b[0m - Crack MD5 password hashes (-m 0 supported)');
            term.writeln('  \x1b[33mjohn <hash> --wordlist\x1b[0m- Crack hashes using a dictionary file');
          } else if (lesson.id === 'B06' || lesson.id === 'B08' || lesson.id === 'M05' || lesson.id === 'M08' || lesson.id === 'A02' || lesson.id === 'A05') {
            term.writeln('  \x1b[33mcurl <url>\x1b[0m            - Send HTTP requests or interact with local directories');
          } else if (lesson.id === 'B07') {
            term.writeln('  \x1b[33manalyze-email <id>\x1b[0m    - Inspect header validation (SPF/DKIM) on email ID');
          } else if (lesson.id === 'M01') {
            term.writeln('  \x1b[33mintercept --start\x1b[0m     - Open interactive proxy interception terminal');
          } else if (lesson.id === 'M02') {
            term.writeln('  \x1b[33mexploit --url <url>\x1b[0m   - Send URL vectors with payload script reflections');
          } else if (lesson.id === 'M03' || lesson.id === 'M08') {
            term.writeln('  \x1b[33mexploit-login --username <user> --password <pass>\x1b[0m - Test login input for SQL bypasses');
          } else if (lesson.id === 'M04') {
            term.writeln('  \x1b[33mhydra -l admin -P <dict> http-post-form <url>\x1b[0m - Brute-force credentials');
          } else if (lesson.id === 'M06') {
            term.writeln('  \x1b[33marpspoof -i eth0 -t <t1> <t2>\x1b[0m - Perform ARP cache poisoning');
          } else if (lesson.id === 'M07' || lesson.id === 'M08') {
            term.writeln('  \x1b[33mfind / -perm -4000 2>/dev/null\x1b[0m - Search files with SUID root flags');
          } else if (lesson.id === 'A01') {
            term.writeln('  \x1b[33msqlmap -u <url> --dump\x1b[0m - Automate SQL database injections');
          } else if (lesson.id === 'A03') {
            term.writeln('  \x1b[33m./vulnerable_binary <payload>\x1b[0m - Run overflow binary test');
          } else if (lesson.id === 'A04') {
            term.writeln('  \x1b[33mGetUserSPNs.py -request -dc-ip <ip> <domain>\x1b[0m - Harvest active directory tickets');
          } else if (lesson.id === 'A06') {
            term.writeln('  \x1b[33mobfuscate --payload <f> --method xor\x1b[0m - Obfuscate payload signatures');
          }
        }
        break;

      case 'clear':
        term.clear();
        break;

      case 'whoami':
        term.writeln(isRootShellRef.current ? 'root' : (user?.username || 'operator'));
        break;

      case 'date':
        term.writeln(new Date().toString());
        break;

      case 'pwd':
        term.writeln(currentDirRef.current === '~' ? '/home/operator' : '/home/operator/archives');
        break;

      case 'ls':
        if (!lesson) {
          term.writeln('readme.txt');
          break;
        }
        const showAll = args.includes('-a') || args.includes('-la');
        if (lesson.id === 'B01') {
          if (showAll) term.writeln('.  ..  traffic_dump.pcap');
          else term.writeln('traffic_dump.pcap');
        } else if (lesson.id === 'B02') {
          if (currentDirRef.current === '~') {
            if (showAll) term.writeln('.  ..  archives/  hint.txt');
            else term.writeln('archives/  hint.txt');
          } else {
            if (showAll) term.writeln('.  ..  .flag.txt');
            else term.writeln('');
          }
        } else if (lesson.id === 'B05') {
          if (showAll) term.writeln('.  ..  hash.txt  wordlist.txt');
          else term.writeln('hash.txt  wordlist.txt');
        } else if (lesson.id === 'B07') {
          if (showAll) term.writeln('.  ..  emails.txt');
          else term.writeln('emails.txt');
        } else if (lesson.id === 'B08') {
          if (showAll) term.writeln('.  ..  hash.txt  wordlist.txt');
          else term.writeln('hash.txt  wordlist.txt');
        } else if (lesson.id === 'M08') {
          if (showAll) term.writeln('.  ..  readme.txt');
          else term.writeln('readme.txt');
        } else {
          if (showAll) term.writeln('.  ..  readme.txt');
          else term.writeln('readme.txt');
        }
        break;

      case 'cd':
        if (!lesson || lesson.id !== 'B02') {
          term.writeln('bash: cd: permission denied or dir empty');
          break;
        }
        const dest = args[0] || '~';
        if (dest === '~' || dest === '/home/operator') {
          currentDirRef.current = '~';
        } else if (dest === '..' || dest === '../') {
          currentDirRef.current = '~';
        } else if (dest === 'archives' || dest === 'archives/' || dest === './archives') {
          currentDirRef.current = '~/archives';
        } else {
          term.writeln(`bash: cd: ${dest}: No such file or directory`);
        }
        break;

      case 'cat':
        if (args.length === 0) {
          term.writeln('cat: missing operand');
          break;
        }
        const fileObj = checkFileExists(args[0]);
        if (fileObj.exists) {
          term.writeln(fileObj.content);
        } else {
          term.writeln(`cat: ${args[0]}: No such file or directory`);
        }
        break;

      case 'grep':
        if (args.length < 2) {
          term.writeln('grep: usage: grep <pattern> <filename>');
          break;
        }
        // clean quote strings
        const pattern = args[0].replace(/['"]/g, '');
        const filename = args[1];
        const grepFile = checkFileExists(filename);
        if (grepFile.exists) {
          const lines = grepFile.content.split('\r\n');
          const matches = lines.filter(line => line.toLowerCase().includes(pattern.toLowerCase()));
          if (matches.length > 0) {
            term.writeln(matches.join('\r\n'));
          }
        } else {
          term.writeln(`grep: ${filename}: No such file or directory`);
        }
        break;

      case 'strings':
        if (args.length === 0) {
          term.writeln('strings: missing filename');
          break;
        }
        const strFile = checkFileExists(args[0]);
        if (strFile.exists) {
          term.writeln(strFile.content);
        } else {
          term.writeln(`strings: ${args[0]}: No such file or directory`);
        }
        break;

      case 'submit':
        if (args.length === 0) {
          term.writeln('Usage: submit <flag>');
          break;
        }
        const flagVal = args[0];
        if (!lesson) {
          term.writeln('\x1b[31m[-] No active lesson selected to submit flags for.\x1b[0m');
          break;
        }
        if (flagVal.toLowerCase() === lesson.flag?.toLowerCase()) {
          term.writeln('\x1b[1;32m[+] Flag verified successfully!\x1b[0m');
          term.writeln('\x1b[1;32m[+] MODULE COMPLETION DETECTED. Decrypting operator credentials (+100 XP gained)...\x1b[0m');
          if (onSuccessRef.current) {
            onSuccessRef.current(flagVal);
          }
        } else {
          term.writeln('\x1b[31m[-] INCORRECT FLAG. Please inspect the logs and payload outcomes more closely.\x1b[0m');
        }
        break;

      // Module B03 Commands
      case 'whois':
        if (!checkLessonContext(['B03'], 'whois')) break;
        if (args[0] === 'corp-target.com') {
          term.writeln('Domain Name: corp-target.com\r\nRegistrant Name: Secure Admin\r\nRegistrant Email: admin@corp-target.com\r\n\r\nDomain Admin Comments:\r\n- DNS TXT record configured for domain verification. Key resides in zone records.\r\n- Flag comment: Note that recon targets often leak data in TXT records.');
        } else {
          term.writeln('No WHOIS results found for: ' + (args[0] || ''));
        }
        break;

      case 'nslookup':
      case 'dig':
        if (!checkLessonContext(['B03'], command)) break;
        const isTXT = args.includes('-type=txt') || args.includes('-t') || args.includes('txt');
        const targetDomain = args.find(a => a.includes('.com'));
        if (targetDomain === 'corp-target.com') {
          if (isTXT) {
            term.writeln('corp-target.com   text = "flag{osint_recon_pro}"\r\ncorp-target.com   text = "v=spf1 include:_spf.google.com ~all"');
          } else {
            term.writeln('Server: 8.8.8.8\r\nAddress: 8.8.8.8#53\r\n\r\nNon-authoritative answer:\r\nName: corp-target.com\r\nAddress: 104.24.8.12');
          }
        } else {
          term.writeln('** server can\'t find domain: ' + (targetDomain || ''));
        }
        break;

      // Module B04 and B08 Commands
      case 'nmap':
        if (!checkLessonContext(['B04', 'B08'], 'nmap')) break;
        const targetIP = args.find(a => !a.startsWith('-'));
        if (targetIP === '10.10.12.34') {
          if (lesson && lesson.id === 'B04') {
            term.writeln('Starting Nmap 7.92 ( https://nmap.org ) at 2026-07-27 12:50 UTC');
            term.writeln('Nmap scan report for 10.10.12.34\r\nHost is up (0.0035s latency).\r\nNot shown: 996 closed tcp ports (reset)\r\nPORT     STATE SERVICE\r\n22/tcp   open  ssh\r\n80/tcp   open  http\r\n443/tcp  open  https\r\n8080/tcp open  http-proxy (Banner: flag{nmap_syn_stealth})\r\n\r\nNmap done: 1 IP address (1 host up) scanned in 1.45 seconds');
          } else {
            // Boss Fight B08 nmap scanning
            term.writeln('Starting Nmap 7.92 ( https://nmap.org ) at 2026-07-27 16:11 UTC');
            term.writeln('Nmap scan report for 10.10.12.34\r\nHost is up (0.0040s latency).\r\nNot shown: 996 closed tcp ports (reset)\r\nPORT     STATE SERVICE\r\n22/tcp   open  ssh\r\n80/tcp   open  http\r\n443/tcp  open  https\r\n8080/tcp open  http-proxy (Banner: http-proxy (vulnerable debug portal))\r\n\r\nNmap done: 1 IP address (1 host up) scanned in 1.50 seconds');
          }
        } else {
          term.writeln(`Host ${targetIP || ''} seems down. If it is up, but blocking ping probes, try -Pn.`);
        }
        break;

      // Module B05 and B08 Commands
      case 'hashcat':
      case 'john':
        if (!checkLessonContext(['B05', 'B08'], command)) break;
        const inputHash = args.find(a => a.includes('hash.txt'));
        const inputDict = args.find(a => a.includes('wordlist.txt'));
        if (inputHash && inputDict) {
          term.writeln('[+] Initializing dictionary cracking engine...');
          term.writeln('[+] Comparing hash values against words in wordlist.txt...');
          term.writeln('\x1b[32m[SUCCESS] Match found!\x1b[0m');
          if (lesson && lesson.id === 'B05') {
            term.writeln('Cracked hash value: \x1b[1;32mflag{hash_cracked_secret}\x1b[0m');
          } else {
            term.writeln('Cracked hash value: \x1b[1;32mflag{beginner_boss_defeated}\x1b[0m');
          }
        } else {
          term.writeln('Usage: hashcat hash.txt wordlist.txt OR john hash.txt --wordlist=wordlist.txt');
        }
        break;

      // Module B06/B08/M05/M08/A02/A05 Curl simulator
      case 'curl':
        const url = args[0] || '';
        if (lesson && lesson.id === 'B06') {
          if (url.includes('login.cyberacademy.local')) {
            term.writeln('<!DOCTYPE html>\r\n<html>\r\n<head>\r\n    <title>Cyber Academy Secure Login</title>\r\n    <!-- DEBUG MODE LOGS -->\r\n    <!-- Dev Note: API key bypass enabled in test framework -->\r\n    <!-- flag{web_source_leak} -->\r\n</head>\r\n<body>\r\n    <h2>System Terminal Gateway</h2>\r\n</body>\r\n</html>');
          } else {
            term.writeln('curl: (7) Failed to connect to host.');
          }
        } else if (lesson && lesson.id === 'B08') {
          if (url.includes('login.cyberacademy.local:8080') || url.includes(':8080')) {
            term.writeln('<!DOCTYPE html>\r\n<html>\r\n<head>\r\n    <title>Staging Administrative Gateway</title>\r\n    <!-- DEBUG ACTIVE: md5_hash = "772f7d9812a8123ab49a37c0938478ff" -->\r\n    <!-- Dev Alert: Do not commit active credentials to production repo! -->\r\n</head>\r\n<body>\r\n    <h2>Sandbox Portal Access</h2>\r\n</body>\r\n</html>');
          } else {
            term.writeln('curl: (7) Failed to connect to host.');
          }
        } else if (lesson && lesson.id === 'M05') {
          if (url.includes('../../etc/passwd')) {
            term.writeln('root:x:0:0:root:/root:/bin/bash\r\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\r\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\r\nflag:x:1001:1001:flag{lfi_passwd_leak}:/home/flag:/bin/bash');
          } else {
            term.writeln('Server response: 200 OK\r\nError: file parameter empty or invalid.');
          }
        } else if (lesson && lesson.id === 'M08') {
          if (url.includes('../../etc/passwd')) {
            term.writeln('root:x:0:0:root:/root:/bin/bash\r\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\r\nfind-exploit:x:1001:1001:SUID find utility available:/home/find-exploit:/bin/bash\r\n\r\n# SYSTEM SUID UTILITIES LIST:\r\n# /usr/bin/find [perms: -rwsr-xr-x owner: root]');
          } else {
            term.writeln('Server response: 200 OK\r\nError: file parameter empty or invalid.');
          }
        } else if (lesson && lesson.id === 'A02') {
          if (url.includes('169.254.169.254/latest/meta-data/iam/security-credentials')) {
            term.writeln('{\r\n  "Code": "Success",\r\n  "LastUpdated": "2026-07-27T12:56:00Z",\r\n  "Type": "AWS-HMAC",\r\n  "AccessKeyId": "ASIA98127391823",\r\n  "SecretAccessKey": "Kj981Hah123/aP928",\r\n  "Token": "flag{ssrf_metadata_exfil}"\r\n}');
          } else {
            term.writeln('Proxy output: Fetch error from downstream host.');
          }
        } else if (lesson && lesson.id === 'A05') {
          if (url.includes(';') || url.includes('&') || url.includes('|')) {
            term.writeln('PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.\r\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.04 ms\r\n--- 127.0.0.1 ping statistics ---\r\n1 packets transmitted, 1 received, 0% packet loss\r\n\r\nExecuting injected command...\r\nflag{command_injection_rce}');
          } else {
            term.writeln('PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.\r\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.04 ms');
          }
        } else {
          term.writeln('curl: (7) Failed to connect to host.');
        }
        break;

      // Module B07 Command
      case 'analyze-email':
        if (!checkLessonContext(['B07'], 'analyze-email')) break;
        if (args[0] === '2') {
          term.writeln('Analyzing Message ID 2:\r\nFrom Domain: micr0s0ft-security-update.com (Warning: Typosquatting / Lookalike domain!)\r\nDKIM Signature: NONE\r\nSPF Status: FAIL (IP 192.16.82.12 not authorized for micr0s0ft-security-update.com)\r\n\r\nVerdict: PHISHING DETECTED.\r\nIndicator Code: flag{phish_header_mismatch}');
        } else {
          term.writeln('Email ID legitimate. SPF/DKIM verification passed.');
        }
        break;

      // Module M01 Command
      case 'intercept':
        if (!checkLessonContext(['M01'], 'intercept')) break;
        if (args[0] === '--start') {
          isInterceptStateRef.current = true;
          term.writeln('\x1b[33m[PROXY] Intercept status: ACTIVE\x1b[0m');
          term.writeln('==================================================');
          term.writeln('POST /checkout HTTP/1.1');
          term.writeln('Host: checkout.cyberacademy.local');
          term.writeln('Content-Type: application/json');
          term.writeln('Content-Length: 38');
          term.writeln('');
          term.writeln('{ "item_id": "cyber-jacket", "price": 499 }');
          term.writeln('==================================================');
          term.write('Enter new value for "price" parameter (current: 499): ');
        } else {
          term.writeln('Usage: intercept --start');
        }
        break;

      // Module M02 Command
      case 'exploit':
        if (!checkLessonContext(['M02'], 'exploit')) break;
        const exploitUrl = args.join(' ');
        if (exploitUrl.includes('<script>') || exploitUrl.includes('alert')) {
          term.writeln('[+] Sending XSS vector to target url...');
          term.writeln('[+] Simulating victim clicks...');
          term.writeln('\x1b[32m[+] Script executed! Cookie exfiltration logs loaded:\x1b[0m');
          term.writeln('Cookie header: \x1b[1;32mflag{xss_cookie_hijack}\x1b[0m');
        } else {
          term.writeln('URL parameters loaded, but no script execution triggered. Make sure you use <script> tags.');
        }
        break;

      // Module M03 and M08 Commands
      case 'exploit-login':
        if (!checkLessonContext(['M03', 'M08'], 'exploit-login')) break;
        const userArgIndex = args.indexOf('--username');
        const userVal = userArgIndex !== -1 ? args[userArgIndex + 1] : '';
        if (userVal.includes('OR 1=1') || userVal.includes("'")) {
          term.writeln('Executing query: SELECT * FROM users WHERE username = \'' + userVal + '\' AND password = \'\'');
          term.writeln('\x1b[32m[+] Authentication bypass successful!\x1b[0m');
          if (lesson && lesson.id === 'M03') {
            term.writeln('Welcome Admin. Admin dashboard flag: \x1b[1;32mflag{sqli_auth_bypass}\x1b[0m');
          } else {
            // Boss Fight M08 SQLi
            term.writeln('Welcome Admin. Logged in as administrator. Session parameter unlocked: \x1b[1;33mfile=../../../../etc/passwd\x1b[0m');
          }
        } else {
          term.writeln('Executing query: SELECT * FROM users WHERE username = \'' + userVal + '\' AND password = \'\'');
          term.writeln('\x1b[31m[-] Authentication failed. Invalid credentials.\x1b[0m');
        }
        break;

      // Module M04 Command
      case 'hydra':
        if (!checkLessonContext(['M04'], 'hydra')) break;
        if (args.includes('wordlist.txt')) {
          term.writeln('[STATUS] Hydra engine starting (16 threads)');
          term.writeln('[STATUS] Performing dictionary attack against administrative console...');
          term.writeln('[80/tcp] [http-post-form] host: 127.0.0.1 login: \x1b[32madmin\x1b[0m password: \x1b[1;32mflag{hydra_brute_force}\x1b[0m');
          term.writeln('[+] Cracked: admin / flag{hydra_brute_force}');
        } else {
          term.writeln('Usage: hydra -l admin -P wordlist.txt http-post-form "/login"');
        }
        break;

      // Module M07 and M08 Commands
      case 'find':
        if (lesson && (lesson.id === 'M07' || lesson.id === 'M08')) {
          if (args.includes('-perm') && args.includes('-4000')) {
            term.writeln('/usr/bin/chsh\r\n/usr/bin/passwd\r\n/usr/bin/find (SUID root flag active!)\r\n/usr/bin/gpasswd');
          } else {
            term.writeln('Usage: find / -perm -4000 2>/dev/null');
          }
        } else {
          term.writeln('find: directory not specified');
        }
        break;

      // Module A01 Command
      case 'sqlmap':
        if (!checkLessonContext(['A01'], 'sqlmap')) break;
        if (args.includes('--dump')) {
          term.writeln('[+] Initiating SQLMap scanner...');
          term.writeln('[+] Target parameter "id" seems to be Injectable (Time-Based Blind SQLi)');
          term.writeln('[+] Retrieving SQLite schema...');
          term.writeln('[+] Dumping Table: flags');
          term.writeln('+-----------------------------+\r\n| flag                        |\r\n+-----------------------------+\r\n| flag{time_based_blind_sqli} |\r\n+-----------------------------+');
        } else {
          term.writeln('Usage: sqlmap -u "http://vulnerable.com/items?id=1" --dump');
        }
        break;

      // Module A03 Command
      case './vulnerable_binary':
        if (!checkLessonContext(['A03'], './vulnerable_binary')) break;
        const payloadStr = args.join(' ');
        if (payloadStr.includes('python') || payloadStr.includes('A'.repeat(30)) || payloadStr.length > 50) {
          term.writeln('Received payload input: ' + payloadStr);
          term.writeln('\x1b[31m[!] WARNING: Stack buffer overflow detected!\x1b[0m');
          term.writeln('[!] Overwriting EBP [0x41414141] and EIP [0xdeadbeef]');
          term.writeln('\x1b[32m[+] Redirecting execution flow... Shellcode executed successfully!\x1b[0m');
          term.writeln('[+] Launching sub-shell...');
          isSubShellRef.current = true;
        } else {
          term.writeln('Binary executed: buffer size 64 bytes. Input too short to trigger overflow.');
        }
        break;

      // Module A04 Command
      case 'getuserspns.py':
        if (!checkLessonContext(['A04'], 'getuserspns.py')) break;
        if (args.includes('-request')) {
          term.writeln('ServicePrincipalName  User      Package  Expiration  Ticket\r\n--------------------  ----      -------  ----------  ------\r\nmssql/db01.corp.local svc-sql   rc4-hmac Never       $krb5tgs$23$*svc-sql$*corp.local$*mssql/db01*$flag{kerberoast_ad_ticket}');
        } else {
          term.writeln('Usage: GetUserSPNs.py -request -dc-ip 10.10.10.10 corp.local/user');
        }
        break;

      // Module A06 Command
      case 'obfuscate':
        if (!checkLessonContext(['A06'], 'obfuscate')) break;
        if (args.includes('xor') && args.includes('--payload')) {
          term.writeln('[+] Initializing payload obfuscation manager...');
          term.writeln('[+] Encrypting shellcode.bin using XOR key 0x5A...');
          term.writeln('[+] Static file signature bypassed. Running payload in-memory...');
          term.writeln('\x1b[32m[+] Execution successful! Shell active.\x1b[0m');
          term.writeln('Flag: \x1b[1;32mflag{av_bypass_in_memory}\x1b[0m');
        } else {
          term.writeln('Usage: obfuscate --payload shellcode.bin --method xor --key 0x5A');
        }
        break;

      // Custom run command inside M07 and M08 root exploit
      case '/usr/bin/find':
        if (lesson && (lesson.id === 'M07' || lesson.id === 'M08')) {
          const execIndex = args.indexOf('-exec');
          if (execIndex !== -1 && (args.includes('/bin/sh') || args.includes('/bin/sh -p') || args.includes('\\;'))) {
            isRootShellRef.current = true;
            term.writeln('[+] Spawning shell as ROOT user...');
          } else {
            term.writeln('/usr/bin/find: path required');
          }
        } else {
          term.writeln('bash: /usr/bin/find: permission denied');
        }
        break;

      // Custom commands inside root shell M07 / M08
      case 'exit':
        if (isRootShellRef.current) {
          isRootShellRef.current = false;
          term.writeln('Exiting root shell.');
        } else {
          term.writeln('logout');
        }
        break;

      default:
        // Handle root shell commands
        if (isRootShellRef.current) {
          if (command === 'whoami') {
            term.writeln('root');
          } else if (command === 'cat' && (args[0] === '/root/flag.txt' || args[0] === 'flag.txt')) {
            if (lesson && lesson.id === 'M07') {
              term.writeln('flag{suid_root_escalation}');
            } else {
              term.writeln('flag{mediator_boss_defeated}');
            }
          } else if (command === 'ls') {
            term.writeln('flag.txt');
          } else {
            term.writeln(`sh: ${command}: command not found`);
          }
        } else {
          term.writeln(`\x1b[31mbash: ${command}: command not found\x1b[0m`);
        }
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
